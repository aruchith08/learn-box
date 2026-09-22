import React, { useState, useRef, useEffect } from 'react';
import { PracticePlatform } from '../../types/dsa';
import { parsePlatformLinks } from '../../utils/urlHelper';
import { ExternalLink, ChevronDown, ChefHat } from '../common/icons';

interface PracticeLinksProps {
  urls: string[];
  platform: PracticePlatform;
  align?: 'left' | 'right' | 'auto';
}

export const PracticeLinks: React.FC<PracticeLinksProps> = ({ urls, platform, align = 'auto' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [effectiveAlign, setEffectiveAlign] = useState<'left' | 'right'>('left');
  const popoverRef = useRef<HTMLDivElement>(null);
  const items = parsePlatformLinks(urls, platform);

  useEffect(() => {
    if (!isOpen) return;

    if (align === 'right') {
      setEffectiveAlign('right');
    } else if (align === 'left') {
      setEffectiveAlign('left');
    } else if (popoverRef.current) {
      // Auto-detect based on remaining viewport space
      const rect = popoverRef.current.getBoundingClientRect();
      const dropdownWidth = 240; // 15rem / w-60
      if (rect.left + dropdownWidth > window.innerWidth - 16) {
        setEffectiveAlign('right');
      } else {
        setEffectiveAlign('left');
      }
    }

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, align]);

  if (!items.length) {
    return <span className="text-sm font-bold text-black/30 font-mono select-none">—</span>;
  }

  // Render Platform Badge Icon
  const renderPlatformBadge = () => {
    if (platform === 'hackerrank') {
      return (
        <span className="flex h-5 w-5 items-center justify-center border border-black bg-[#00EA64] font-black text-[11px] text-black shadow-[1px_1px_0px_#000000]">
          H
        </span>
      );
    }
    if (platform === 'leetcode') {
      return (
        <span className="flex h-5 w-5 items-center justify-center border border-black bg-white p-0.5 shadow-[1px_1px_0px_#000000]">
          <img
            src="/leetcode-logo.png"
            alt="LeetCode"
            className="h-3.5 w-3.5 object-contain"
          />
        </span>
      );
    }
    return (
      <span className="flex h-5 w-5 items-center justify-center border border-black bg-[#333333] text-white shadow-[1px_1px_0px_#000000]">
        <ChefHat className="h-3.5 w-3.5 text-white" />
      </span>
    );
  };

  // Single URL: Direct Link Button
  if (items.length === 1) {
    const item = items[0];
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 border border-black/40 bg-white hover:bg-black hover:text-white px-1.5 py-1 text-xs font-bold transition-colors group shadow-[1px_1px_0px_#000000]"
        title={`Open ${item.label} on ${platform}`}
      >
        {renderPlatformBadge()}
        <ExternalLink className="h-3 w-3 text-black/60 group-hover:text-white" />
      </a>
    );
  }

  // Multiple URLs: Popover dropdown
  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 border border-black/40 bg-white hover:bg-black hover:text-white px-1.5 py-1 text-xs font-bold transition-colors group shadow-[1px_1px_0px_#000000]"
        title={`View ${items.length} problems on ${platform}`}
      >
        {renderPlatformBadge()}
        <span className="text-[10px] font-mono font-bold text-black/80 group-hover:text-white">
          ({items.length})
        </span>
        <ChevronDown className="h-3 w-3 text-black/60 group-hover:text-white" />
      </button>

      {isOpen && (
        <div
          className={`absolute mt-1 z-50 w-60 max-w-[calc(100vw-2rem)] border-2 border-black bg-white p-2 shadow-[4px_4px_0px_#000000] ${
            effectiveAlign === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-black border-b-2 border-black mb-1 flex items-center justify-between">
            <span className="uppercase">{platform} Problems</span>
            <span className="font-mono">{items.length}</span>
          </div>
          <div className="max-h-52 overflow-y-auto space-y-1">
            {items.map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between border border-transparent p-1.5 text-xs font-semibold text-black hover:border-black hover:bg-[#ECECEC] transition-colors"
              >
                <span className="truncate pr-2">{item.label}</span>
                <ExternalLink className="h-3 w-3 shrink-0 text-black" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
