export interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  tags: string; // Stored as comma-separated string in DB, but could be parsed to array in UI
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}
