
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  folderId?: string;
  createdAt: Date;
  updatedAt: Date;
  linkedNotes: string[];
  template?: string;
  isFavorite: boolean;
  wordCount: number;
  color?: string;
  deletedAt?: Date;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  children: string[];
  color?: string;
  createdAt: Date;
  isExpanded: boolean;
  deletedAt?: Date;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface Template {
  id: string;
  name: string;
  content: string;
  description: string;
  category: string;
}

export interface SearchResult {
  note: Note;
  relevance: number;
  highlights: string[];
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  editorMode: 'split' | 'preview' | 'edit';
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  showLineNumbers: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
}
