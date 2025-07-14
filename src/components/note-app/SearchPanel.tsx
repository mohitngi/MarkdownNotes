
import React, { useState, useMemo } from 'react';
import { Search, Filter, Tag, Calendar, FileText, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Note } from '@/types/noteTypes';
import { useNoteStore } from '@/stores/noteStore';
import { cn } from '@/lib/utils';

interface SearchPanelProps {
  notes: Note[];
  onSelectNote: (note: Note) => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  notes,
  onSelectNote
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'title'>('relevance');
  const [filterBy, setFilterBy] = useState<'all' | 'favorites' | 'recent'>('all');
  const { selectNote } = useNoteStore();

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach(note => note.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [notes]);

  // Filter and search notes
  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // Filter by type
    if (filterBy === 'favorites') {
      filtered = filtered.filter(note => note.isFavorite);
    } else if (filterBy === 'recent') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(note => new Date(note.updatedAt) > weekAgo);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(note => 
        selectedTags.every(tag => note.tags.includes(tag))
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort results
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'relevance' && searchQuery.trim()) {
      // Simple relevance scoring
      filtered.sort((a, b) => {
        const aScore = (a.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 10 : 0) +
                      (a.content.toLowerCase().includes(searchQuery.toLowerCase()) ? 5 : 0);
        const bScore = (b.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 10 : 0) +
                      (b.content.toLowerCase().includes(searchQuery.toLowerCase()) ? 5 : 0);
        return bScore - aScore;
      });
    }

    return filtered;
  }, [notes, searchQuery, selectedTags, sortBy, filterBy]);

  const handleSelectNote = (note: Note) => {
    selectNote(note.id);
    onSelectNote(note);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setFilterBy('all');
    setSortBy('relevance');
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Search className="h-6 w-6 text-slate-600 dark:text-slate-400" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Search Notes
          </h1>
        </div>
        
        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search titles, content, and tags..."
            className="pl-10 text-base"
          />
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Notes</SelectItem>
              <SelectItem value="favorites">Favorites</SelectItem>
              <SelectItem value="recent">Recent</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            onClick={clearFilters}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Clear Filters</span>
          </Button>
        </div>
        
        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Tag className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Filter by Tags
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => toggleTag(tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Results Count */}
        <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'} found
        </div>
      </div>
      
      {/* Results */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-4">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                No notes found
              </h3>
              <p className="text-slate-500">
                Try adjusting your search terms or filters.
              </p>
            </div>
          ) : (
            filteredNotes.map(note => (
              <div
                key={note.id}
                onClick={() => handleSelectNote(note)}
                className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex-1">
                    {highlightText(note.title, searchQuery)}
                  </h3>
                  <div className="flex items-center space-x-2 ml-4">
                    {note.isFavorite && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                    <span className="text-xs text-slate-500">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                {/* Content Preview */}
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 line-clamp-2">
                  {highlightText(
                    note.content.slice(0, 200) + (note.content.length > 200 ? '...' : ''),
                    searchQuery
                  )}
                </p>
                
                {/* Tags and Metadata */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="text-xs"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <div className="flex items-center space-x-1">
                      <FileText className="h-3 w-3" />
                      <span>{note.wordCount} words</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
