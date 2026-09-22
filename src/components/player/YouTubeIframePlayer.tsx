import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export interface YouTubePlayerRef {
  seekTo: (seconds: number) => void;
  play: () => void;
  pause: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
}

interface YouTubeIframePlayerProps {
  youtubeId: string;
  initialTime?: number;
  autoPlay?: boolean;
  completionThreshold?: number;
  onProgress?: (currentTime: number, duration: number, percent: number) => void;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onError?: (error: any) => void;
  className?: string;
}

export const YouTubeIframePlayer = forwardRef<YouTubePlayerRef, YouTubeIframePlayerProps>(
  (
    {
      youtubeId,
      initialTime = 0,
      autoPlay = false,
      completionThreshold = 90,
      onProgress,
      onEnded,
      onPlay,
      onPause,
      onError,
      className = '',
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const intervalRef = useRef<any>(null);
    const [isApiLoaded, setIsApiLoaded] = useState<boolean>(!!window.YT?.Player);
    const [playerError, setPlayerError] = useState<string | null>(null);

    // ─── Callback refs ───────────────────────────────────────────────────────
    // Store every callback in a ref so the player useEffect does NOT need them
    // in its dependency array. This prevents the player from being destroyed
    // and re-created every time React re-renders due to progress state changes.
    const onProgressRef = useRef(onProgress);
    const onEndedRef    = useRef(onEnded);
    const onPlayRef     = useRef(onPlay);
    const onPauseRef    = useRef(onPause);
    const onErrorRef    = useRef(onError);

    // Keep the refs up to date without causing re-renders
    useEffect(() => { onProgressRef.current = onProgress; }, [onProgress]);
    useEffect(() => { onEndedRef.current    = onEnded;    }, [onEnded]);
    useEffect(() => { onPlayRef.current     = onPlay;     }, [onPlay]);
    useEffect(() => { onPauseRef.current    = onPause;    }, [onPause]);
    useEffect(() => { onErrorRef.current    = onError;    }, [onError]);
    // ─────────────────────────────────────────────────────────────────────────

    // Load the official YouTube IFrame Player API script if not present
    useEffect(() => {
      if (window.YT && window.YT.Player) {
        setIsApiLoaded(true);
        return;
      }

      const existingScript = document.getElementById('youtube-iframe-api');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        setIsApiLoaded(true);
      };
    }, []);

    // Progress polling — uses ref so it never causes effect re-runs
    const startProgressPolling = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const currentTime = playerRef.current.getCurrentTime() || 0;
          const duration    = playerRef.current.getDuration()    || 0;
          const percent     = duration > 0 ? Math.min(100, Math.round((currentTime / duration) * 100)) : 0;
          onProgressRef.current?.(currentTime, duration, percent);
        }
      }, 5000);
    };

    const stopProgressPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const captureImmediateProgress = () => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const currentTime = playerRef.current.getCurrentTime() || 0;
        const duration    = playerRef.current.getDuration()    || 0;
        const percent     = duration > 0 ? Math.min(100, Math.round((currentTime / duration) * 100)) : 0;
        onProgressRef.current?.(currentTime, duration, percent);
      }
    };

    // ─── Player initialization ────────────────────────────────────────────────
    // ONLY re-run when the video ID or autoPlay changes.
    // Callbacks are accessed via refs so they are NEVER dependencies here.
    useEffect(() => {
      if (!isApiLoaded || !containerRef.current || !youtubeId) return;

      setPlayerError(null);
      const playerId = `yt-player-${Math.random().toString(36).substring(2, 9)}`;
      const playerElement = document.createElement('div');
      playerElement.id = playerId;
      playerElement.style.width  = '100%';
      playerElement.style.height = '100%';
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(playerElement);

      try {
        playerRef.current = new window.YT.Player(playerId, {
          videoId: youtubeId,
          width:  '100%',
          height: '100%',
          playerVars: {
            autoplay:       autoPlay ? 1 : 0,
            start:          Math.floor(initialTime),
            modestbranding: 1,
            rel:            0,
            controls:       1,
            enablejsapi:    1,
            origin:         window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              // Force the injected iframe to fill its container
              const iframe = event.target.getIframe() as HTMLIFrameElement;
              if (iframe) {
                iframe.style.width    = '100%';
                iframe.style.height   = '100%';
                iframe.style.position = 'absolute';
                iframe.style.top      = '0';
                iframe.style.left     = '0';
              }
              if (initialTime > 0) {
                event.target.seekTo(initialTime, true);
              }
            },
            onStateChange: (event: any) => {
              // YT.PlayerState: PLAYING = 1, PAUSED = 2, ENDED = 0
              if (event.data === 1) {
                startProgressPolling();
                onPlayRef.current?.();
              } else if (event.data === 2) {
                stopProgressPolling();
                captureImmediateProgress();
                onPauseRef.current?.();
              } else if (event.data === 0) {
                stopProgressPolling();
                captureImmediateProgress();
                onEndedRef.current?.();
              }
            },
            onError: (err: any) => {
              console.warn('YouTube Player Event Error:', err);
              setPlayerError('This video cannot currently be played or is restricted by YouTube.');
              onErrorRef.current?.(err);
            },
          },
        });
      } catch (err) {
        console.error('Failed to construct YouTube Player:', err);
        setPlayerError('Unable to load official YouTube Player.');
      }

      // Cleanup on unmount or video ID change
      return () => {
        captureImmediateProgress();
        stopProgressPolling();
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
          try { playerRef.current.destroy(); } catch {}
          playerRef.current = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isApiLoaded, youtubeId, autoPlay]);
    // ─────────────────────────────────────────────────────────────────────────

    // Save progress on page unload
    useEffect(() => {
      const handleBeforeUnload = () => captureImmediateProgress();
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    // Expose imperative API
    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => {
        if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
          playerRef.current.seekTo(seconds, true);
        }
      },
      play: () => {
        if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
        }
      },
      pause: () => {
        if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
          playerRef.current.pauseVideo();
        }
      },
      getCurrentTime: () => playerRef.current?.getCurrentTime() || 0,
      getDuration:    () => playerRef.current?.getDuration()    || 0,
    }));

    if (playerError) {
      return (
        <div className={`w-full aspect-video bg-[#121214] border-[3px] border-black rounded-xl flex flex-col items-center justify-center p-6 text-center text-white ${className}`}>
          <div className="w-12 h-12 bg-red-500 border-2 border-black rounded-lg flex items-center justify-center font-black text-2xl mb-3 shadow-[2px_2px_0px_#000]">
            ⚠️
          </div>
          <h3 className="text-lg font-black uppercase text-[#FFE600] mb-1">
            VIDEO UNAVAILABLE
          </h3>
          <p className="text-xs font-bold text-gray-400 max-w-md mb-4">
            {playerError}
          </p>
          <a
            href={`https://www.youtube.com/watch?v=${youtubeId}`}
            target="_blank"
            rel="noreferrer"
            className="bg-[#FFE600] text-black border-2 border-black px-4 py-2 rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5"
          >
            Watch on YouTube ↗
          </a>
        </div>
      );
    }

    return (
      <div className={`yt-player-wrapper w-full aspect-video bg-black border-[3px] border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_#000] relative ${className}`}>
        <div ref={containerRef} className="absolute inset-0 w-full h-full" />
      </div>
    );
  }
);

YouTubeIframePlayer.displayName = 'YouTubeIframePlayer';
