import { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import TrackCard from "./TrackCard";
import { api } from "../../lib/api";
import type { Track } from "../../types/music";

type MusicGridProps = {
  initialTracks?: Track[];
  pageSize?: number;
};

export default function MusicGrid({ initialTracks = [], pageSize = 24 }: MusicGridProps) {
  const [pages, setPages] = useState<Track[][]>([initialTracks]);
  const [nextPage, setNextPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const allTracks = pages.flat();

  const loadMore = async () => {
    if (loading || exhausted) return;
    setLoading(true);

    try {
      const { data, error } = await api.api.music.more.get({
        query: {
          page: nextPage.toString(),
          limit: pageSize.toString()
        }
      });

      if (error || !data) throw new Error("API error");

      const newTracks = (data as any).results as Track[] ?? [];

      if (newTracks.length === 0) {
        setExhausted(true);
      } else {
        setPages((prev) => [...prev, newTracks]);
        setNextPage((n) => n + 1);

        setTimeout(() => {
          loadMoreRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    } catch {
      // falla silenciosa — el botón permanece visible para reintentar
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {pages.map((batch, batchIdx) => (
        <div key={batchIdx}>
          {batchIdx > 0 && (
            <div
              ref={batchIdx === pages.length - 1 ? loadMoreRef : null}
              className="flex items-center gap-4 mb-6"
            >
              <div className="flex-1 h-px bg-bone dark:bg-night-edge" />
              <span className="text-xs font-semibold text-slate dark:text-mist uppercase tracking-widest">
                More songs
              </span>
              <div className="flex-1 h-px bg-bone dark:bg-night-edge" />
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {batch.map((track) => (
              <TrackCard key={track.id} track={track} queue={allTracks} />
            ))}
          </div>
        </div>
      ))}

      {!exhausted && (
        <div className="flex justify-center pt-2 pb-4">
          <button
            id="load-more-songs-btn"
            onClick={loadMore}
            disabled={loading}
            className={[
              "inline-flex items-center gap-2.5 px-7 py-3 rounded-full text-sm font-semibold",
              "border transition-all duration-200",
              loading
                ? "border-bone dark:border-night-edge text-slate dark:text-mist bg-sand dark:bg-coal cursor-not-allowed"
                : "border-bone dark:border-night-edge text-ink dark:text-screen bg-sand dark:bg-coal hover:bg-linen dark:hover:bg-coal hover:border-bone dark:hover:border-night-edge cursor-pointer active:scale-95",
            ].join(" ")}
          >
            {loading ? (
              <>
                {/* Cargando */}
                <svg
                  className="w-4 h-4 animate-spin text-slate dark:text-mist"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                  />
                </svg>
                Loading…
              </>
            ) : (
              <>
                <Icon
                  icon="tabler:chevron-down"
                  className="w-[18px] h-[18px]"
                />
                More songs
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
