import React, { useMemo } from 'react';
import { SafeHtmlRenderer } from './SafeHtmlRenderer';

interface Props {
  content: string;
  className?: string;
  allowTags?: string[];
}

/**
 * MarkdownRenderer — converts a subset of Markdown to safe HTML.
 * Uses SafeHtmlRenderer for consistent XSS protection (NFR-U03).
 */
export const MarkdownRenderer: React.FC<Props> = ({ content, className, allowTags }) => {
  const html = useMemo(() => {
    let text = content;

    // Fenced code blocks (must run before inline code)
    text = text.replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers
    text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');

    // Bold and italic
    text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Blockquotes
    text = text.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

    // Unordered lists
    text = text.replace(/^[-*] (.+)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>(\n|$))+/g, '<ul>$&</ul>');

    // Ordered lists
    text = text.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Wrap plain lines in <p> (lines not already wrapped in a block element)
    text = text
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        if (/^<(h2|h3|ul|ol|li|pre|blockquote|p)/.test(trimmed)) return trimmed;
        return `<p>${trimmed}</p>`;
      })
      .join('');

    return text;
  }, [content]);

  return (
    <SafeHtmlRenderer 
      html={html} 
      className={className} 
      allowTags={allowTags}
    />
  );
};
