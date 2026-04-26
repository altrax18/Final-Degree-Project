// src/components/music/MusicGrid.jsx
import { useState, useRef } from "react";
import TrackCard from "./TrackCard.jsx";

const API_BASE = "";

/**
 * @param {{ initialTracks?: any[], pageSize?: number }} props
 */
export default function MusicGrid({ initialTracks = [], pageSize = 24 }) {
  const [pages, setPages] = useState([initialTracks]);
  const [nextPage, setNextPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const loadMoreRef = useRef(null);

  const allTracks = pages.flat();

  const loadMore = async () => {
    if (loading || exhausted) return;
    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/api/music/more?page=${nextPage}&limit=${pageSize}`
      );
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const newTracks = data.results ?? [];

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
              <div className="flex-1 h-px bg-white/[0.07]" />
              <span className="text-xs font-semibold text-white/30 uppercase tracking-widest">
                More songs
              </span>
              <div className="flex-1 h-px bg-white/[0.07]" />
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
                ? "border-white/10 text-white/30 bg-white/5 cursor-not-allowed"
                : "border-white/15 text-white bg-white/[0.06] hover:bg-white/[0.12] hover:border-white/30 cursor-pointer active:scale-95",
            ].join(" ")}
          >
            {loading ? (
              <>
                {/* Cargando */}
                <svg
                  className="w-4 h-4 animate-spin text-white/50"
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
                <span className="material-symbols-rounded text-[18px]">
                  expand_more
                </span>
                More songs
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
