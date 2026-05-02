import { useState, useEffect, useRef } from "react";
import { useCollections } from "../../hooks/useCollections";
import { Icon } from "@iconify/react";

/**
 * Tarjeta de canción.
 * - Click en la tarjeta → navega a /music/{track.id}
 * - Click en el botón ▶ → reproduce directamente en el FooterPlayer (sin navegar)
 *
 * @param {{ track: import('./types').Track, queue: import('./types').Track[] }} props
 */
export default function TrackCard({ track, queue = [] }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const { collections, addItem } = useCollections();
  const menuRef = useRef(null);

  // Sincronizar estado play/pause con el FooterPlayer
  useEffect(() => {
    const onTrackChanged = (e) => {
      setIsPlaying(e.detail?.id === track.id && e.detail?.playing);
    };
    window.addEventListener("player-state", onTrackChanged);
    return () => window.removeEventListener("player-state", onTrackChanged);
  }, [track.id]);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowCollections(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleAddToCollection = async (e, collectionId) => {
    e.preventDefault();
    e.stopPropagation();
    
    await addItem(collectionId, {
      apiId: track.id,
      title: track.title,
      type: "music",
      metadata: {
        artist: track.artist,
        cover: track.cover,
        previewUrl: track.previewUrl,
        genre: track.genre
      }
    });
    
    setShowCollections(false);
    alert("¡Canción añadida a la colección!");
  };

  const hasPreview = Boolean(track.previewUrl);
  const musicCollections = collections.filter(c => c.type === "music");

  return (
    <div className="group relative rounded-2xl bg-sand dark:bg-coal border border-bone dark:border-night-edge shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amethyst/10 dark:hover:shadow-orchid/10 hover:border-bone dark:hover:border-night-edge/60 cursor-pointer block no-underline">
      <a
        href={`/music/${track.id}`}
        className="block no-underline"
        aria-label={`Ver detalle de ${track.title}`}
      >
        {/* Portada */}
        <div className="relative aspect-square overflow-hidden rounded-t-2xl">
          {track.cover ? (
            <img
              src={track.cover}
              alt={`${track.title} artwork`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-linen dark:bg-coal flex items-center justify-center text-slate dark:text-mist">
              <Icon icon="tabler:music" className="text-4xl opacity-40" />
            </div>
          )}

          {/* Capa de degradado */}
          <div className="absolute inset-0 bg-gradient-to-t from-sand/90 dark:from-coal/90 via-transparent to-transparent" />
        </div>
      </a>

      {/* Botones flotantes (fuera del enlace) */}
      <div className="absolute top-2 right-2 flex flex-col gap-2 z-20">
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowCollections(!showCollections); }}
            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
            title="Añadir a colección"
          >
            <Icon icon="tabler:plus" className="w-5 h-5" />
          </button>

          {showCollections && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-night-edge border border-bone dark:border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-2 border-b border-bone dark:border-white/5">
                <p className="text-[10px] font-bold text-slate dark:text-white/40 uppercase tracking-widest px-2">Mis Listas</p>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {musicCollections.length === 0 ? (
                  <p className="text-xs text-slate dark:text-white/30 p-3 italic text-center">No tienes listas de música</p>
                ) : (
                  musicCollections.map(col => (
                    <button
                      key={col.id}
                      onClick={(e) => handleAddToCollection(e, col.id)}
                      className="w-full text-left px-4 py-2 text-sm text-ink dark:text-white/70 hover:bg-amethyst/10 hover:text-amethyst transition-colors flex items-center gap-2"
                    >
                      <Icon icon="tabler:list" className="w-4 h-4 opacity-40" />
                      <span className="truncate">{col.name}</span>
                    </button>
                  ))
                )}
              </div>
              <a 
                href="/profile" 
                className="block text-center p-2 text-[10px] font-bold text-amethyst hover:text-orchid border-t border-bone dark:border-white/5 uppercase tracking-wider"
              >
                + Nueva Lista
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Play button flotante */}
      <button
        id={`play-btn-${track.id}`}
        onClick={handlePlay}
        disabled={!hasPreview}
        aria-label={isPlaying ? `Pausar ${track.title}` : `Reproducir ${track.title}`}
        className={[
          "absolute bottom-20 right-3 w-11 h-11 rounded-full flex items-center justify-center z-20",
          "transition-all duration-200 shadow-xl",
          "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
          hasPreview
            ? "bg-ink dark:bg-screen text-screen dark:text-ink hover:scale-105 hover:bg-lilac-mist dark:hover:bg-lilac-mist cursor-pointer"
            : "bg-bone dark:bg-night-edge text-slate dark:text-mist cursor-not-allowed opacity-50",
        ].join(" ")}
      >
        <Icon 
          icon={isPlaying ? "tabler:player-pause-filled" : "tabler:player-play-filled"} 
          className="text-2xl" 
        />
      </button>

      {/* Insignia de no vista previa */}
      {!hasPreview && (
        <div className="absolute top-2 left-2 rounded-full bg-abyss/60 px-2 py-0.5 text-[10px] text-mist font-medium z-20">
          No preview
        </div>
      )}

      {/* Información */}
      <a href={`/music/${track.id}`} className="p-3 space-y-1 block no-underline">
        <h3 className="font-semibold text-ink dark:text-screen text-sm leading-snug line-clamp-1">
          {track.title}
        </h3>
        <p className="text-slate dark:text-mist text-xs line-clamp-1">{track.artist}</p>
        {track.genre && (
          <span className="inline-block text-[10px] font-medium rounded-full border border-amethyst/30 bg-lilac-mist dark:bg-depth text-amethyst dark:text-orchid px-2 py-0.5">
            {track.genre}
          </span>
        )}
      </a>
    </div>
  );
}

