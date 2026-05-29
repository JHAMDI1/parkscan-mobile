import * as SQLite from 'expo-sqlite';

const dbName = 'parkscan.db';
let dbInstance = null;

export const initDB = async () => {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync(dbName);
  
  await dbInstance.execAsync(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      photoUri TEXT NOT NULL,
      plate TEXT,
      make TEXT,
      floor TEXT,
      time TEXT,
      date TEXT,
      saved INTEGER DEFAULT 0,
      exported INTEGER DEFAULT 0
    );
  `);
  
  // Safe migration for existing DB
  try {
    await dbInstance.execAsync(`ALTER TABLE vehicles ADD COLUMN exported INTEGER DEFAULT 0;`);
  } catch (e) {
    // Column already exists
  }
  
  return dbInstance;
};

export const getDb = () => {
  if (!dbInstance) {
    throw new Error("Base de données non initialisée");
  }
  return dbInstance;
};
