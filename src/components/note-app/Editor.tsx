import React, { useState, useEffect, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link, 
  Image, 
  Code,
  Eye,
  Edit,
  Columns,
  Save,
  Star,
  MoreHorizontal,
  Tag,
  Calendar,
  FileText,
  Trash2,
  Loader,
  Palette,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Note } from '@/types/noteTypes';
import { MarkdownPreview } from './MarkdownPreview';
import { cn } from '@/lib/utils';
import { useNoteStore } from '@/stores/noteStore';
import { toast } from '@/hooks/use-toast';

interface EditorProps {
  note: Note | null;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
}

export const Editor: React.FC<EditorProps> = ({
  note,
  onUpdateNote,
  onDeleteNote
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSavedBadge, setShowSavedBadge] = useState(false);
  const saveBtnRef = useRef<HTMLButtonElement>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { settings, updateSettings } = useNoteStore();
  const [color, setColor] = useState<string | undefined>(note?.color);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags);
      setColor(note.color);
    } else {
      setTitle('');
      setContent('');
      setTags([]);
      setColor(undefined);
    }
  }, [note]);

  useEffect(() => {
    if (!note || !settings.autoSave) return;

    const timeoutId = setTimeout(async () => {
      if (title !== note.title || content !== note.content || JSON.stringify(tags) !== JSON.stringify(note.tags)) {
        setIsSaving(true);
        
        onUpdateNote(note.id, {
          title: title || 'Untitled',
          content,
          tags
        });
        
        setLastSaved(new Date());
        setIsSaving(false);
      }
    }, settings.autoSaveInterval);

    return () => clearTimeout(timeoutId);
  }, [title, content, tags, note, onUpdateNote, settings]);

  const handleSave = async () => {
    if (!note) return;
    // Check if there are unsaved changes
    const isUpToDate =
      title === note.title &&
      content === note.content &&
      JSON.stringify(tags) === JSON.stringify(note.tags);
    if (isUpToDate) {
      setIsSaving(false);
      return;
    }
    setIsSaving(true);
    onUpdateNote(note.id, {
      title: title || 'Untitled',
      content,
      tags
    });
    setLastSaved(new Date());
    setTimeout(() => {
    setIsSaving(false);
      setShowSavedBadge(true);
      setTimeout(() => setShowSavedBadge(false), 1500);
    }, 500);
  };

  const handleDelete = () => {
    if (!note) return;
    
    onDeleteNote(note.id);
    setShowDeleteDialog(false);
    toast({
      title: "Note deleted",
      description: "The note has been permanently deleted.",
      variant: "destructive",
      duration: 1000
    });
  };

  const handleToggleFavorite = () => {
    if (!note) return;
    onUpdateNote(note.id, {
      isFavorite: !note.isFavorite
    });
  };

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newText = before + selectedText + after;
    const newContent = content.substring(0, start) + newText + content.substring(end);
    
    setContent(newContent);
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setNewTag('');
      if (note) {
        onUpdateNote(note.id, { tags: updatedTags });
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    if (note) {
      onUpdateNote(note.id, { tags: updatedTags });
    }
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    if (note) {
      onUpdateNote(note.id, { color: newColor });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
            No note selected
          </h2>
          <p className="text-slate-500">
            Select a note from the sidebar or create a new one to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
        {/* Compact Header with Theme Switcher Inline */}
        <div className="border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-2 py-1 flex-shrink-0 gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
            className="text-lg font-semibold border-none shadow-none px-0 py-1 focus-visible:ring-0 flex-1 bg-transparent"
              onKeyPress={handleKeyPress}
            style={{ minHeight: 0, height: '2.25rem' }}
          />
          {note && (
            <div className="text-xs text-slate-500 ml-2 whitespace-nowrap">
              Last updated: {new Date(note.updatedAt).toLocaleString()}
            </div>
          )}
          <div className="flex items-center gap-1 ml-2">
            <button
              className={cn('p-1 rounded-full', settings.theme === 'light' ? 'bg-slate-200 dark:bg-slate-700' : 'hover:bg-slate-100 dark:hover:bg-slate-800')}
              onClick={() => updateSettings({ theme: 'light' })}
              aria-label="Light theme"
            >
              <Sun className={cn('h-4 w-4', settings.theme === 'light' ? 'text-yellow-500' : 'text-slate-500')} />
            </button>
            <button
              className={cn('p-1 rounded-full', settings.theme === 'dark' ? 'bg-slate-200 dark:bg-slate-700' : 'hover:bg-slate-100 dark:hover:bg-slate-800')}
              onClick={() => updateSettings({ theme: 'dark' })}
              aria-label="Dark theme"
            >
              <Moon className={cn('h-4 w-4', settings.theme === 'dark' ? 'text-blue-500' : 'text-slate-500')} />
            </button>
            <button
              className={cn('p-1 rounded-full', settings.theme === 'system' ? 'bg-slate-200 dark:bg-slate-700' : 'hover:bg-slate-100 dark:hover:bg-slate-800')}
              onClick={() => updateSettings({ theme: 'system' })}
              aria-label="System theme"
            >
              <Monitor className={cn('h-4 w-4', settings.theme === 'system' ? 'text-green-500' : 'text-slate-500')} />
            </button>
          </div>
        </div>
          
          
          {/* Toolbar */}
          <div className="flex items-center justify-between mt-3 pt-2 flex-wrap overflow-x-auto min-w-0 w-full px-3">
            <div className="flex items-center gap-3 flex-wrap">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown('**', '**')}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Bold text</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown('*', '*')}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Italic text</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown('\n- ', '')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Bullet list</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown('\n1. ', '')}
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Numbered list</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown('[', '](url)')}
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Insert link</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertMarkdown('`', '`')}
                  >
                    <Code className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Inline code</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'edit' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('edit')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit mode</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'split' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('split')}
                  >
                    <Columns className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Split view</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('preview')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Preview mode</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSave}
                    ref={saveBtnRef}
                    disabled={isSaving}
                    className="flex items-center gap-2 shrink-0 min-w-0 max-w-xs truncate"
                  >
                    {isSaving ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>Save</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save (Ctrl+Enter)</p>
                </TooltipContent>
              </Tooltip>
              {showSavedBadge && (
                <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium">Saved</span>
              )}
            </div>
          </div>
          
          {/* Tags */}
          <div className="mt-4 border border-slate-100 dark:border-slate-800 rounded-lg p-3 bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <Tooltip key={tag}>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 text-xs px-2 py-1"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      #{tag} ×
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to remove tag</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag..."
                className="flex-1 min-w-0"
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleAddTag} size="sm" className="ml-2">Add</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add new tag</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
        
        {/* Editor Content */}
        <div className="flex-1 flex min-h-0 overflow-hidden bg-slate-50 dark:bg-slate-900 rounded-lg mt-4 p-2">
          {/* Edit View */}
          {(viewMode === 'edit' || viewMode === 'split') && (
            <div className={cn(
              "flex flex-col overflow-hidden",
              viewMode === 'split' ? "w-1/2 border-r border-slate-200 dark:border-slate-700" : "w-full"
            )}>
              <ScrollArea className="flex-1">
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing your note..."
                  className="min-h-[calc(100vh-300px)] resize-none border-none rounded-none focus-visible:ring-0 font-mono text-sm leading-relaxed p-6"
                  onKeyPress={handleKeyPress}
                  style={{
                    fontSize: `${settings.fontSize}px`,
                    lineHeight: settings.lineHeight,
                    fontFamily: settings.fontFamily === 'mono' ? 'ui-monospace, monospace' : 'ui-sans-serif, sans-serif'
                  }}
                />
              </ScrollArea>
            </div>
          )}
          
          {/* Preview View */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className={cn(
              "flex flex-col overflow-hidden",
              viewMode === 'split' ? "w-1/2" : "w-full"
            )}>
              <ScrollArea className="flex-1">
                <MarkdownPreview
                  content={content}
                  className="p-6"
                />
              </ScrollArea>
            </div>
          )}
      </div>
    </TooltipProvider>
  );
};
