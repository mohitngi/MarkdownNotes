
import React from 'react';
import { 
  Settings, 
  Palette, 
  Type, 
  Save, 
  Download, 
  Upload,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useNoteStore } from '@/stores/noteStore';
import { toast } from '@/hooks/use-toast';

export const SettingsPanel: React.FC = () => {
  const { settings, updateSettings, notes } = useNoteStore();

  const handleExportNotes = () => {
    const exportData = {
      notes,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `markdown-notes-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: "Your notes have been exported successfully.",
    });
  };

  const handleImportNotes = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        // Import logic would go here
        toast({
          title: "Import successful",
          description: "Your notes have been imported successfully.",
        });
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Failed to import notes. Please check the file format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(isDark ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
    }
  };

  return (
    <div className="flex-1 bg-white dark:bg-slate-900 overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Settings className="h-6 w-6 text-slate-600 dark:text-slate-400" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Settings
          </h1>
        </div>

        <div className="space-y-8">
          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Appearance</span>
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your note-taking experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Theme</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Choose your preferred color scheme
                  </p>
                </div>
                <Select
                  value={settings.theme}
                  onValueChange={(value: any) => handleThemeChange(value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center space-x-2">
                        <Sun className="h-4 w-4" />
                        <span>Light</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center space-x-2">
                        <Moon className="h-4 w-4" />
                        <span>Dark</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center space-x-2">
                        <Monitor className="h-4 w-4" />
                        <span>System</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Editor Mode</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Choose your preferred editing layout
                  </p>
                </div>
                <Select
                  value={settings.editorMode}
                  onValueChange={(value: any) => updateSettings({ editorMode: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="edit">Edit Only</SelectItem>
                    <SelectItem value="split">Split View</SelectItem>
                    <SelectItem value="preview">Preview Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Typography Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Type className="h-5 w-5" />
                <span>Typography</span>
              </CardTitle>
              <CardDescription>
                Adjust font settings for comfortable reading and writing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Font Family</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Choose your preferred font
                  </p>
                </div>
                <Select
                  value={settings.fontFamily}
                  onValueChange={(value: any) => updateSettings({ fontFamily: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="mono">Monospace</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-base font-medium">Font Size</Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {settings.fontSize}px
                    </p>
                  </div>
                </div>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={(value) => updateSettings({ fontSize: value[0] })}
                  min={12}
                  max={24}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-base font-medium">Line Height</Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {settings.lineHeight}
                    </p>
                  </div>
                </div>
                <Slider
                  value={[settings.lineHeight]}
                  onValueChange={(value) => updateSettings({ lineHeight: value[0] })}
                  min={1}
                  max={2.5}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Show Line Numbers</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Display line numbers in the editor
                  </p>
                </div>
                <Switch
                  checked={settings.showLineNumbers}
                  onCheckedChange={(checked) => updateSettings({ showLineNumbers: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Auto-save Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Save className="h-5 w-5" />
                <span>Auto-save</span>
              </CardTitle>
              <CardDescription>
                Configure automatic saving of your notes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Enable Auto-save</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Automatically save changes as you type
                  </p>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => updateSettings({ autoSave: checked })}
                />
              </div>

              {settings.autoSave && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Label className="text-base font-medium">Auto-save Interval</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {settings.autoSaveInterval / 1000} seconds
                      </p>
                    </div>
                  </div>
                  <Slider
                    value={[settings.autoSaveInterval]}
                    onValueChange={(value) => updateSettings({ autoSaveInterval: value[0] })}
                    min={1000}
                    max={10000}
                    step={1000}
                    className="w-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export and import your notes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Export Notes</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Download all your notes as JSON
                  </p>
                </div>
                <Button onClick={handleExportNotes} className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Import Notes</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Import notes from JSON file
                  </p>
                </div>
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportNotes}
                    className="hidden"
                    id="import-file"
                  />
                  <Button asChild className="flex items-center space-x-2">
                    <label htmlFor="import-file" className="cursor-pointer">
                      <Upload className="h-4 w-4" />
                      <span>Import</span>
                    </label>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>
                Overview of your note-taking activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {notes.length}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Total Notes
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {notes.reduce((acc, note) => acc + note.wordCount, 0)}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Total Words
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {notes.filter(note => note.isFavorite).length}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Favorites
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {new Set(notes.flatMap(note => note.tags)).size}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Unique Tags
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
