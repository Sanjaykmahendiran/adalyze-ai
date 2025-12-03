"use client";

import { useEffect, useState } from 'react';

interface Props {
  htmlContent: string;
  className?: string; // Optional className prop
}

const HtmlRenderer: React.FC<Props> = ({ htmlContent, className = "" }) => {
  const [sanitizedHtml, setSanitizedHtml] = useState<string>("");

  useEffect(() => {
    const sanitize = async () => {
      if (typeof window !== "undefined") {
        const mod = await import("dompurify");
        const DOMPurify = mod.default || mod; // <-- handles both export styles

        const clean = DOMPurify.sanitize(htmlContent);

        setSanitizedHtml(clean === "<p><br></p>" ? "" : clean);
      }
    };

    sanitize();
  }, [htmlContent]);


  return (
    <div
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      className={`editor-content text-sm text-white/80 ${className}`}
    />
  );
};

export default HtmlRenderer;
