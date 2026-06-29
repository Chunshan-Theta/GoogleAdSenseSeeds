'use client';

import { useEffect, useMemo, useState } from 'react';

interface SocialShareProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
}

type ShareTarget = 'facebook' | 'x' | 'line';

const SHARE_LABELS: Record<ShareTarget, string> = {
  facebook: 'Facebook',
  x: 'X',
  line: 'LINE',
};

export default function SocialShare({ title, text, url, className }: SocialShareProps) {
  const [currentUrl, setCurrentUrl] = useState(url ?? '');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (url) {
      setCurrentUrl(url);
      return;
    }

    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, [url]);

  const shareText = text?.trim() || title;
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(shareText);

  const shareUrls = useMemo(
    () => ({
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      line: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
    }),
    [encodedTitle, encodedUrl]
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

    await navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (!currentUrl || typeof navigator === 'undefined' || !navigator.share) {
      return;
    }

    await navigator.share({
      title,
      text: shareText,
      url: currentUrl,
    });
  };

  return (
    <section className={`social-share${className ? ` ${className}` : ''}`}>
      <div className="social-share__header">
        <h2 className="social-share__title">社群分享</h2>
        <p className="social-share__description">把這份測驗分享給朋友，也方便未來嵌入其他頁面。</p>
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

        {typeof navigator !== 'undefined' && navigator.share && (
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
