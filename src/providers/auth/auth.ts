import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import superlogin from 'superlogin-client';
import { Http, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Storage } from '@ionic/storage';
import _ from 'lodash';
import Raven from "raven-js";

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

import { DbProvider } from '../db/db';
import { Config } from '../config/config';

@Injectable()
export class AuthProvider {

  private config = {
    // An optional URL to API server, by default a current window location is used.
    serverUrl: Config.SUPERLOGIN_URL,
    // The base URL for the SuperLogin routes with leading and trailing slashes (defaults to '/auth')
    baseUrl: '/auth',
    // Set this to true if you do not want the URL bar host automatically added to the list
    noDefaultEndpoint: false,
    // Where to save your session token: localStorage ('local') or sessionStorage ('session'), default: 'local'
    storage: 'local',
    // Sets when to check if the session is expired during the setup.
    // false by default.
    checkExpired: false,
    // A float that determines the percentage of a session duration, after which SuperLogin will automatically refresh the
    // token. For example if a token was issued at 1pm and expires at 2pm, and the threshold is 0.5, the token will
    // automatically refresh after 1:30pm. When authenticated, the token expiration is automatically checked on every
    // request. You can do this manually by calling superlogin.checkRefresh(). Default: 0.5
    refreshThreshold: 0.5,
    // The number of milliseconds before a request times out
    // If the request takes longer than `timeout`, the request will be aborted.
    // Default is 0, meaning it won't timeout.
    timeout: 0
  };


  constructor(
    private storage: Storage,
    private alertCtrl: AlertController,
    public dbServ: DbProvider,
    private http: Http,
    private util: Config
  ) {
    superlogin.configure(this.config);
  }

  public login(
    credentials: { username: string, password: string }
  ): Promise<any> {
    return superlogin.login(credentials)
  }

  public logout(): Promise<any>{
    let loading = this.util.showLoading();

    return new Promise((resolve, reject)=>{
      this.isOnline()
        .then(res=>{

          if( _.has(res, 'status') && res.status == 'ok' ){
            return superlogin.logout();
          }else{
            throw "El api de autenticacion no esta disponible";
          }
        })
        .then( () => {
          this.removeTokenJosefa().catch(err=>{
            console.error('error al eliminar el token de josefa',err);
            Raven.captureException( new Error(`error al eliminar el token de josefa: ${JSON.stringify(err)}`), {
              extra: err
            } );
          })
          Raven.setUserContext();
          loading.dismiss();
          resolve();
        })
        .catch(err=>{

          loading.dismiss();
          console.error('error en el logout',err);
          Raven.captureException( new Error(`error en el logout: ${JSON.stringify(err)}`), {
            extra: err
          } );
          //if(err.ok == false || err.message == "Network Error"){
            this.alertCtrl.create({
              title: "Ocurrio un error.",
              message: "Debe estar conectado a la red para desconectarse.",
              buttons: ['Ok']
            }).present();
          //}
          reject();
        })

    })
  }

  public register( registerData ): Promise<any>{
    return superlogin.register(registerData)
  }

  public isOnline(): Promise<any> {
    return this.http.get(`${Config.SUPERLOGIN_URL}/ping`)
    .map( (res: Response) => {
      return res.json();
    })
    .toPromise()
  }

  public getTokenJosefa(): Promise<any> {
    let auth: string = 'Basic ' + btoa('admin:admin1234');
    let options:RequestOptions = Config.JOSEFA_OPTIONS(auth);
    let url: string = Config.JOSEFA_URL+'/authenticate';

    return new Promise( (resolve, reject)=>{
      this.http.post(url, "", options)
        .map( (res: Response) => {
          return res.json();
        }).subscribe(
          (res) => {

            this.storage.set('josefa-token', res.data.token)
              .catch(err => reject(err));
            resolve();
          },
          err => {
            reject(new Error(`Error al conectarse con JOSEFA, el api SAP 🐛: ${JSON.stringify(err)}`));
          }
        );
    });

  }

  public validateSession(): Promise<any> {

    return this.isOnline()
      .then(res=>{
        if( _.has(res, 'status') && res.status == 'ok' ){
          return superlogin.validateSession()
        }else{
          throw new Error("El api de autenticacion no esta disponible");
        }
      })
  }

  public removeTokenJosefa(): Promise<any>{
    return this.storage.remove('josefa-token');
  }

  public get isLogged(): boolean {
    return superlogin.authenticated();
  }

  public get dbUrl() : string {
    return superlogin.getDbUrl('supertest');
  }

  public get session() : any {
    return superlogin.getSession();
  }

  /**
   * Me devuelve el id del asesor de IGB que se saca de sap
   *
   * @readonly
   * @type {string}
   * @memberof AuthProvider
   */
  public get asesorId() : string {
    return _.has(this.session, 'profile.asesor_id') ? this.session.profile.asesor_id : '';
  }

  /**
   * me devuelve el id del usuario pero el q se usan en couchdb
   * algo asi como "cristian540"
   *
   * @readonly
   * @type {string}
   * @memberof AuthProvider
   */
  public get userId() : string {
    return _.has(this.session, 'user_id') ? this.session.user_id : '';
  }

  /**
   * Me regresa el email del usuario
   *
   * @readonly
   * @type {string}
   * @memberof AuthProvider
   */
  public get userEmail() : string {
    return _.has(this.session, 'profile.email') ? this.session.profile.email : '';
  }

}
