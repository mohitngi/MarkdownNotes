import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/note-app/Sidebar';
import { Editor } from '@/components/note-app/Editor';
import { SearchPanel } from '@/components/note-app/SearchPanel';
import { SettingsPanel } from '@/components/note-app/SettingsPanel';
import { TrashPanel } from '@/components/note-app/TrashPanel';
import { useNoteStore } from '@/stores/noteStore';
import { Note, Folder } from '@/types/noteTypes';
import { Toaster } from '@/components/ui/toaster';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocation, useNavigate } from 'react-router-dom';

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Map path to view and view to path
  const pathToView = {
    '/': 'editor',
    '/search': 'search',
    '/settings': 'settings',
    '/trash': 'trash',
  };
  const viewToPath = {
    editor: '/',
    search: '/search',
    settings: '/settings',
    trash: '/trash',
  };

  // Set activeView from URL
  const [activeView, setActiveView] = useState<'editor' | 'search' | 'settings' | 'trash'>(pathToView[location.pathname] || 'editor');

  // Update activeView when URL changes
  useEffect(() => {
    setActiveView(pathToView[location.pathname] || 'editor');
  }, [location.pathname]);

  // When user changes section, update URL
  const handleViewChange = (view: 'editor' | 'search' | 'settings' | 'trash') => {
    setActiveView(view);
    navigate(viewToPath[view]);
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteFolder, setNewNoteFolder] = useState<string | undefined>(undefined);
  const { 
    currentNote, 
    folders, 
    notes, 
    initializeStore,
    createNote,
    updateNote,
    deleteNote,
    createFolder,
    selectNote
  } = useNoteStore();

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  const handleNewNote = () => {
    setNoteDialogOpen(true);
  };
  const handleCreateNote = () => {
    if (newNoteTitle.trim()) {
      createNote(newNoteTitle.trim(), '', newNoteFolder);
      setNewNoteTitle('');
      setNewNoteFolder(undefined);
      setNoteDialogOpen(false);
      setActiveView('editor');
    }
  };

  const handleSelectNote = (note: Note) => {
    selectNote(note.id);
    handleViewChange('editor');
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        folders={folders}
        notes={notes}
        currentNote={currentNote}
        onNewNote={handleNewNote}
        onSelectNote={handleSelectNote}
        onViewChange={handleViewChange}
        activeView={activeView}
      />
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
          </DialogHeader>
          <Input
            className="w-full border rounded px-3 py-2 mt-2"
            placeholder="Note title"
            value={newNoteTitle}
            onChange={e => setNewNoteTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreateNote(); }}
            autoFocus
          />
          {folders.length > 0 && (
            <select
              className="w-full border rounded px-3 py-2 mt-2"
              value={newNoteFolder || ''}
              onChange={e => setNewNoteFolder(e.target.value || undefined)}
            >
              <option value="">No Folder</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>{folder.name}</option>
              ))}
            </select>
          )}
          <DialogFooter>
            <Button onClick={handleCreateNote} disabled={!newNoteTitle.trim()}>
              Create
            </Button>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <main className={activeView === 'trash' ? 'flex-1 flex flex-col min-w-0 h-screen overflow-y-auto' : 'flex-1 flex flex-col min-w-0 overflow-hidden'}>
        {activeView === 'editor' && (
          <Editor
            note={currentNote}
            onUpdateNote={updateNote}
            onDeleteNote={deleteNote}
          />
        )}
        
        {activeView === 'search' && (
          <SearchPanel
            notes={notes}
            onSelectNote={handleSelectNote}
          />
        )}
        
        {activeView === 'settings' && (
          <SettingsPanel />
        )}

        {activeView === 'trash' && (
          <TrashPanel />
        )}
      </main>
      
      <Toaster />
    </div>
  );
};

export default Index;
