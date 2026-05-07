import { useState, useEffect, useRef } from "react";
import { useCollections } from "../../hooks/useCollections";
import { Icon } from "@iconify/react";
import ReviewSection from "../shared/ReviewSection";

const API_BASE = "";

function LyricsSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[100, 80, 90, 70, 85, 60, 95, 75].map((w, i) => (
        <div
          key={i}
          className="h-4 rounded-full bg-bone dark:bg-night-edge"
          style={{ width: `${w}%` }}
        />
      ))}
    </div>
  );
}

export default function TrackDetail({ track }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [lyrics, setLyrics] = useState(null); // null = cargando, "" = no encontrado
  const [lyricsLoading, setLyricsLoading] = useState(true);
  
  const [showCollections, setShowCollections] = useState(false);
  const { collections, addItem } = useCollections();
  const menuRef = useRef(null);

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

  const handleAddToCollection = async (collectionId) => {
    await addItem(collectionId, {
      apiId: track.id,
      title: track.title,
      type: "music",
      metadata: {
        artist: track.artist,
        cover: track.cover,
        previewUrl: track.previewUrl,
        genre: track.genre,
        album: track.album,
        albumId: track.albumId
      }
    });
    setShowCollections(false);
    alert("¡Canción añadida a la colección!");
  };

  const musicCollections = collections.filter(c => c.type === "music");

  useEffect(() => {
    const onPlayerState = (e) => {
      setIsPlaying(e.detail?.id === track.id && e.detail?.playing);
    };
    window.addEventListener("player-state", onPlayerState);
    return () => window.removeEventListener("player-state", onPlayerState);
  }, [track.id]);

  useEffect(() => {
    if (!track) return;

    const durationSeconds = track.duration
      ? Math.round(track.duration / 1000)
      : 0;

    const params = new URLSearchParams({
      track_name: track.title,
      artist_name: track.artist,
      album_name: track.album ?? "",
      ...(durationSeconds > 0 && { duration: String(durationSeconds) }),
    });

    fetch(`${API_BASE}/api/music/lyrics?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => {
        setLyrics(data.plainLyrics || data.syncedLyrics || "");
        setLyricsLoading(false);
      })
      .catch(() => {
        setLyrics("");
        setLyricsLoading(false);
      });
  }, [track]);

  const handlePlay = () => {
    if (!track.previewUrl) return;
    window.dispatchEvent(
      new CustomEvent("play-track", {
        detail: { track, queue: [track] },
      })
    );
  };

  const hasPreview = Boolean(track.previewUrl);
  const isScrollable = lyrics && lyrics.length > 500;

  return (
    <div className="flex flex-col gap-8 pb-32">
      <div
        className="relative z-20 flex flex-col sm:flex-row sm:items-end gap-7 px-5 pt-12 pb-9 sm:px-9
          rounded-2xl border border-bone dark:border-night-edge backdrop-blur-xl"
        style={{
          background:
            "linear-gradient(to bottom, rgba(88,28,135,0.6) 0%, rgba(9,9,11,0.95) 100%)",
        }}
      >
        {/* Portada */}
        <div className="flex-shrink-0">
          {track.cover ? (
            <img
              src={track.cover}
              alt={`${track.title} artwork`}
              className="w-40 h-40 sm:w-[220px] sm:h-[220px] rounded-lg object-cover
                shadow-[0_8px_48px_rgba(0,0,0,0.6)]"
            />
          ) : (
            <div
              className="w-40 h-40 sm:w-[220px] sm:h-[220px] rounded-lg
                bg-linen dark:bg-coal flex items-center justify-center
                text-6xl text-ink/20 dark:text-screen/20"
            >
              <Icon icon="tabler:music" />
            </div>
          )}
        </div>

        {/* Información */}
          <div className="flex flex-col gap-2.5 min-w-0 text-ink dark:text-screen">
            <span className="text-[0.7rem] font-bold uppercase tracking-[2px] text-slate dark:text-mist">
            SONG
          </span>

          <h1
            className="m-0 font-black leading-[1.05] tracking-tight text-ink dark:text-screen"
            style={{ fontSize: "clamp(1.8rem, 4vw, 3.5rem)" }}
          >
            {track.title}
          </h1>

          <div className="flex items-center gap-2 flex-wrap text-[0.95rem]">
            <span className="font-bold text-ink dark:text-screen">{track.artist}</span>
            {track.album && (
              <>
                <span className="text-ink/30 dark:text-screen/30 text-xs">•</span>
                {track.albumId ? (
                  <a
                    href={`/music/album/${track.albumId}`}
                    className="text-ink/65 dark:text-screen/65 hover:text-amethyst dark:hover:text-orchid hover:underline transition-colors"
                  >
                    {track.album}
                  </a>
                ) : (
                  <span className="text-ink/65 dark:text-screen/65">{track.album}</span>
                )}
              </>
            )}
            {track.genre && (
              <>
                <span className="text-ink/30 dark:text-screen/30 text-xs">•</span>
                <span
                  className="text-xs font-medium px-2.5 py-0.5 rounded-full
                    bg-lilac-mist border border-amethyst/35 text-amethyst
                    dark:bg-depth dark:border-orchid/35 dark:text-orchid"
                >
                  {track.genre}
                </span>
              </>
            )}
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-4 mt-3">
            <button
              id="track-detail-play-btn"
              onClick={handlePlay}
              disabled={!hasPreview}
              aria-label={isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
              title={!hasPreview ? "No preview available" : isPlaying ? "Pause" : "Play"}
              className={[
                "w-[60px] h-[60px] rounded-full border-none flex items-center justify-center",
                "transition-all duration-200",
                hasPreview
                  ? "bg-amethyst text-screen cursor-pointer shadow-[0_4px_20px_rgba(139,111,189,0.45)] hover:scale-[1.08] hover:bg-orchid dark:bg-sapphire dark:hover:bg-depth hover:shadow-[0_6px_28px_rgba(139,111,189,0.6)]"
                  : "bg-bone dark:bg-night-edge text-slate dark:text-mist cursor-not-allowed shadow-none",
              ].join(" ")}
            >
              <Icon 
                icon={isPlaying ? "tabler:player-pause-filled" : "tabler:player-play-filled"} 
                className="w-8 h-8"
              />
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowCollections(!showCollections)}
                className="flex items-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white font-semibold transition-all active:scale-95"
              >
                <Icon icon="tabler:plus" className="w-5 h-5" />
                Añadir a lista
              </button>

              {showCollections && (
                <div className="absolute top-full left-0 mt-3 w-56 bg-white dark:bg-night-edge border border-bone dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-3 border-b border-bone dark:border-white/5">
                    <p className="text-[10px] font-bold text-slate dark:text-white/40 uppercase tracking-widest px-2 text-left">Mis Listas de Música</p>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {musicCollections.length === 0 ? (
                      <p className="text-xs text-slate dark:text-white/30 p-4 italic text-center">No tienes listas de música</p>
                    ) : (
                      musicCollections.map(col => {
                        const isAdded = col.items.some(i => i.apiId === track.id);
                        return (
                          <button
                            key={col.id}
                            onClick={() => !isAdded && handleAddToCollection(col.id)}
                            disabled={isAdded}
                            className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors ${
                              isAdded 
                                ? "text-amethyst bg-amethyst/5 cursor-default" 
                                : "text-ink dark:text-white/70 hover:bg-amethyst/10 hover:text-amethyst"
                            }`}
                          >
                            <div className="flex items-center gap-3 truncate">
                              <Icon icon="tabler:list" className="w-5 h-5 opacity-40" />
                              <span className="truncate">{col.name}</span>
                            </div>
                            {isAdded && <Icon icon="tabler:check" className="w-5 h-5" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                  <a 
                    href="/profile" 
                    className="block text-center p-3 text-[10px] font-bold text-amethyst hover:text-orchid border-t border-bone dark:border-white/5 uppercase tracking-wider transition-colors"
                  >
                    + Nueva Lista
                  </a>
                </div>
              )}
            </div>

            {!hasPreview && (
              <span className="text-xs text-slate dark:text-mist italic">
                No preview available
              </span>
            )}
          </div>

        </div>
      </div>

      <div className="px-1 max-w-3xl">
        <h2 className="flex items-center gap-2 text-[1.4rem] font-extrabold text-ink dark:text-screen tracking-tight mb-6">
          <Icon 
            icon="tabler:microphone-2" 
            className="text-[1.4rem] text-amethyst dark:text-orchid" 
          />
          Lyrics
        </h2>

        {lyricsLoading ? (
          <LyricsSkeleton />
        ) : lyrics ? (
          <div
            className={[
              "relative",
              isScrollable
                ? "max-h-[560px] overflow-y-auto pr-3 [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/15 hover:scrollbar-thumb-white/30"
                : "",
            ].join(" ")}
          >
            <p className="whitespace-pre-wrap text-[1.05rem] leading-[1.85] text-slate dark:text-mist m-0 font-normal">
              {lyrics}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-1.5 py-6 text-slate dark:text-mist">
            <Icon 
              icon="tabler:music-off" 
              className="text-[2.5rem] opacity-40 mb-1" 
            />
            <p className="m-0 text-base font-semibold text-slate dark:text-mist">
              Lyrics not found
            </p>
            <p className="m-0 text-[0.85rem] font-normal text-slate/70 dark:text-mist/70">
              No lyrics available for this song in our database.
            </p>
          </div>
        )}
      </div>
      <div className="px-5 sm:px-9 mt-4 w-full">
        <ReviewSection itemType="music" itemApiId={track.id} accentColor="purple" />
      </div>
    </div>
  );
}
