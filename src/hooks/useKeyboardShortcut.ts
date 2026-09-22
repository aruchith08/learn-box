import { useEffect } from 'react';

interface Options {
  onSearchFocus?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcut({ onSearchFocus, onEscape }: Options) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key
      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }

      // Check if user is typing in an input or textarea
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if (isInput) return;

      // "/" or Ctrl+K / Cmd+K to focus search
      if (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        onSearchFocus?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearchFocus, onEscape]);
}
