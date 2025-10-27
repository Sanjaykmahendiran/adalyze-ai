"use client"

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share, Copy, Check, X } from 'lucide-react';
import { generateShareUrl, generateShareText } from '@/lib/tokenUtils';
import toast from 'react-hot-toast';

interface TokenModalProps {
  adId: string;
  children: React.ReactNode;
  onShare?: (shareUrl: string) => void;
}

export default function TokenModal({ adId, children, onShare }: TokenModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const shareUrl = generateShareUrl(adId);
  const shareText = generateShareText(adId);
  
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Share URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy URL');
    }
  };
  
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ad Analysis Results',
          text: shareText,
          url: shareUrl,
        });
        onShare?.(shareUrl);
      } catch (err) {
        console.error('Error sharing:', err);
        // Fallback to copy
        handleCopyUrl();
      }
    } else {
      // Fallback to copy
      handleCopyUrl();
    }
  };
  
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success('Share text copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy text');
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#171717] border-[#3d3d3d] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Share className="w-5 h-5 text-[#db4900]" />
            Share Ad Analysis
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="share-url" className="text-sm font-medium text-gray-300">
              Share URL
            </Label>
            <div className="flex gap-2">
              <Input
                id="share-url"
                value={shareUrl}
                readOnly
                className="bg-black border-[#3d3d3d] text-white text-sm"
              />
              <Button
                onClick={handleCopyUrl}
                size="sm"
                variant="outline"
                className="border-[#db4900] text-[#db4900] hover:bg-[#db4900] hover:text-white transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="share-text" className="text-sm font-medium text-gray-300">
              Share Text
            </Label>
            <div className="flex gap-2">
              <Input
                id="share-text"
                value={shareText}
                readOnly
                className="bg-black border-[#3d3d3d] text-white text-sm"
              />
              <Button
                onClick={handleCopyText}
                size="sm"
                variant="outline"
                className="border-[#db4900] text-[#db4900] hover:bg-[#db4900] hover:text-white transition-colors"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleNativeShare}
              className="flex-1 bg-[#db4900] hover:bg-[#ff5722] text-white transition-colors"
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="border-[#3d3d3d] text-gray-300 hover:bg-[#3d3d3d] hover:text-white transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
