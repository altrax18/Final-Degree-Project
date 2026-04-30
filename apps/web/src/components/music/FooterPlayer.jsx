// src/components/music/FooterPlayer.jsx
import { useState, useEffect, useRef, useCallback } from "react";

/** Formatear segundos → "m:ss" */
function fmt(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec < 10 ? "0" + sec : sec}`;
}

export default function FooterPlayer() {
  const audioRef = useRef(null);

  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState(/** @type {any[]} */ ([]));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const [volume, setVolume] = useState(0.4);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Evitar closure obsoleto en el manejador 'ended'
  const isLoopRef = useRef(isLoop);
  useEffect(() => { isLoopRef.current = isLoop; }, [isLoop]);

  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.4;
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setQueue((q) => {
        setCurrentTrack((ct) => {
          if (!ct || q.length === 0) return ct;
          const idx = q.findIndex((t) => t.id === ct.id);
          let next = q[idx + 1];
          
          if (!next && isLoopRef.current && q.length > 0) {
            next = q[0];
          }

          if (next?.previewUrl) {
            audio.src = next.previewUrl;
            audio.load();
            audio.play().catch(() => {
              /* Ignore auto-play blocking errors silently */
            });
            return next;
          }
          // Alternativa si no hay vista previa disponible, mantener la canción actual detenida.
          return ct;
        });
        return q;
      });
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      audio.src = "";
    };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const { track, queue: newQueue } = e.detail;
      if (!track?.previewUrl) return;

      const audio = audioRef.current;
      if (!audio) return;

      // Clic en la misma canción → alternar pausa/reproducción
      if (currentTrack?.id === track.id) {
        audio.paused ? audio.play().catch(() => {}) : audio.pause();
        return;
      }

      // Nueva canción
      if (newQueue?.length > 0) setQueue(newQueue);
      setCurrentTrack(track);
      setIsVisible(true);
      audio.src = track.previewUrl;
      audio.load();
      audio.play().catch(() => {});
    };

    window.addEventListener("play-track", handler);
    return () => window.removeEventListener("play-track", handler);
  }, [currentTrack]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("player-state", {
        detail: { id: currentTrack?.id, playing: isPlaying },
      })
    );
  }, [isPlaying, currentTrack]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    audio.paused ? audio.play().catch(() => {}) : audio.pause();
  };

  const seek = (e) => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = Number(e.target.value);
  };

  const changeVolume = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val;
    if (val > 0 && isMuted) setIsMuted(false);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const skipTo = useCallback((direction) => {
    const audio = audioRef.current;
    if (!audio || !currentTrack || queue.length === 0) return;
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    
    let nextTrack;
    if (direction === "next") {
      if (idx < queue.length - 1) {
        nextTrack = queue[idx + 1];
      } else if (isLoop) {
        nextTrack = queue[0];
      }
    } else {
      if (idx > 0) {
        nextTrack = queue[idx - 1];
      }
    }

    if (nextTrack?.previewUrl) {
      setCurrentTrack(nextTrack);
      audio.src = nextTrack.previewUrl;
      audio.load();
      audio.play().catch(() => {});
    }
  }, [currentTrack, queue, isLoop]);

  const toggleShuffle = () => {
    if (!isShuffle) {
      setQueue((q) => {
        const shuffled = [...q].sort(() => Math.random() - 0.5);
        const idx = shuffled.findIndex((t) => t.id === currentTrack?.id);
        if (idx > -1) {
          shuffled.splice(idx, 1);
          shuffled.unshift(currentTrack);
        }
        return shuffled;
      });
    }
    setIsShuffle((s) => !s);
  };

  const volumeIcon =
    isMuted || volume === 0 ? "volume_off" : "volume_up";
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePct = isMuted ? 0 : volume * 100;

  if (!isVisible) return null;

  return (
    <div
      id="footer-player"
      role="region"
      aria-label="Music player"
      className="fixed bottom-0 left-0 right-0 z-[100] h-20 flex items-center px-6 gap-4
        bg-parchment/95 dark:bg-abyss/95 backdrop-blur-xl border-t border-bone dark:border-night-edge font-sans text-ink dark:text-screen"
    >
      <div className="flex items-center gap-3 w-[28%] min-w-[180px] overflow-hidden">
        {currentTrack?.cover ? (
          <img
            src={currentTrack.cover}
            alt=""
            className="w-[52px] h-[52px] rounded-md object-cover flex-shrink-0 shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
          />
        ) : (
          <div className="w-[52px] h-[52px] rounded-md bg-linen dark:bg-coal flex items-center justify-center text-slate dark:text-mist flex-shrink-0">
            <span className="material-symbols-rounded text-[28px]">music_note</span>
          </div>
        )}
        <div className="overflow-hidden">
          {currentTrack ? (
            <a
              href={`/music/${currentTrack.id}`}
              className="block m-0 text-[13px] font-semibold text-ink dark:text-screen truncate hover:underline hover:text-amethyst dark:hover:text-orchid transition-colors"
            >
              {currentTrack.title}
            </a>
          ) : (
            <p className="m-0 text-[13px] font-semibold text-ink dark:text-screen truncate">
              —
            </p>
          )}
          <p className="m-0 text-[11px] text-slate dark:text-mist truncate">
            {currentTrack?.artist ?? ""}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-4">
          {/* Aleatorio */}
          <button
            id="player-shuffle"
            onClick={toggleShuffle}
            aria-label="Shuffle"
            aria-pressed={isShuffle}
            className={`bg-transparent border-none cursor-pointer p-1 transition-colors leading-none flex items-center justify-center ${
              isShuffle ? "text-amethyst dark:text-orchid" : "text-slate dark:text-mist"
            }`}
          >
            <span className="material-symbols-rounded text-[22px]">shuffle</span>
          </button>

          {/* Anterior */}
          <button
            id="player-prev"
            onClick={() => skipTo("prev")}
            aria-label="Previous track"
            className="bg-transparent border-none cursor-pointer p-1 transition-colors leading-none text-slate dark:text-mist hover:text-ink dark:hover:text-screen flex items-center justify-center"
          >
            <span className="material-symbols-rounded text-[28px]">skip_previous</span>
          </button>

          {/* Reproducir/Pausa */}
          <button
            id="player-play-pause"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="w-[38px] h-[38px] rounded-full bg-ink dark:bg-screen border-none flex items-center justify-center
              cursor-pointer text-screen dark:text-ink flex-shrink-0
              transition-[transform,background] duration-150
              hover:scale-[1.07] hover:bg-lilac-mist"
          >
            <span className="material-symbols-rounded text-[28px]">
              {isPlaying ? "pause" : "play_arrow"}
            </span>
          </button>

          {/* Siguiente */}
          <button
            id="player-next"
            onClick={() => skipTo("next")}
            aria-label="Next track"
            className="bg-transparent border-none cursor-pointer p-1 transition-colors leading-none text-slate dark:text-mist hover:text-ink dark:hover:text-screen flex items-center justify-center"
          >
            <span className="material-symbols-rounded text-[28px]">skip_next</span>
          </button>

          {/* Bucle */}
          <button
            id="player-loop"
            onClick={() => setIsLoop((l) => !l)}
            aria-label="Repeat"
            aria-pressed={isLoop}
            className={`bg-transparent border-none cursor-pointer p-1 transition-colors leading-none flex items-center justify-center ${
              isLoop ? "text-amethyst dark:text-orchid" : "text-slate dark:text-mist"
            }`}
          >
            <span className="material-symbols-rounded text-[22px]">repeat</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full max-w-[520px]">
          <span className="text-[10px] text-slate dark:text-mist min-w-8 text-right tabular-nums">
            {fmt(currentTime)}
          </span>

          <div className="relative flex-1 h-1 cursor-pointer">
            <div className="absolute inset-0 bg-bone dark:bg-night-edge rounded-full" />
            <div
              className="absolute top-0 left-0 h-full bg-amethyst rounded-full transition-[width] duration-100 ease-linear"
              style={{ width: `${progressPct}%` }}
            />
            <input
              type="range"
              id="player-progress"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={seek}
              aria-label="Seek"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer m-0"
            />
          </div>

          <span className="text-[10px] text-slate dark:text-mist min-w-8 tabular-nums">
            {fmt(duration)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 w-[22%] justify-end">
        <button
          id="player-mute"
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute" : "Mute"}
          className="bg-transparent border-none cursor-pointer text-slate dark:text-mist transition-colors leading-none p-1 flex items-center justify-center"
        >
          <span className="material-symbols-rounded text-[20px]">{volumeIcon}</span>
        </button>

        <div className="relative w-20 h-1 cursor-pointer">
          <div className="absolute inset-0 bg-bone dark:bg-night-edge rounded-full" />
          <div
            className="absolute top-0 left-0 h-full bg-amethyst rounded-full"
            style={{ width: `${volumePct}%` }}
          />
          <input
            type="range"
            id="player-volume"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={changeVolume}
            aria-label="Volume"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer m-0"
          />
        </div>
      </div>
    </div>
  );
}
