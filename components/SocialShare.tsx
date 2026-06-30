'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface SocialShareProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
  headerTitle?: string;
  description?: string;
}

type ShareTarget = 'facebook' | 'x' | 'line';
const COPY_FEEDBACK_DURATION = 2000;

const SHARE_LABELS: Record<ShareTarget, string> = {
  facebook: 'Facebook',
  x: 'X',
  line: 'LINE',
};

export default function SocialShare({
  title,
  text,
  url,
  className,
  headerTitle = 'Share this page',
  description = 'Share this page quickly or reuse this module on future pages.',
}: SocialShareProps) {
  const [currentUrl, setCurrentUrl] = useState(url ?? '');
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (url) {
      setCurrentUrl(url);
      return;
    }

    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, [url]);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current !== null) {
        clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);

  const shareText = text?.trim() || title;
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedText = encodeURIComponent(shareText);
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const shareUrls = useMemo(
    () => ({
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      x: `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      line: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
    }),
    [encodedText, encodedUrl]
  );

  const openShareWindow = (target: ShareTarget) => {
    if (!currentUrl || typeof window === 'undefined') {
      return;
    }

    window.open(shareUrls[target], '_blank', 'noopener,noreferrer,width=720,height=720');
  };

  const handleCopy = async () => {
    if (!currentUrl || typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      if (copiedTimeoutRef.current !== null) {
        clearTimeout(copiedTimeoutRef.current);
      }
      copiedTimeoutRef.current = setTimeout(() => {
        setCopied(false);
        copiedTimeoutRef.current = null;
      }, COPY_FEEDBACK_DURATION);
    } catch {
      setCopied(false);
    }
  };

  const handleNativeShare = async () => {
    if (!currentUrl || typeof navigator === 'undefined' || !navigator.share) {
      return;
    }

    try {
      await navigator.share({
        title,
        text: shareText,
        url: currentUrl,
      });
    } catch {
      return;
    }
  };

  return (
    <section className={`social-share${className ? ` ${className}` : ''}`}>
      <div className="social-share__header">
        <h2 className="social-share__title">{headerTitle}</h2>
        <p className="social-share__description">{description}</p>
      </div>

      <div className="social-share__actions">
        {(Object.keys(SHARE_LABELS) as ShareTarget[]).map((target) => (
          <button
            key={target}
            type="button"
            className="share-button"
            onClick={() => openShareWindow(target)}
            disabled={!currentUrl}
          >
            Share on {SHARE_LABELS[target]}
          </button>
        ))}

        <button
          type="button"
          className="share-button share-button--secondary"
          onClick={handleCopy}
          disabled={!currentUrl}
        >
          {copied ? 'Link copied' : 'Copy link'}
        </button>

        {canNativeShare && (
          <button
            type="button"
            className="share-button share-button--primary"
            onClick={handleNativeShare}
            disabled={!currentUrl}
          >
            System share
          </button>
        )}
      </div>

      <div className="social-share__link" title={currentUrl || 'No shareable link is available yet'}>
        {currentUrl || 'Loading shareable link...'}
      </div>
    </section>
  );
}
