
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Note, Folder, Tag, Template, AppSettings } from '@/types/noteTypes';
import { v4 as uuidv4 } from 'uuid';

interface NoteStore {
  notes: Note[];
  folders: Folder[];
  tags: Tag[];
  templates: Template[];
  currentNote: Note | null;
  settings: AppSettings;
  
  // Actions
  initializeStore: () => void;
  createNote: (title: string, content: string, folderId?: string) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  restoreNote: (id: string) => void;
  purgeTrashedNotes: () => void;
  deleteNotePermanently: (id: string) => void;
  
  createFolder: (name: string, parentId?: string) => Folder;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  restoreFolder: (id: string) => void;
  deleteFolderPermanently: (id: string) => void;
  
  addTag: (name: string, color: string) => Tag;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  
  createTemplate: (name: string, content: string, description: string, category: string) => Template;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  
  updateSettings: (updates: Partial<AppSettings>) => void;
  
  searchNotes: (query: string) => Note[];
  getNotesInFolder: (folderId: string) => Note[];
  getNotesByTag: (tagName: string) => Note[];
}

const defaultSettings: AppSettings = {
  theme: 'light',
  editorMode: 'split',
  fontSize: 14,
  fontFamily: 'Inter',
  lineHeight: 1.6,
  showLineNumbers: false,
  autoSave: true,
  autoSaveInterval: 2000,
};

const sampleTemplates: Template[] = [
  {
    id: 'meeting-template',
    name: 'Meeting Notes',
    content: `# Meeting Notes - {{date}}

## Attendees
- 

## Agenda
1. 
2. 
3. 

## Discussion Points

### Topic 1


### Topic 2


## Action Items
- [ ] 
- [ ] 

## Next Steps

`,
    description: 'Template for meeting notes with structured sections',
    category: 'Work'
  },
  {
    id: 'daily-journal',
    name: 'Daily Journal',
    content: `# {{date}}

## Morning Reflection
How am I feeling today?

## Goals for Today
- [ ] 
- [ ] 
- [ ] 

## Gratitude
1. 
2. 
3. 

## Evening Review
What went well today?

What could I improve?

## Tomorrow's Priorities
- 
- 
- 
`,
    description: 'Daily journal template for reflection and planning',
    category: 'Personal'
  }
];

