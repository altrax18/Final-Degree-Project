import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import NowPlayingBars from "../shared/NowPlayingBars";
import type { Track, Album } from "../../types/music";

// --- Helpers ---

/** Formatea milisegundos en "m:ss" */
function formatDuration(ms?: number | null) {
  if (!ms) return "0:00";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

/** Extrae año de un dateString ISO */
function getYear(dateString?: string | null) {
  if (!dateString) return "";
  return new Date(dateString).getFullYear().toString();
}

// --- Sub-componente: fila de canción ---

interface TrackRowProps {
  track: Track;
  index: number;
  currentTrackId: string | null;
  isPlaying: boolean;
  allTracks: Track[];
}

function TrackRow({ track, index, currentTrackId, isPlaying, allTracks }: TrackRowProps) {
  const isActive = currentTrackId === track.id;
  const isActiveAndPlaying = isActive && isPlaying;

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!track.previewUrl) return;
    window.dispatchEvent(
      new CustomEvent("play-track", {
        detail: { track, queue: allTracks },
      })
    );
  };

  return (
    <div
      className={[
        "group grid items-center gap-3 px-4 py-2.5 rounded-md cursor-pointer transition-colors duration-150",
        "grid-cols-[40px_minmax(0,1fr)_auto]",
        isActive
          ? "bg-lilac-mist/20 dark:bg-depth/30"
          : "hover:bg-sand dark:hover:bg-coal",
      ].join(" ")}
      onClick={handlePlay}
      role="row"
    >
      {/* Número / equalizer / botón play */}
      <div className="flex items-center justify-center w-8 shrink-0 relative">
        {/* Estado normal (sin hover): número o equalizer animado */}
        <span
          className={[
            "text-[0.9rem] tabular-nums transition-opacity",
            "group-hover:hidden",
            isActive ? "flex" : "block",
          ].join(" ")}
        >
          {isActive ? (
            // Equalizer animado cuando suena, barras estáticas cuando pausado
            <NowPlayingBars paused={!isPlaying} />
          ) : (
            <span className="text-slate dark:text-mist">{index + 1}</span>
          )}
        </span>

        {/* Botón play que aparece al hover */}
        <button
          onClick={handlePlay}
          disabled={!track.previewUrl}
          aria-label={
            isActiveAndPlaying
              ? `Pausar ${track.title}`
              : `Reproducir ${track.title}`
          }
          className={[
            "hidden group-hover:flex items-center justify-center w-full h-full transition-colors",
            track.previewUrl
              ? "text-ink dark:text-screen hover:text-amethyst dark:hover:text-orchid cursor-pointer"
              : "text-slate/40 dark:text-mist/40 cursor-not-allowed",
          ].join(" ")}
        >
          <Icon
            icon={
              isActiveAndPlaying
                ? "tabler:player-pause-filled"
                : "tabler:player-play-filled"
            }
            className="text-[1.1rem]"
          />
        </button>
      </div>

      {/* Info de la canción */}
      <div className="flex flex-col min-w-0">
        <a
          href={`/music/${track.id}`}
          onClick={(e) => e.stopPropagation()}
          className={[
            "text-[0.95rem] font-normal truncate leading-snug hover:underline transition-colors",
            isActive
              ? "text-amethyst dark:text-orchid font-medium"
              : "text-ink dark:text-screen group-hover:text-ink dark:group-hover:text-screen",
          ].join(" ")}
        >
          {track.title}
        </a>
        <span className="text-[0.8rem] text-slate dark:text-mist truncate group-hover:text-slate dark:group-hover:text-mist">
          {track.artist}
        </span>
      </div>

      {/* Duración */}
      <span className="text-[0.8rem] text-slate dark:text-mist tabular-nums shrink-0 text-right">
        {formatDuration(track.duration)}
      </span>
    </div>
  );
}

// --- Componente principal ---

interface AlbumDetailProps {
  album: Album;
  tracks?: Track[];
}

/**
 * Detalle de álbum al estilo SoundHub pero con el design system del FDP.
 */
