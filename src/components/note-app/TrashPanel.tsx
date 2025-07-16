import React, { useState } from 'react';
import { useNoteStore } from '@/stores/noteStore';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

export const TrashPanel: React.FC = () => {
  const {
    notes,
    folders,
    restoreNote,
    deleteNotePermanently,
    restoreFolder,
    deleteFolderPermanently,
    purgeTrashedNotes
  } = useNoteStore();

  const trashedNotes = notes.filter(n => n.deletedAt).sort((a, b) => new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime());
  const trashedFolders = folders.filter(f => f.deletedAt).sort((a, b) => new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime());

  const isEmpty = trashedNotes.length === 0 && trashedFolders.length === 0;
  const [emptying, setEmptying] = useState(false);

  return (
    <div className="w-full pt-8 px-6 md:px-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Trash</h2>
        {!isEmpty && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50 hover:border-red-600 focus-visible:ring-2 focus-visible:ring-red-200 focus:ring-0"
                disabled={emptying}
                aria-label="Empty Trash"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {emptying ? 'Deleting...' : 'Empty Trash'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Permanently delete all trashed notes and folders?</AlertDialogTitle>
              </AlertDialogHeader>
              <div className="py-2">This cannot be undone.</div>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={emptying}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={emptying}
                  onClick={async () => {
                    setEmptying(true);
                    await Promise.resolve(purgeTrashedNotes());
                    setEmptying(false);
                  }}
                >
                  {emptying ? 'Deleting...' : 'Delete All'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      {isEmpty ? (
        <div className="text-left text-slate-500 py-16">
          <div className="text-5xl mb-4">🗑️</div>
          <div className="text-lg font-medium mb-2">Nothing in Trash</div>
          <div className="text-sm">Deleted notes and folders will appear here for 30 days before being permanently removed.</div>
        </div>
      ) : (
        <>
          {trashedFolders.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">Folders</h3>
              <ul className="space-y-2">
                {trashedFolders.map(folder => (
                  <li key={folder.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-3">
                    <div>
                      <span className="font-medium">{folder.name}</span>
                      <div className="text-xs text-slate-400">Deleted {new Date(folder.deletedAt!).toLocaleString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => restoreFolder(folder.id)}>Restore</Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">Delete Forever</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete folder permanently?</AlertDialogTitle>
                          </AlertDialogHeader>
                          <div className="py-2">This cannot be undone.</div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteFolderPermanently(folder.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {trashedNotes.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">Notes</h3>
              <ul className="space-y-2">
                {trashedNotes.map(note => (
                  <li key={note.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 rounded p-3 border border-slate-200 dark:border-slate-700">
                    <div>
                      <div className="font-medium truncate max-w-xs">{note.title}</div>
                      <div className="text-xs text-slate-400">Deleted {new Date(note.deletedAt!).toLocaleString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => restoreNote(note.id)}>Restore</Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">Delete Forever</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete note permanently?</AlertDialogTitle>
                          </AlertDialogHeader>
                          <div className="py-2">This cannot be undone.</div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteNotePermanently(note.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};
 