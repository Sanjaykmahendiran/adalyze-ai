"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import LandingPageFooter from "@/components/landing-page/landing-page-footer";
import Header from "@/components/landing-page/header";

// Simple HTML sanitizer function (you might want to use a library like DOMPurify)
const sanitizeHTML = (html: string): string => {
  // Basic sanitization - allow only safe tags
  const allowedTags = ['p', 'b', 'strong', 'i', 'em', 'u', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li'];
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^<>]*>/gi;

  return html.replace(tagRegex, (match, tagName) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      return match;
    }
    return '';
  });
};


export default function termsandconditions() {
  const [terms, setTerms] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await fetch("/api/termsandconditions");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Since the API returns HTML directly, use text() instead of json()
        const htmlContent = await response.text();

        // Check if we actually got HTML content
        if (!htmlContent || htmlContent.trim() === '') {
          throw new Error('No content received from API');
        }

        // Sanitize the HTML content
        const sanitizedContent = sanitizeHTML(htmlContent);
        setTerms(sanitizedContent);

      } catch (error) {
        console.error("Error fetching Retrun policy:", error);
        setError(error instanceof Error ? error.message : 'Failed to load Retrun policy');
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen">
        {/* Header */}
        <Header />


        {/* Skeleton Content */}
        <div className="container mx-auto px-4 py-8">
          <main className="max-w-3xl mx-auto">
            <div className="h-8 w-1/3 bg-gray-700 rounded mb-6 animate-pulse" />
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 w-full bg-gray-800 rounded animate-pulse" />
              ))}
              <div className="h-4 w-5/6 bg-gray-800 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-800 rounded animate-pulse" />
            </div>
          </main>
        </div>

        <LandingPageFooter />
      </div>
    );
  }


  // Error state
  if (error) {
    return (
      <div className="min-h-screen">
        <Header />

        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-red-800 mb-2">Unable to Load Terms & conditions</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
        <LandingPageFooter />
      </div>
    );
  }

  // No content state
  if (!terms) {
    return (
      <div className="min-h-screen">
        <Header />

        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Terms & conditions Not Available</h2>
            <p className="text-gray-600">The Terms & conditions content could not be found.</p>
          </div>
        </div>
        <LandingPageFooter />
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8 pt-24">
        <main className="prose prose-gray max-w-none ">
          <div className="mt-6 flex justify-center">
            <div
              className="max-w-[800px] w-full font-thin Retrun-content mt-10"
              dangerouslySetInnerHTML={{ __html: terms }}
            />
          </div>
        </main>
      </div>
      <LandingPageFooter />
    </div>
  );
}