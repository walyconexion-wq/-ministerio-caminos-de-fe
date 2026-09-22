/**
 * FABRICA DB - MOTOR DE PERSISTENCIA ILIMITADA VIA INDEXEDDB
 * Elimina la restricción de 5MB de localStorage permitiendo guardar
 * gigabytes de videos, audios y avatares en la máquina local sin costo.
 */

const DB_NAME = 'AriMissileFactoryDB';
const DB_VERSION = 1;
const STORE_PROFILES = 'profiles';
const STORE_HISTORY = 'history';

class FabricaDB {
  constructor() {
    this.db = null;
    this.initPromise = this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_PROFILES)) {
          db.createObjectStore(STORE_PROFILES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_HISTORY)) {
          db.createObjectStore(STORE_HISTORY, { keyPath: 'id' });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };

      request.onerror = (e) => {
        console.error('Error inicializando IndexedDB:', e);
        reject(e);
      };
    });
  }

  async getAllProfiles() {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_PROFILES, 'readonly');
      const store = tx.objectStore(STORE_PROFILES);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async saveProfile(profile) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_PROFILES, 'readwrite');
      const store = tx.objectStore(STORE_PROFILES);
      const req = store.put(profile);
      req.onsuccess = () => resolve(profile);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteProfile(id) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_PROFILES, 'readwrite');
      const store = tx.objectStore(STORE_PROFILES);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  async getAllHistory() {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_HISTORY, 'readonly');
      const store = tx.objectStore(STORE_HISTORY);
      const req = store.getAll();
      req.onsuccess = () => {
        const sorted = (req.result || []).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        resolve(sorted);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async saveHistoryItem(item) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_HISTORY, 'readwrite');
      const store = tx.objectStore(STORE_HISTORY);
      const req = store.put(item);
      req.onsuccess = () => resolve(item);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteHistoryItem(id) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_HISTORY, 'readwrite');
      const store = tx.objectStore(STORE_HISTORY);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  async clearAll() {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_PROFILES, STORE_HISTORY], 'readwrite');
      tx.objectStore(STORE_PROFILES).clear();
      tx.objectStore(STORE_HISTORY).clear();
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  async exportCajaNegra() {
    const profiles = await this.getAllProfiles();
    const history = await this.getAllHistory();
    const data = {
      version: '2.5-ANTIGRAVITY',
      exportDate: new Date().toISOString(),
      profiles,
      history
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ARI_CajaNegra_Completa_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async importCajaNegra(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (Array.isArray(parsed.profiles)) {
            for (const p of parsed.profiles) {
              await this.saveProfile(p);
            }
          }
          if (Array.isArray(parsed.history)) {
            for (const h of parsed.history) {
              await this.saveHistoryItem(h);
            }
          }
          resolve({
            profilesCount: parsed.profiles?.length || 0,
            historyCount: parsed.history?.length || 0
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
}

window.fabricaDB = new FabricaDB();