export const useNoteStore = create<NoteStore>()(
  persist(
    (set, get) => ({
      notes: [],
      folders: [],
      tags: [],
      templates: sampleTemplates,
      currentNote: null,
      settings: defaultSettings,

      initializeStore: () => {
        const state = get();
        if (state.notes.length === 0) {
          // Create initial welcome note
          const welcomeNote: Note = {
            id: uuidv4(),
            title: 'Welcome to MarkdownNotes',
            content: `# Welcome to MarkdownNotes 📝

This is your new markdown-based note-taking application. Here's what you can do:

## Features
- **Rich Markdown Support**: Write with full markdown syntax
- **Organize with Folders**: Create nested folder structures
- **Tag System**: Tag your notes for easy filtering
- **Powerful Search**: Find anything instantly
- **Templates**: Use templates for common note types
- **Live Preview**: See your formatted text in real-time

## Getting Started
1. Create your first note using the + button
2. Organize notes into folders
3. Use tags like #important #work #personal
4. Try the search feature
5. Explore templates for common formats

## Markdown Syntax
- **Bold text** with \`**text**\`
- *Italic text* with \`*text*\`
- [Links](https://example.com)
- \`inline code\`
- Lists with \`-\` or \`1.\`

Happy note-taking! 🚀`,
            tags: ['welcome', 'getting-started'],
            createdAt: new Date(),
            updatedAt: new Date(),
            linkedNotes: [],
            isFavorite: false,
            wordCount: 0
          };
          
          set(state => ({
            notes: [welcomeNote],
            currentNote: welcomeNote
          }));
        }
      },

      createNote: (title: string, content: string, folderId?: string) => {
        const newNote: Note = {
          id: uuidv4(),
          title,
          content,
          tags: [],
          folderId,
          createdAt: new Date(),
          updatedAt: new Date(),
          linkedNotes: [],
          isFavorite: false,
          wordCount: content.split(/\s+/).length
        };
        
        set(state => ({
          notes: [...state.notes, newNote],
          currentNote: newNote
        }));
        
        return newNote;
      },

      updateNote: (id: string, updates: Partial<Note>) => {
        set(state => ({
          notes: state.notes.map(note => 
            note.id === id 
              ? { 
                  ...note, 
                  ...updates,
                  updatedAt: new Date(),
                  wordCount: updates.content ? updates.content.split(/\s+/).length : note.wordCount
                }
              : note
          ),
          currentNote: state.currentNote?.id === id 
            ? { ...state.currentNote, ...updates, updatedAt: new Date() }
            : state.currentNote
        }));
      },

      deleteNote: (id: string) => {
        set(state => ({
          notes: state.notes.map(note =>
            note.id === id ? { ...note, deletedAt: new Date() } : note
          ),
          currentNote: state.currentNote?.id === id ? null : state.currentNote
        }));
      },

      deleteNotePermanently: (id: string) => {
        set(state => ({
          notes: state.notes.filter(note => note.id !== id),
          currentNote: state.currentNote?.id === id ? null : state.currentNote
        }));
      },

      restoreNote: (id: string) => {
        set(state => ({
          notes: state.notes.map(note =>
            note.id === id ? { ...note, deletedAt: undefined } : note
          )
        }));
      },

      purgeTrashedNotes: () => {
        set(state => ({
          notes: state.notes.filter(note => !note.deletedAt),
          folders: state.folders.filter(folder => !folder.deletedAt)
        }));
      },

      selectNote: (id: string) => {
        const note = get().notes.find(n => n.id === id);
        if (note) {
          set({ currentNote: note });
        }
      },

      createFolder: (name: string, parentId?: string) => {
        const newFolder: Folder = {
          id: uuidv4(),
          name,
          parentId,
          children: [],
          createdAt: new Date(),
          isExpanded: true
        };
        
        set(state => ({
          folders: [...state.folders, newFolder]
        }));
        
        return newFolder;
      },

      updateFolder: (id: string, updates: Partial<Folder>) => {
        set(state => ({
          folders: state.folders.map(folder =>
            folder.id === id ? { ...folder, ...updates } : folder
          )
        }));
      },

      deleteFolder: (id: string) => {
        const trashFolderAndChildren = (folders: Folder[], folderId: string, date: Date): Folder[] =>
          folders.map(folder =>
            folder.id === folderId
              ? { ...folder, deletedAt: date }
              : folder.parentId === folderId
                ? { ...folder, deletedAt: date }
                : folder
          );
        const now = new Date();
        set(state => ({
          folders: trashFolderAndChildren(state.folders, id, now),
          notes: state.notes.map(note =>
            note.folderId === id ? { ...note, folderId: undefined } : note
          )
        }));
      },

      restoreFolder: (id: string) => {
        set(state => ({
          folders: state.folders.map(folder =>
            folder.id === id ? { ...folder, deletedAt: undefined } : folder
          )
        }));
      },

      deleteFolderPermanently: (id: string) => {
        set(state => ({
          folders: state.folders.filter(folder => folder.id !== id),
        }));
      },

      addTag: (name: string, color: string) => {
        const newTag: Tag = {
          id: uuidv4(),
          name,
          color,
          count: 0
        };
        
        set(state => ({
          tags: [...state.tags, newTag]
        }));
        
        return newTag;
      },

      updateTag: (id: string, updates: Partial<Tag>) => {
        set(state => ({
          tags: state.tags.map(tag =>
            tag.id === id ? { ...tag, ...updates } : tag
          )
        }));
      },

      deleteTag: (id: string) => {
        set(state => ({
          tags: state.tags.filter(tag => tag.id !== id)
        }));
      },

      createTemplate: (name: string, content: string, description: string, category: string) => {
        const newTemplate: Template = {
          id: uuidv4(),
          name,
          content,
          description,
          category
        };
        
        set(state => ({
          templates: [...state.templates, newTemplate]
        }));
        
        return newTemplate;
      },

      updateTemplate: (id: string, updates: Partial<Template>) => {
        set(state => ({
          templates: state.templates.map(template =>
            template.id === id ? { ...template, ...updates } : template
          )
        }));
      },

      deleteTemplate: (id: string) => {
        set(state => ({
          templates: state.templates.filter(template => template.id !== id)
        }));
      },

      updateSettings: (updates) => {
        set(state => {
          const newSettings = { ...state.settings, ...updates };
          if (updates.theme) {
            localStorage.setItem('note-app-theme', updates.theme);
          }
          return { settings: newSettings };
        });
      },

      searchNotes: (query: string) => {
        const { notes } = get();
        if (!query.trim()) return notes;
        
        return notes.filter(note => 
          note.title.toLowerCase().includes(query.toLowerCase()) ||
          note.content.toLowerCase().includes(query.toLowerCase()) ||
          note.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
      },

      getNotesInFolder: (folderId: string) => {
        return get().notes.filter(note => note.folderId === folderId);
      },

      getNotesByTag: (tagName: string) => {
        return get().notes.filter(note => note.tags.includes(tagName));
      }
    }),
    {
      name: 'markdown-notes-storage'
    }
  )
);
