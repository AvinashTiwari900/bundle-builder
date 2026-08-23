// Minimal IndexedDB wrapper for storing files/blobs and metadata
const DB_NAME = 'rap_db'
const DB_VERSION = 1
const STORE = 'files'

function openDB(){
  return new Promise<IDBDatabase>((resolve, reject)=>{
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = ()=>{
      const db = req.result
      if(!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' })
    }
    req.onsuccess = ()=> resolve(req.result)
    req.onerror = ()=> reject(req.error)
  })
}

export async function saveFileBlob(id:string, name:string, blob:Blob, type?:string){
  const db = await openDB()
  return new Promise<string>((resolve, reject)=>{
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    const item = { id, name, blob, type: type||blob.type, size: blob.size, uploadedAt: new Date().toISOString() }
    const req = store.put(item)
    req.onsuccess = ()=> resolve(id)
    req.onerror = ()=> reject(req.error)
  })
}

export async function saveFile(file: File){
  const id = 'file-'+Date.now()+'-'+Math.random().toString(36).slice(2,6)
  await saveFileBlob(id, file.name, file, file.type)
  return id
}

export async function getFile(id:string){
  const db = await openDB()
  return new Promise<any>((resolve, reject)=>{
    const tx = db.transaction(STORE, 'readonly')
    const store = tx.objectStore(STORE)
    const req = store.get(id)
    req.onsuccess = ()=> resolve(req.result)
    req.onerror = ()=> reject(req.error)
  })
}

export async function deleteFile(id:string){
  const db = await openDB()
  return new Promise<void>((resolve, reject)=>{
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    const req = store.delete(id)
    req.onsuccess = ()=> resolve()
    req.onerror = ()=> reject(req.error)
  })
}
