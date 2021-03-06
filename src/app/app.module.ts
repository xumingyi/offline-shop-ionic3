import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';// angular <4
import { HttpClientModule } from '@angular/common/http'; // angular >5
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';
import { Network } from '@ionic-native/network';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OneSignal } from '@ionic-native/onesignal';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Geolocation } from '@ionic-native/geolocation';
import { Diagnostic } from '@ionic-native/diagnostic';
import { LocationAccuracy } from '@ionic-native/location-accuracy';

//Pagaes without lazy loading
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { OrdenesPage } from '../pages/ordenes/ordenes'

import { MyApp } from './app.component';
import { CarritoProvider } from '../providers/carrito/carrito';
import { ProductosProvider } from '../providers/productos/productos';
import { UsuarioProvider } from '../providers/usuario/usuario';
import { Config } from '../providers/config/config';
import { ClientesProvider } from '../providers/clientes/clientes';
import { OrdenProvider } from '../providers/orden/orden';
import { AuthProvider } from '../providers/auth/auth';
import { DbProvider } from '../providers/db/db';
import { SentryErrorHandler } from '../providers/error-handler/sentry-errorhandler';
import { PushNotificationProvider } from '../providers/push-notification/push-notification';
import { CarteraProvider } from '../providers/cartera/cartera';
import { GeolocationProvider } from '../providers/geolocation/geolocation';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    OrdenesPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot({
      name: '_ionicstorage',
      driverOrder: ['indexeddb', 'sqlite', 'websql']
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    OrdenesPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Network,
    {provide: ErrorHandler, useClass: SentryErrorHandler},
    CarritoProvider,
    ProductosProvider,
    UsuarioProvider,
    Config,
    ClientesProvider,
    OrdenProvider,
    AuthProvider,
    CarteraProvider,
    DbProvider,
    OneSignal,
    PushNotificationProvider,
    BackgroundMode,
    Geolocation,
    GeolocationProvider,
    Diagnostic,
    LocationAccuracy
  ]
})
export class AppModule {}
