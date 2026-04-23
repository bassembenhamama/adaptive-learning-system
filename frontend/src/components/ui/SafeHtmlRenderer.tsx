import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface SafeHtmlRendererProps {
  html: string;
  className?: string;
  allowTags?: string[];
}

const DEFAULT_ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'span', 'code', 'pre', 'blockquote', 'a', 'img'
];

const DEFAULT_ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'target', 'class'];

export const SafeHtmlRenderer: React.FC<SafeHtmlRendererProps> = ({ 
  html, 
  className = '',
  allowTags = DEFAULT_ALLOWED_TAGS
}) => {
  const sanitizedHtml = useMemo(() => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: allowTags,
      ALLOWED_ATTR: DEFAULT_ALLOWED_ATTR,
    });
  }, [html, allowTags]);

  return (
    <div 
      className={`prose prose-slate dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};