export default function AlbumDetail({ album, tracks = [] }: AlbumDetailProps) {
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Sincronizar con FooterPlayer
  useEffect(() => {
    const onPlayerState = (e: any) => {
      setCurrentTrackId(e.detail?.id ?? null);
      setIsPlaying(Boolean(e.detail?.playing));
    };
    window.addEventListener("player-state", onPlayerState as EventListener);
    return () => window.removeEventListener("player-state", onPlayerState as EventListener);
  }, []);

  const enrichedTracks = tracks.map(t => ({
    ...t,
    album: album.title,
    albumId: album.id
  }));

  const isAlbumPlaying =
    isPlaying && enrichedTracks.some((t) => t.id === currentTrackId);

  const playAlbum = () => {
    if (!enrichedTracks.length) return;
    if (isAlbumPlaying) {
      // Pausar
      const currentTrack = enrichedTracks.find((t) => t.id === currentTrackId);
      if (currentTrack) {
        window.dispatchEvent(
          new CustomEvent("play-track", {
            detail: { track: currentTrack, queue: enrichedTracks },
          })
        );
      }
    } else {
      // Si hay una canción del álbum pausada, reanudarla; si no, empezar desde la primera
      const paused = enrichedTracks.find((t) => t.id === currentTrackId);
      const startTrack = paused || enrichedTracks.find((t) => t.previewUrl);
      if (startTrack) {
        window.dispatchEvent(
          new CustomEvent("play-track", {
            detail: { track: startTrack, queue: enrichedTracks },
          })
        );
      }
    }
  };

  const isScrollable = enrichedTracks.length > 15;

  return (
    <div className="flex flex-col gap-0 pb-32">
      {/* ── CABECERA ── */}
      <header
        className="relative flex flex-col sm:flex-row sm:items-end gap-6 px-6 pt-10 pb-8 sm:px-9 rounded-2xl border border-bone dark:border-night-edge overflow-hidden"
        style={{
          background:
            "linear-gradient(to bottom, rgba(88,28,135,0.65) 0%, rgba(9,9,11,0.97) 100%)",
          minHeight: "260px",
        }}
      >
        {/* Portada */}
        <div className="shrink-0 self-end sm:self-auto">
          {album.cover ? (
            <img
              src={album.cover}
              alt={`${album.title} cover`}
              className="w-40 h-40 sm:w-[200px] sm:h-[200px] rounded-lg object-cover shadow-[0_8px_48px_rgba(0,0,0,0.7)]"
            />
          ) : (
            <div className="w-40 h-40 sm:w-[200px] sm:h-[200px] rounded-lg bg-linen dark:bg-coal flex items-center justify-center">
              <Icon icon="tabler:vinyl" className="text-6xl text-ink/20 dark:text-screen/20" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-2 min-w-0 text-ink dark:text-screen">
          <span className="text-[0.7rem] font-bold uppercase tracking-[2px] text-white/70">
            Álbum
          </span>
          <h1
            className="m-0 font-black leading-[1.05] tracking-tight text-white"
            style={{ fontSize: "clamp(1.6rem, 4vw, 3.5rem)" }}
          >
            {album.title}
          </h1>
          <div className="flex items-center gap-2 flex-wrap text-[0.88rem] text-white/80 mt-1">
            <span className="font-bold text-white">{album.artist}</span>
            {album.releaseDate && (
              <>
                <span className="text-white/30 text-xs">•</span>
                <span>{getYear(album.releaseDate)}</span>
              </>
            )}
            {tracks.length > 0 && (
              <>
                <span className="text-white/30 text-xs">•</span>
                <span>{tracks.length} canciones</span>
              </>
            )}
            {album.genre && (
              <>
                <span className="text-white/30 text-xs">•</span>
                <span
                  className="text-xs font-medium px-2.5 py-0.5 rounded-full
                    bg-lilac-mist border border-amethyst/35 text-amethyst
                    dark:bg-depth dark:border-orchid/35 dark:text-orchid"
                >
                  {album.genre}
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── ACTION BAR ── */}
      <div className="flex items-center gap-6 px-6 sm:px-9 py-6">
        <button
          onClick={playAlbum}
          disabled={!tracks.some((t) => t.previewUrl)}
          aria-label={isAlbumPlaying ? "Pausar álbum" : "Reproducir álbum"}
          className={[
            "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-xl border-none",
            tracks.some((t) => t.previewUrl)
              ? "bg-amethyst dark:bg-sapphire text-white cursor-pointer hover:scale-[1.07] hover:bg-orchid dark:hover:bg-depth shadow-[0_4px_20px_rgba(139,111,189,0.45)]"
              : "bg-bone dark:bg-night-edge text-slate dark:text-mist cursor-not-allowed",
          ].join(" ")}
        >
          <Icon
            icon={
              isAlbumPlaying
                ? "tabler:player-pause-filled"
                : "tabler:player-play-filled"
            }
            className="text-3xl"
          />
        </button>
      </div>

      {/* ── TRACK LIST ── */}
      <div className="px-4 sm:px-6">
        {/* Cabecera de la tabla */}
        <div
          className="grid gap-3 px-4 py-2 border-b border-bone dark:border-night-edge mb-2 sticky top-0 z-10 bg-parchment dark:bg-obsidian"
          style={{ gridTemplateColumns: "40px minmax(0,1fr) auto" }}
        >
          <span className="text-[0.78rem] font-semibold text-slate dark:text-mist uppercase tracking-widest text-center">
            #
          </span>
          <span className="text-[0.78rem] font-semibold text-slate dark:text-mist uppercase tracking-widest">
            Título
          </span>
          <span className="text-[0.78rem] font-semibold text-slate dark:text-mist uppercase tracking-widest text-right">
            <Icon icon="tabler:clock" className="text-base" />
          </span>
        </div>

        {/* Filas */}
        <div
          className={
            isScrollable
              ? "max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/15 hover:scrollbar-thumb-white/30"
              : ""
          }
          role="table"
          aria-label={`Canciones de ${album.title}`}
        >
          {enrichedTracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate dark:text-mist">
              <Icon icon="tabler:music-off" className="text-4xl opacity-40" />
              <p className="text-sm">No hay canciones disponibles</p>
            </div>
          ) : (
            enrichedTracks.map((track, index) => (
              <TrackRow
                key={track.id}
                track={track}
                index={index}
                currentTrackId={currentTrackId}
                isPlaying={isPlaying}
                allTracks={enrichedTracks}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
