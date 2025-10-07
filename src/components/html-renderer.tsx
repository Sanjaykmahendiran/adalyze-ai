"use client";

import { useEffect, useState } from 'react';

interface Props {
  htmlContent: string;
  className?: string; // Optional className prop
}

const HtmlRenderer: React.FC<Props> = ({ htmlContent, className = "" }) => {
  const [sanitizedHtml, setSanitizedHtml] = useState<string>("");

  useEffect(() => {
    const sanitizeHtml = async () => {
      if (typeof window !== 'undefined') {
        const DOMPurify = (await import('dompurify')).default; // dynamic import
        const cleanHtml = DOMPurify.sanitize(htmlContent);
        if (cleanHtml !== '<p><br></p>') {
          setSanitizedHtml(cleanHtml);
        } else {
          setSanitizedHtml('');
        }
      }
    };

    sanitizeHtml();
  }, [htmlContent]);

  return (
    <div
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      className={`editor-content text-sm text-white/80 ${className}`}
    />
  );
};

export default HtmlRenderer;
