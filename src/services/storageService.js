// IndexedDB storage service untuk menyimpan berkas PDF publikasi dan preferensi admin

const DB_NAME = 'BukuYasinDB';
const DB_VERSION = 1;
const STORE_NAME = 'pdf_store';
const KEY_ACTIVE_PDF = 'active_publication_pdf';
const KEY_METADATA = 'publication_metadata';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveActivePdf(arrayBuffer, meta = {}) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // Kloning buffer agar aman disimpan di IndexedDB
    const cleanBuffer = arrayBuffer instanceof ArrayBuffer ? arrayBuffer.slice(0) : arrayBuffer;

    const record = {
      buffer: cleanBuffer,
      name: meta.name || 'Dokumen_Yasin.pdf',
      size: cleanBuffer.byteLength || 0,
      updatedAt: new Date().toISOString(),
      title: meta.title || 'Surat Yasin dan Tahlil',
      dedication: meta.dedication || 'Mengenang Almarhum / Almarhumah',
    };

    store.put(record, KEY_ACTIVE_PDF);

    tx.oncomplete = () => resolve(record);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getActivePdf() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(KEY_ACTIVE_PDF);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function clearActivePdf() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(KEY_ACTIVE_PDF);

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export function getAdminPin() {
  return localStorage.getItem('yasin_admin_pin') || '123456';
}

export function setAdminPin(newPin) {
  localStorage.setItem('yasin_admin_pin', newPin);
}
