import PouchDB from "pouchdb";

class DbActions {
  constructor(localDB, remoteDB){
    this.localDB = localDB;
    this.remoteDB = remoteDB;
  }

  replicate() {
    this.localDB.replicate.from(this.remoteDB, { batch_size : 500 })
    .on('change', info => {
      self.postMessage({ event : "change", method: "replicate", info : info })
    })
    .on("complete", info => {
      //Si la primera replicacion se completa con exito sincronizo la db
      //y de vuelvo la info sobre la sincronizacion
      this.sync();
      self.postMessage({ event : "complete", method: "replicate", info : info })
    })
    .on("error", err => {
      //Me preguntare a mi mismo en el futuro por que mierda pongo a sincronizar
      //La base de datos si la primera sincronisacion falla, lo pongo aqui por q
      //si el usuario cierra la app y la vuelve a iniciar, el evento de initdb
      //se ejecutaria de nuevo y si por algun motivo no tiene internet entonces
      // la replicacion nunca se va completar y la base de datos
      //no se va a sincronizar, por eso lo lanzo de nuevo aqui el sync
      this.sync();
      self.postMessage({ event : "error", method: "replicate", info : err })
    });
  }

  sync() {
    let replicationOptions = {
      live       : true,
      retry      : true
    };
    PouchDB.sync(this.localDB, this.remoteDB, replicationOptions)
    .on("denied", err => {
      self.postMessage({ event : "error", method: "sync", info : err })
    })
    .on("error", err => {
      self.postMessage({ event : "error", method: "sync", info : err })
    });
    this.reactToChanges();
  }

  reactToChanges() {
    this.localDB.changes({
      live: true,
      since: 'now',
      include_docs: true
    })
    .on( 'change', change => {
      if (change.deleted) {
        self.postMessage({ event : "deleted", method: "changes", info : change })
      } else { // updated/inserted
        self.postMessage({ event : "upsert", method: "changes", info : change })
      }

    })
    .on( 'error', err => self.postMessage({ event : "error", method: "changes", info : err }));
  }

}

class Producto extends DbActions{
  constructor(localDB, remoteDB){
    super(localDB, remoteDB);
  }
}

self.onmessage = e => {
  //debugger;
  let d = e.data;
  let localDB = new PouchDB(d.local.name, d.local.options);
  let remoteDB = new PouchDB(d.remote.name, d.remote.options);

  switch (d.db) {
    case "productos":
      let productos = new Producto(localDB, remoteDB);
      productos.replicate();
      break;

    default:
      break;
  }

}