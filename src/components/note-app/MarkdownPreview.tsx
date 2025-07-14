
import React from 'react';
import { cn } from '@/lib/utils';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  content,
  className
}) => {
  // Simple markdown to HTML conversion
  const renderMarkdown = (text: string) => {
    let html = text;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-6 mb-3 text-slate-800 dark:text-slate-200">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-8 mb-4 text-slate-800 dark:text-slate-200">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-6 text-slate-900 dark:text-slate-100">$1</h1>');
    
    // Bold and Italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900 dark:text-slate-100">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-700 dark:text-slate-300">$1</em>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
    
    // Code blocks
    html = html.replace(/```([^`]+)```/g, '<pre class="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 p-4 rounded-lg my-4 overflow-x-auto"><code class="font-mono text-sm">$1</code></pre>');
    
    // Lists
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-6 list-disc text-slate-700 dark:text-slate-300 mb-1">$1</li>');
    html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-6 list-decimal text-slate-700 dark:text-slate-300 mb-1">$1</li>');
    
    // Wrap consecutive list items
    html = html.replace(/(<li[^>]*>.*<\/li>\s*)+/g, '<ul class="my-4">$&</ul>');
    
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p class="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed">');
    html = html.replace(/\n/g, '<br>');
    
    // Wrap in paragraphs
    if (html.trim()) {
      html = '<p class="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed">' + html + '</p>';
    }
    
    return html;
  };

  return (
    <div 
      className={cn(
        "prose prose-slate dark:prose-invert max-w-none",
        "prose-headings:text-slate-900 dark:prose-headings:text-slate-100",
        "prose-p:text-slate-700 dark:prose-p:text-slate-300",
        "prose-li:text-slate-700 dark:prose-li:text-slate-300",
        "prose-code:text-slate-800 dark:prose-code:text-slate-200",
        className
      )}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
};
