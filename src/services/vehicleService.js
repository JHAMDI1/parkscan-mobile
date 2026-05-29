import { getDb } from '../db/database';

export const vehicleService = {
  getAllDrafts: async () => {
    const db = getDb();
    return await db.getAllAsync('SELECT * FROM vehicles WHERE saved = 0 ORDER BY id ASC');
  },

  getAllSaved: async (exportedStatus = 0) => {
    const db = getDb();
    return await db.getAllAsync('SELECT * FROM vehicles WHERE saved = 1 AND exported = ? ORDER BY id DESC', [exportedStatus]);
  },

  markAsExported: async (ids) => {
    if (!ids || ids.length === 0) return;
    const db = getDb();
    // Create placeholders like ?, ?, ?
    const placeholders = ids.map(() => '?').join(',');
    await db.runAsync(`UPDATE vehicles SET exported = 1 WHERE id IN (${placeholders})`, ids);
  },

  addDraft: async (photoUri) => {
    const db = getDb();
    const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const date = new Date().toLocaleDateString('fr-FR');
    
    const result = await db.runAsync(
      'INSERT INTO vehicles (photoUri, time, date, saved) VALUES (?, ?, ?, ?)',
      [photoUri, time, date, 0]
    );
    return result.lastInsertRowId;
  },

  saveDraft: async (id, plate, make, floor) => {
    const db = getDb();
    await db.runAsync(
      'UPDATE vehicles SET plate = ?, make = ?, floor = ?, saved = 1 WHERE id = ?',
      [plate, make || 'غير معروف', floor || '-', id]
    );
  },

  deleteVehicle: async (id) => {
    const db = getDb();
    await db.runAsync('DELETE FROM vehicles WHERE id = ?', [id]);
  },
  
  clearAll: async () => {
    const db = getDb();
    await db.runAsync('DELETE FROM vehicles');
  }
};
