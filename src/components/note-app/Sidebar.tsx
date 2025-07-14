import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Folder, 
  FileText, 
  Tag, 
  Settings, 
  Star,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Trash2,
  Pencil,
  Palette,
  Undo2,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Note, Folder as FolderType } from '@/types/noteTypes';
import { useNoteStore } from '@/stores/noteStore';
import { cn } from '@/lib/utils';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  folders: FolderType[];
  notes: Note[];
  currentNote: Note | null;
  onNewNote: () => void;
  onSelectNote: (note: Note) => void;
  onViewChange: (view: 'editor' | 'search' | 'settings' | 'trash') => void;
  activeView: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  folders,
  notes,
  currentNote,
  onNewNote,
  onSelectNote,
  onViewChange,
  activeView
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFolders, setShowFolders] = useState(true);
  const [showRecentNotes, setShowRecentNotes] = useState(true);
  const { selectNote, createFolder, deleteFolder, updateNote, deleteNote, restoreNote, purgeTrashedNotes, deleteNotePermanently, restoreFolder, deleteFolderPermanently } = useNoteStore();
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderToDelete, setFolderToDelete] = useState<FolderType | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [dragOverRecents, setDragOverRecents] = useState(false);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [colorPickerNoteId, setColorPickerNoteId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  useEffect(() => { purgeTrashedNotes(); }, []);

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const recentNotes = notes
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10);

  const favoriteNotes = notes.filter(note => note.isFavorite);

  // Helper: get notes for a folder
  const getNotesInFolder = (folderId: string) => notes.filter(note => note.folderId === folderId);
  const unfiledNotes = notes.filter(note => !note.folderId);

  const trashedNotes = notes.filter(note => note.deletedAt).sort((a, b) => new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime());
  const trashedFolders = folders.filter(folder => folder.deletedAt).sort((a, b) => new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime());

  const handleSelectNote = (note: Note) => {
    selectNote(note.id);
    onSelectNote(note);
  };

  const handleNewFolder = () => {
    setFolderDialogOpen(true);
  };
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName('');
      setFolderDialogOpen(false);
    }
  };

  const handleFolderNameSave = (folder: FolderType) => {
    if (editingValue.trim() !== folder.name) {
      if (typeof useNoteStore.getState().updateFolder === 'function') {
        useNoteStore.getState().updateFolder(folder.id, { name: editingValue.trim() });
    }
    }
    setEditingFolderId(null);
    setEditingValue('');
  };

  const handleNoteTitleSave = (note: Note) => {
    if (editingValue.trim() !== note.title) {
      updateNote(note.id, { title: editingValue.trim() });
    }
    setEditingNoteId(null);
    setEditingValue('');
  };

  // Helper for rendering a note row (used in both folders and recents)
  const renderNoteRow = (note: Note) => (
    <Tooltip key={note.id}>
      <TooltipTrigger asChild>
        {editingNoteId === note.id ? (
          <input
            ref={inputRef}
            className="text-sm font-medium w-full bg-transparent border-b border-blue-400 outline-none px-1"
            value={editingValue}
            autoFocus
            onChange={e => setEditingValue(e.target.value)}
            onBlur={() => handleNoteTitleSave(note)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleNoteTitleSave(note);
              if (e.key === 'Escape') { setEditingNoteId(null); setEditingValue(''); }
            }}
          />
        ) : (
          <div
            className="flex items-center justify-between group/sidebar-row w-full py-2 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
            draggable
            onDragStart={e => e.dataTransfer.setData('noteId', note.id)}
          >
            <span className="flex-1 min-w-0" onClick={() => handleSelectNote(note)}>
              <div className="relative flex items-center">
                {note.color && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-slate-300 dark:border-slate-700" style={{ backgroundColor: note.color, zIndex: 0 }} />
                )}
                <span className="relative truncate text-sm font-medium pl-5" style={{ zIndex: 1 }}>{note.title}</span>
              </div>
              <div className="truncate text-xs text-slate-500">Created {new Date(note.createdAt).toLocaleDateString()}</div>
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {note.tags.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      #{tag}
                    </span>
                  ))}
                  {note.tags.length > 2 && (
                    <span className="text-xs text-slate-400">+{note.tags.length - 2}</span>
                  )}
                </div>
              )}
            </span>
            {/* Color picker icon and popover */}
            <div className="relative group ml-2">
              <button
                className="opacity-0 group-hover/sidebar-row:opacity-100 transition-opacity text-slate-400 hover:text-blue-500 p-1"
                title="Change note color"
                tabIndex={-1}
                onClick={e => {
                  e.stopPropagation();
                  setColorPickerNoteId(colorPickerNoteId === note.id ? null : note.id);
                }}
                onMouseDown={e => e.preventDefault()}
              >
                <Palette className="h-4 w-4" />
              </button>
              {colorPickerNoteId === note.id && (
                <div className="absolute left-1/2 -translate-x-1/2 top-6 z-20 w-80 max-w-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow p-2">
                  <div className="flex gap-2 overflow-x-auto flex-nowrap min-w-[600px] py-1 px-1 scrollbar">
                    {["#ef4444","#f59e42","#fbbf24","#22c55e","#3b82f6","#a855f7","#64748b","#eab308","#f472b6","#14b8a6","#0ea5e9","#6d28d9","#334155","#f1f5f9",
                      "#be185d","#db2777","#f43f5e","#f97316","#fde68a","#bbf7d0","#4ade80","#22d3ee","#818cf8","#a21caf","#facc15","#b91c1c","#0f172a","#fff","#000"
                    ].map(c => (
                      <button
                        key={c}
                        className="w-5 h-5 rounded-full border-2 border-white hover:border-slate-400 focus:outline-none"
                        style={{ backgroundColor: c, boxShadow: note.color === c ? '0 0 0 2px #2563eb' : undefined, border: c === '#fff' ? '1px solid #94a3b8' : undefined }}
                        onClick={e => {
                          e.stopPropagation();
                          updateNote(note.id, { color: c });
                          setColorPickerNoteId(null);
                        }}
                        tabIndex={-1}
                      />
                    ))}
                    <button
                      className="w-5 h-5 rounded-full border-2 border-white hover:border-slate-400 focus:outline-none"
                      style={{ backgroundColor: 'transparent', border: '1px dashed #cbd5e1' }}
                      onClick={e => {
                        e.stopPropagation();
                        updateNote(note.id, { color: '' });
                        setColorPickerNoteId(null);
                      }}
                      title="No color"
                      tabIndex={-1}
                    />
                  </div>
                </div>
              )}
            </div>
            {/* Pencil icon for editing title */}
            <button
              className="ml-2 opacity-0 group-hover/sidebar-row:opacity-100 transition-opacity text-slate-400 hover:text-blue-500"
              title="Edit note title"
              tabIndex={-1}
              onClick={e => {
                e.stopPropagation();
                setEditingNoteId(note.id);
                setEditingValue(note.title);
              }}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              className="ml-2 opacity-0 group-hover/sidebar-row:opacity-100 transition-opacity text-red-500 hover:text-red-700"
              title="Delete note"
              tabIndex={-1}
              onClick={e => {
                e.stopPropagation();
                setNoteToDelete(note);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </TooltipTrigger>
    </Tooltip>
  );

  return (
    <TooltipProvider>
      <div className={cn(
        "bg-white dark:bg-slate-800 border-r-0 border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 h-full overflow-hidden",
        collapsed ? "w-16" : "w-80"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between flex-shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="flex-shrink-0"
              >
                {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{collapsed ? 'Expand sidebar' : 'Collapse sidebar'}</p>
            </TooltipContent>
          </Tooltip>
          
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                Notes
              </h1>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onNewNote}
                    className="flex-shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create new note</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        {!collapsed && (
          <>
            {/* Search */}
            <div className="p-4 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="px-4 mb-4 flex-shrink-0">
              <div className="space-y-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeView === 'editor' ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => onViewChange('editor')}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Editor
                    </Button>
                  </TooltipTrigger>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeView === 'search' ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => onViewChange('search')}
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </Button>
                  </TooltipTrigger>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeView === 'settings' ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => onViewChange('settings')}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                  </TooltipTrigger>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeView === 'trash' ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => onViewChange('trash')}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Trash
                    </Button>
                  </TooltipTrigger>
                </Tooltip>
              </div>
            </div>

            <ScrollArea className="flex-1 px-4">
              <div className="pb-4 space-y-6">
                {activeView === 'trash' ? (
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Trash2 className="h-5 w-5" />
                      <span className="text-base font-semibold text-slate-800 dark:text-slate-100">Trash</span>
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mb-4">Deleted notes and folders will appear here for 30 days</div>
                    {trashedFolders.length === 0 && trashedNotes.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 dark:text-slate-500">
                        <Trash2 className="h-10 w-10 mb-2" />
                        <div className="font-medium text-base">No items in Trash</div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {trashedFolders.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Folders</div>
                            <div className="space-y-3">
                              {trashedFolders.map(folder => (
                                <div
                                  key={folder.id}
                                  className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm px-4 py-3 transition hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <Folder className="h-4 w-4 text-slate-400" />
                                      <span className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{folder.name}</span>
                                    </div>
                                    <div className="truncate text-xs text-slate-500 mt-1">Deleted {folder.deletedAt && new Date(folder.deletedAt).toLocaleDateString()}</div>
                                  </div>
                                  <div className="flex items-center gap-2 ml-4">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          className="p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900 text-green-600 hover:text-green-800 transition"
                                          onClick={() => restoreFolder(folder.id)}
                                        >
                                          <Undo2 className="h-4 w-4" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>Restore</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-500 hover:text-red-700 transition"
                                          onClick={() => { deleteFolderPermanently(folder.id); setTimeout(() => purgeTrashedNotes(), 100); }}
                                        >
                                          <XCircle className="h-4 w-4" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>Delete Forever</TooltipContent>
                                    </Tooltip>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {trashedNotes.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Notes</div>
                            <div className="space-y-3">
                              {trashedNotes.map(note => (
                                <div
                                  key={note.id}
                                  className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm px-4 py-3 transition hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      {note.color && (
                                        <span className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-700" style={{ backgroundColor: note.color }} />
                                      )}
                                      <span className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{note.title}</span>
                                    </div>
                                    <div className="truncate text-xs text-slate-500 mt-1">Deleted {note.deletedAt && new Date(note.deletedAt).toLocaleDateString()}</div>
                                  </div>
                                  <div className="flex items-center gap-2 ml-4">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          className="p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900 text-green-600 hover:text-green-800 transition"
                                          onClick={() => restoreNote(note.id)}
                                        >
                                          <Undo2 className="h-4 w-4" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>Restore</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-500 hover:text-red-700 transition"
                                          onClick={() => { deleteNotePermanently(note.id); setTimeout(() => purgeTrashedNotes(), 100); }}
                                        >
                                          <XCircle className="h-4 w-4" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>Delete Forever</TooltipContent>
                                    </Tooltip>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Favorites */}
                    {favoriteNotes.length > 0 && (
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Favorites
                          </span>
                        </div>
                        <div className="space-y-1">
                          {favoriteNotes.map(note => (
                            <Tooltip key={note.id}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant={currentNote?.id === note.id ? 'secondary' : 'ghost'}
                                  className="w-full justify-start text-left h-auto py-2"
                                  onClick={() => handleSelectNote(note)}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="truncate text-sm font-medium">
                                      {note.title}
                                    </div>
                                    <div className="truncate text-xs text-slate-500">
                                      {new Date(note.updatedAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                </Button>
                              </TooltipTrigger>
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Folders */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                            <button
                              onClick={() => setShowFolders(!showFolders)}
                              className="flex items-center space-x-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                            >
                              {showFolders ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <Folder className="h-4 w-4" />
                              <span>Folders</span>
                            </button>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleNewFolder}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Create new folder</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      
                      {showFolders && (
                        <div className="space-y-1">
                          {folders.filter(folder => !folder.deletedAt).map(folder => {
                            const isOpen = openFolders[folder.id] ?? true;
                            return (
                              <div
                                key={folder.id}
                                onDragOver={e => {
                                  e.preventDefault();
                                  setDragOverFolderId(folder.id);
                                }}
                                onDragLeave={e => {
                                  if (dragOverFolderId === folder.id) setDragOverFolderId(null);
                                }}
                                onDrop={e => {
                                  const noteId = e.dataTransfer.getData('noteId');
                                  if (noteId) updateNote(noteId, { folderId: folder.id });
                                  setDragOverFolderId(null);
                                }}
                                className={cn(
                                  'rounded transition-colors',
                                  dragOverFolderId === folder.id && 'bg-blue-100 dark:bg-blue-900',
                                )}
                              >
                                <Tooltip>
                              <TooltipTrigger asChild>
                                    <div
                                      className={cn(
                                        'flex items-center space-x-2 py-1 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer group group/sidebar-row',
                                        dragOverFolderId === folder.id && 'bg-blue-100 dark:bg-blue-900',
                                      )}
                                      onClick={() => setOpenFolders(f => ({ ...f, [folder.id]: !isOpen }))}
                                    >
                                      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                      <Folder className={cn('h-4 w-4', isOpen ? 'text-slate-400' : 'text-slate-300')} />
                                      {editingFolderId === folder.id ? (
                                        <input
                                          ref={inputRef}
                                          className="text-sm text-slate-600 dark:text-slate-400 flex-1 bg-transparent border-b border-blue-400 outline-none px-1"
                                          value={editingValue}
                                          autoFocus
                                          onChange={e => setEditingValue(e.target.value)}
                                          onBlur={() => handleFolderNameSave(folder)}
                                          onKeyDown={e => {
                                            if (e.key === 'Enter') handleFolderNameSave(folder);
                                            if (e.key === 'Escape') { setEditingFolderId(null); setEditingValue(''); }
                                          }}
                                        />
                                      ) : (
                                        <>
                                          <span className="flex-1 text-sm text-slate-600 dark:text-slate-400 truncate">{folder.name}</span>
                                          <div className="flex items-center gap-2 ml-2 opacity-0 group-hover/sidebar-row:opacity-100 transition-opacity">
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <button
                                                  className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 text-slate-400 hover:text-blue-500 transition"
                                                  onClick={e => {
                                                    e.stopPropagation();
                                                    setEditingFolderId(folder.id);
                                                    setEditingValue(folder.name);
                                                  }}
                                                >
                                                  <Pencil className="h-4 w-4" />
                                                </button>
                                              </TooltipTrigger>
                                              <TooltipContent>Edit</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <button
                                                  className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-500 hover:text-red-700 transition"
                                                  onClick={e => {
                                                    e.stopPropagation();
                                                    setFolderToDelete(folder);
                                                  }}
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </button>
                                              </TooltipTrigger>
                                              <TooltipContent>Delete</TooltipContent>
                                            </Tooltip>
                                          </div>
                                        </>
                                      )}
                                </div>
                              </TooltipTrigger>
                            </Tooltip>
                                {/* Notes in this folder */}
                                {isOpen && (
                                  <div className="pl-6">
                                    {getNotesInFolder(folder.id).filter(note => !note.deletedAt).map(note => renderNoteRow(note))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Recent Notes */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setShowRecentNotes(!showRecentNotes)}
                            className="flex items-center space-x-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 mb-2"
                          onDragOver={e => {
                            e.preventDefault();
                            setDragOverRecents(true);
                          }}
                          onDragLeave={e => setDragOverRecents(false)}
                          onDrop={e => {
                            const noteId = e.dataTransfer.getData('noteId');
                            console.log('Dropped note on Recents HEADER:', noteId);
                            if (noteId) {
                              console.log('Calling updateNote to remove folderId from note (header):', noteId);
                              updateNote(noteId, { folderId: undefined });
                            }
                            setDragOverRecents(false);
                          }}
                          >
                            {showRecentNotes ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <FileText className="h-4 w-4" />
                            <span>Recent Notes</span>
                          </button>
                        </TooltipTrigger>
                      </Tooltip>
                      {showRecentNotes && (
                      <div
                        className={cn(
                          'space-y-1 rounded transition-colors',
                          dragOverRecents && 'bg-blue-100 dark:bg-blue-900',
                        )}
                        onDragOver={e => {
                          e.preventDefault();
                          setDragOverRecents(true);
                        }}
                        onDragLeave={e => setDragOverRecents(false)}
                        onDrop={e => {
                          const noteId = e.dataTransfer.getData('noteId');
                          if (noteId) updateNote(noteId, { folderId: undefined });
                          setDragOverRecents(false);
                        }}
                      >
                        {(searchQuery ? filteredNotes : recentNotes).filter(note => !note.folderId && !note.deletedAt).map(note => renderNoteRow(note))}
    </div>
)}

                  </>
                )}
              </div>
            </ScrollArea>
          </>
        )}

        {collapsed && (
          <div className="p-2 space-y-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeView === 'editor' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => onViewChange('editor')}
                  className="w-full"
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Editor</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeView === 'search' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => onViewChange('search')}
                  className="w-full"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Search</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeView === 'settings' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => onViewChange('settings')}
                  className="w-full"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeView === 'trash' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => onViewChange('trash')}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Trash</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNewNote}
                  className="w-full"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>New note</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <input
            className="w-full border rounded px-3 py-2 mt-2"
            placeholder="Folder name"
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); }}
            autoFocus
          />
          <DialogFooter>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              Create
            </Button>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Folder Delete Confirmation Dialog */}
      <AlertDialog open={!!folderToDelete} onOpenChange={open => { if (!open) setFolderToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to move the folder "{folderToDelete?.name}" to Trash?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFolderToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (folderToDelete) { deleteFolder(folderToDelete.id); setFolderToDelete(null); } }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Note Delete Confirmation Dialog */}
      <AlertDialog open={!!noteToDelete} onOpenChange={open => { if (!open) setNoteToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to move the note "{noteToDelete?.title}" to Trash?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNoteToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (noteToDelete) { deleteNote(noteToDelete.id); setNoteToDelete(null); } }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
};
