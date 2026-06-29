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
  headerTitle = '社群分享',
  description = '快速分享這個頁面，也方便未來嵌入其他頁面。',
}: SocialShareProps) {
  const [currentUrl, setCurrentUrl] = useState(url ?? '');
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef<number | null>(null);

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
        window.clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);

  const shareText = text?.trim() || title;
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedText = encodeURIComponent(shareText);
  const canNativeShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function';

  const shareUrls = useMemo(
    () => ({
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
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
        window.clearTimeout(copiedTimeoutRef.current);
      }
      copiedTimeoutRef.current = window.setTimeout(() => {
        setCopied(false);
        copiedTimeoutRef.current = null;
      }, 2000);
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
        {(
          Object.keys(SHARE_LABELS) as ShareTarget[]
        ).map((target) => (
          <button
            key={target}
            type="button"
            className="share-button"
            onClick={() => openShareWindow(target)}
            disabled={!currentUrl}
          >
            分享到 {SHARE_LABELS[target]}
          </button>
        ))}

        <button type="button" className="share-button share-button--secondary" onClick={handleCopy} disabled={!currentUrl}>
          {copied ? '連結已複製' : '複製連結'}
        </button>

        {canNativeShare && (
          <button
            type="button"
            className="share-button share-button--primary"
            onClick={handleNativeShare}
            disabled={!currentUrl}
          >
            系統分享
          </button>
        )}
      </div>

      <div className="social-share__link" title={currentUrl || '目前尚無可分享連結'}>
        {currentUrl || '載入分享連結中…'}
      </div>
    </section>
  );
}
