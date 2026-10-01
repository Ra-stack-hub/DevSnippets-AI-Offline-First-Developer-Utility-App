import * as SQLite from 'expo-sqlite';
import { Snippet } from '../types';

export const db = SQLite.openDatabaseSync('devsnippets.db');

export const getDb = () => db;

export const initDb = async (database?: SQLite.SQLiteDatabase) => {
  const dbToUse = database || db;
  await dbToUse.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS snippets (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      code TEXT NOT NULL,
      language TEXT NOT NULL,
      tags TEXT NOT NULL,
      isFavorite INTEGER NOT NULL DEFAULT 0,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );
  `);
};

export const insertSnippet = async (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => {
  const db = getDb();
  const id = Math.random().toString(36).substring(2, 15);
  const now = Date.now();
  
  await db.runAsync(
    'INSERT INTO snippets (id, title, code, language, tags, isFavorite, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    id, snippet.title, snippet.code, snippet.language, snippet.tags, snippet.isFavorite ? 1 : 0, now, now
  );
  return id;
};

export const getSnippets = async (): Promise<Snippet[]> => {
  const db = getDb();
  const allRows = await db.getAllAsync('SELECT * FROM snippets ORDER BY createdAt DESC');
  
  return allRows.map((row: any) => ({
    ...row,
    isFavorite: row.isFavorite === 1
  })) as Snippet[];
};

export const getSnippetById = async (id: string): Promise<Snippet | null> => {
  const db = getDb();
  const row: any = await db.getFirstAsync('SELECT * FROM snippets WHERE id = ?', id);
  if (!row) return null;
  return {
    ...row,
    isFavorite: row.isFavorite === 1
  } as Snippet;
};

export const updateSnippet = async (id: string, snippet: Partial<Snippet>) => {
  const db = getDb();
  const now = Date.now();
  const currentSnippet = await getSnippetById(id);
  if (!currentSnippet) throw new Error('Snippet not found');

  const updated = { ...currentSnippet, ...snippet, updatedAt: now };

  await db.runAsync(
    'UPDATE snippets SET title = ?, code = ?, language = ?, tags = ?, isFavorite = ?, updatedAt = ? WHERE id = ?',
    updated.title, updated.code, updated.language, updated.tags, updated.isFavorite ? 1 : 0, updated.updatedAt, id
  );
};

export const toggleFavorite = async (id: string, isFavorite: boolean) => {
  const db = getDb();
  const now = Date.now();
  await db.runAsync(
    'UPDATE snippets SET isFavorite = ?, updatedAt = ? WHERE id = ?',
    isFavorite ? 1 : 0, now, id
  );
};

export const deleteSnippet = async (id: string) => {
  const db = getDb();
  await db.runAsync('DELETE FROM snippets WHERE id = ?', id);
};
