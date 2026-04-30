// src/components/music/TrackCard.jsx
import { useState, useEffect } from "react";

/**
 * Tarjeta de canción.
 * - Click en la tarjeta → navega a /music/{track.id}
 * - Click en el botón ▶ → reproduce directamente en el FooterPlayer (sin navegar)
 *
 * @param {{ track: import('./types').Track, queue: import('./types').Track[] }} props
 */
export default function TrackCard({ track, queue = [] }) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Sincronizar estado play/pause con el FooterPlayer
  useEffect(() => {
    const onTrackChanged = (e) => {
      setIsPlaying(e.detail?.id === track.id && e.detail?.playing);
    };
    window.addEventListener("player-state", onTrackChanged);
    return () => window.removeEventListener("player-state", onTrackChanged);
  }, [track.id]);

  const handlePlay = (e) => {
    e.preventDefault();      // evita la navegación del enlace padre
    e.stopPropagation();
    if (!track.previewUrl) return;

    window.dispatchEvent(
      new CustomEvent("play-track", {
        detail: { track, queue },
      })
    );
  };

  const hasPreview = Boolean(track.previewUrl);

  return (
    <a
      href={`/music/${track.id}`}
      className="group relative rounded-2xl overflow-hidden bg-sand dark:bg-coal border border-bone dark:border-night-edge shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amethyst/10 dark:hover:shadow-orchid/10 hover:border-bone dark:hover:border-night-edge/60 cursor-pointer block no-underline"
      aria-label={`Ver detalle de ${track.title}`}
    >
      {/* Portada */}
      <div className="relative aspect-square overflow-hidden">
        {track.cover ? (
          <img
            src={track.cover}
            alt={`${track.title} artwork`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-linen dark:bg-coal flex items-center justify-center">
            <span className="material-symbols-rounded text-4xl opacity-40">music_note</span>
          </div>
        )}

        {/* Capa de degradado */}
        <div className="absolute inset-0 bg-gradient-to-t from-sand/90 dark:from-coal/90 via-transparent to-transparent" />

        {/* Play button — stopPropagation para no navegar */}
        <button
          id={`play-btn-${track.id}`}
          onClick={handlePlay}
          disabled={!hasPreview}
          aria-label={isPlaying ? `Pausar ${track.title}` : `Reproducir ${track.title}`}
          className={[
            "absolute bottom-3 right-3 w-11 h-11 rounded-full flex items-center justify-center",
            "transition-all duration-200 shadow-xl",
            "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
            hasPreview
              ? "bg-ink dark:bg-screen text-screen dark:text-ink hover:scale-105 hover:bg-lilac-mist dark:hover:bg-lilac-mist cursor-pointer"
              : "bg-bone dark:bg-night-edge text-slate dark:text-mist cursor-not-allowed opacity-50",
          ].join(" ")}
        >
          <span className="material-symbols-rounded text-[24px]">
            {isPlaying ? "pause" : "play_arrow"}
          </span>
        </button>

        {/* Insignia de no vista previa */}
        {!hasPreview && (
          <div className="absolute top-2 left-2 rounded-full bg-abyss/60 px-2 py-0.5 text-[10px] text-mist font-medium">
            No preview
          </div>
        )}
      </div>

      {/* Información */}
      <div className="p-3 space-y-1">
        <h3 className="font-semibold text-ink dark:text-screen text-sm leading-snug line-clamp-1">
          {track.title}
        </h3>
        <p className="text-slate dark:text-mist text-xs line-clamp-1">{track.artist}</p>
        {track.genre && (
          <span className="inline-block text-[10px] font-medium rounded-full border border-amethyst/30 bg-lilac-mist dark:bg-depth text-amethyst dark:text-orchid px-2 py-0.5">
            {track.genre}
          </span>
        )}
      </div>
    </a>
  );
}
