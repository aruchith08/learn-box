import React, { useState, useEffect } from 'react';
import { ABDUL_BARI_PROBLEMS } from '../../data/abdulBariData';
import { X, Copy, Check, Share2, Sparkles, CheckCircle2 } from '../common/icons';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copiedType, setCopiedType] = useState<'link' | 'message' | null>(null);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Use current website URL, or fallback to default
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://arh-dsa.vercel.app';

  const shareTitle = 'Abdul Bari DSA with Problems — By ARH';
  const shareSummary = 'Learn from the best mentor (Prof. Abdul Bari) and practice 1,000+ curated LeetCode, HackerRank & CodeChef problems alongside every lecture!';

  const fullShareText = `🚀 Master Data Structures & Algorithms with Abdul Bari DSA + Problems!

Stop just passively watching lectures—learn from the world's best algorithm mentor (Prof. Abdul Bari) and practice 1,000+ curated LeetCode, HackerRank, and CodeChef problems alongside every single lecture!

✨ Why this platform:
• ${ABDUL_BARI_PROBLEMS.length} lecture-by-lecture structured curriculum
• 1,000+ hand-picked practice challenges
• LeetCode-style progress analytics & revision bookmarks
• Multi-device cloud sync with Firebase
• 100% free, developer-first Neo-Brutalist experience

👉 Practice here: ${shareUrl}

KEEP SOLVING. KEEP BUILDING. — ARH`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedType('link');
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      // Fallback
      fallbackCopyText(shareUrl);
      setCopiedType('link');
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(fullShareText);
      setCopiedType('message');
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      fallbackCopyText(fullShareText);
      setCopiedType('message');
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  const fallbackCopyText = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (e) {
      console.error('Fallback copy failed', e);
    }
    document.body.removeChild(textArea);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: fullShareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopyMessage();
    }
  };

  const encodedMessage = encodeURIComponent(fullShareText);
  const encodedUrl = encodeURIComponent(shareUrl);

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const telegramUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(shareSummary)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg border-2 border-black bg-white shadow-[8px_8px_0px_#000000] transition-all overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b-2 border-black bg-black px-5 py-3 text-white">
          <div className="flex items-center gap-2.5">
            <img
              src="/arh-logo.png"
              alt="ARH"
              className="h-6 w-auto object-contain brightness-200 contrast-200"
            />
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-widest text-[#CCCCCC] uppercase">
              <Share2 className="h-3.5 w-3.5 text-[#FF5E1E]" />
              <span>SHARE ARH DSA</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center border border-white/40 bg-black text-white hover:bg-[#FF5E1E] hover:text-black hover:border-black transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 text-black space-y-5">
          {/* Header Banner */}
          <div>
            <div className="inline-flex items-center gap-1.5 border border-black bg-[#FF5E1E] px-2 py-0.5 text-[10px] font-mono font-black uppercase text-black shadow-[2px_2px_0px_#000000] mb-2">
              <Sparkles className="h-3 w-3" />
              <span>SPREAD THE KNOWLEDGE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight leading-tight">
              SHARE WITH FRIENDS &amp; PEERS
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-black/70 font-sans leading-relaxed">
              Help your friends not only learn algorithms from the best mentor (<span className="font-bold text-black">Prof. Abdul Bari</span>), but also practice curated problems alongside every single lecture!
            </p>
          </div>

          {/* Quick Value Points */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="border border-black bg-[#FAFAFA] p-2 flex items-center gap-2">
              <span className="text-[#FF5E1E] font-black">▶</span>
              <span className="font-bold">{ABDUL_BARI_PROBLEMS.length} Full Lectures</span>
            </div>
            <div className="border border-black bg-[#FAFAFA] p-2 flex items-center gap-2">
              <span className="text-emerald-600 font-black">✓</span>
              <span className="font-bold">1,000+ Coding Drills</span>
            </div>
            <div className="border border-black bg-[#FAFAFA] p-2 flex items-center gap-2">
              <span className="text-[#FFA116] font-black">★</span>
              <span className="font-bold">LeetCode Dashboard</span>
            </div>
            <div className="border border-black bg-[#FAFAFA] p-2 flex items-center gap-2">
              <span className="text-blue-600 font-black">☁</span>
              <span className="font-bold">Cloud Sync &amp; Notes</span>
            </div>
          </div>

          {/* Link Box */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-black mb-1.5">
              Platform Link
            </label>
            <div className="flex items-stretch border-2 border-black bg-[#F5F5F5] shadow-[2px_2px_0px_#000000]">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent px-3 py-2 text-xs font-mono text-black select-all outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="border-l-2 border-black bg-black px-4 py-2 text-xs font-black uppercase text-white hover:bg-[#FF5E1E] hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {copiedType === 'link' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>COPIED!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>COPY LINK</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            {/* Main Primary Action: Copy Full Invitation Message */}
            <button
              type="button"
              onClick={handleCopyMessage}
              className="w-full border-2 border-black bg-[#FF5E1E] p-3 text-xs sm:text-sm font-black uppercase text-black shadow-[3px_3px_0px_#000000] hover:bg-black hover:text-white active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {copiedType === 'message' ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>COPIED FULL INVITATION MESSAGE! ✓</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>COPY COMPLETE SHARE MESSAGE &amp; LINK</span>
                </>
              )}
            </button>

            {/* Native device share if supported */}
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full border-2 border-black bg-white p-2.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000000] hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>SHARE VIA DEVICE / INSTALLED APPS</span>
              </button>
            )}
          </div>

          {/* Social Quick Share Grid */}
          <div className="pt-2 border-t border-black/15">
            <div className="text-[10px] font-mono font-bold uppercase text-black/60 mb-2">
              QUICK SHARE DIRECTLY TO:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-black bg-[#25D366]/10 p-2 text-center text-xs font-black uppercase hover:bg-[#25D366] hover:text-white transition-colors flex items-center justify-center gap-1.5 shadow-[1px_1px_0px_#000000]"
              >
                <span>WhatsApp</span>
              </a>

              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-black bg-[#0088cc]/10 p-2 text-center text-xs font-black uppercase hover:bg-[#0088cc] hover:text-white transition-colors flex items-center justify-center gap-1.5 shadow-[1px_1px_0px_#000000]"
              >
                <span>Telegram</span>
              </a>

              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-black bg-[#0077b5]/10 p-2 text-center text-xs font-black uppercase hover:bg-[#0077b5] hover:text-white transition-colors flex items-center justify-center gap-1.5 shadow-[1px_1px_0px_#000000]"
              >
                <span>LinkedIn</span>
              </a>

              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-black bg-black/5 p-2 text-center text-xs font-black uppercase hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-1.5 shadow-[1px_1px_0px_#000000]"
              >
                <span>Twitter / X</span>
              </a>
            </div>
          </div>

          {/* Footer Tagline */}
          <div className="text-center text-[10px] font-mono font-semibold text-black/50 pt-1">
            KEEP SOLVING. KEEP BUILDING. — ARH
          </div>
        </div>
      </div>
    </div>
  );
};
