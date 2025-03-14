/**
 * IndexedDB utility for persisting list configurations
 */

const DB_NAME = "ListComparisonDB";
const DB_VERSION = 1;
const STORE_NAME = "configurations";

// Initialize the database
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject("Error opening IndexedDB: " + event.target.errorCode);
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      // Create object store for saved configurations
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };
  });
};

// Save a configuration with a name
export const saveConfiguration = async (name, data) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      // The data to save
      const config = {
        name,
        data,
        timestamp: new Date().getTime(),
      };

      const request = store.add(config);

      request.onsuccess = () => resolve({ success: true, id: request.result });
      request.onerror = () => reject("Error saving configuration");
    });
  } catch (error) {
    console.error("DB error:", error);
    throw error;
  }
};

// Get all saved configurations
export const getAllConfigurations = async () => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject("Error getting configurations");
    });
  } catch (error) {
    console.error("DB error:", error);
    throw error;
  }
};

// Load a specific configuration by ID
export const loadConfiguration = async (id) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
        } else {
          reject("Configuration not found");
        }
      };
      request.onerror = () => reject("Error loading configuration");
    });
  } catch (error) {
    console.error("DB error:", error);
    throw error;
  }
};

// Delete a configuration by ID
export const deleteConfiguration = async (id) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve({ success: true });
      request.onerror = () => reject("Error deleting configuration");
    });
  } catch (error) {
    console.error("DB error:", error);
    throw error;
  }
};
