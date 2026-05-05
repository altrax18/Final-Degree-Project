import { c as createComponent } from './astro-component_Ca-ehMXU.mjs';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_BHKh6TqG.mjs';
import { $ as $$Layout } from './Layout_CvdiqHQU.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { u as useCollections } from './useCollections_DR3EEX-I.mjs';
import { s as serverApi } from './server-api_05J3DRLn.mjs';

function TrackCard({ track, queue = [] }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const { collections, addItem } = useCollections();
  const menuRef = useRef(null);
  useEffect(() => {
    const onTrackChanged = (e) => {
      setIsPlaying(e.detail?.id === track.id && e.detail?.playing);
    };
    window.addEventListener("player-state", onTrackChanged);
    return () => window.removeEventListener("player-state", onTrackChanged);
  }, [track.id]);
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
    e.preventDefault();
    e.stopPropagation();
    if (!track.previewUrl) return;
    window.dispatchEvent(
      new CustomEvent("play-track", {
        detail: { track, queue }
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
        genre: track.genre,
        album: track.album,
        albumId: track.albumId
      }
    });
    setShowCollections(false);
    alert("¡Canción añadida a la colección!");
  };
  const hasPreview = Boolean(track.previewUrl);
  const musicCollections = collections.filter((c) => c.type === "music");
  return /* @__PURE__ */ jsxs("div", { className: "group relative rounded-2xl bg-sand dark:bg-coal border border-bone dark:border-night-edge shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amethyst/10 dark:hover:shadow-orchid/10 hover:border-bone dark:hover:border-night-edge/60 cursor-pointer block no-underline", children: [
    /* @__PURE__ */ jsx(
      "a",
      {
        href: `/music/${track.id}`,
        className: "block no-underline",
        "aria-label": `Ver detalle de ${track.title}`,
        children: /* @__PURE__ */ jsxs("div", { className: "relative aspect-square overflow-hidden rounded-t-2xl", children: [
          track.cover ? /* @__PURE__ */ jsx(
            "img",
            {
              src: track.cover,
              alt: `${track.title} artwork`,
              className: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
              loading: "lazy"
            }
          ) : /* @__PURE__ */ jsx("div", { className: "w-full h-full bg-linen dark:bg-coal flex items-center justify-center text-slate dark:text-mist", children: /* @__PURE__ */ jsx(Icon, { icon: "tabler:music", className: "text-4xl opacity-40" }) }),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-sand/90 dark:from-coal/90 via-transparent to-transparent" })
        ] })
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "absolute top-2 right-2 flex flex-col gap-2 z-20", children: /* @__PURE__ */ jsxs("div", { className: "relative", ref: menuRef, children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowCollections(!showCollections);
          },
          className: "w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60",
          title: "Añadir a colección",
          children: /* @__PURE__ */ jsx(Icon, { icon: "tabler:plus", className: "w-5 h-5" })
        }
      ),
      showCollections && /* @__PURE__ */ jsxs("div", { className: "absolute top-full right-0 mt-2 w-48 bg-white dark:bg-night-edge border border-bone dark:border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 border-b border-bone dark:border-white/5", children: /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate dark:text-white/40 uppercase tracking-widest px-2", children: "Mis Listas" }) }),
        /* @__PURE__ */ jsx("div", { className: "max-h-48 overflow-y-auto", children: musicCollections.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-slate dark:text-white/30 p-3 italic text-center", children: "No tienes listas de música" }) : musicCollections.map((col) => {
          const isAdded = col.items.some((i) => i.apiId === track.id);
          return /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: (e) => !isAdded && handleAddToCollection(e, col.id),
              disabled: isAdded,
              className: `w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors ${isAdded ? "text-amethyst bg-amethyst/5 cursor-default" : "text-ink dark:text-white/70 hover:bg-amethyst/10 hover:text-amethyst"}`,
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 truncate", children: [
                  /* @__PURE__ */ jsx(Icon, { icon: "tabler:list", className: "w-4 h-4 opacity-40" }),
                  /* @__PURE__ */ jsx("span", { className: "truncate", children: col.name })
                ] }),
                isAdded && /* @__PURE__ */ jsx(Icon, { icon: "tabler:check", className: "w-4 h-4" })
              ]
            },
            col.id
          );
        }) }),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/profile",
            className: "block text-center p-2 text-[10px] font-bold text-amethyst hover:text-orchid border-t border-bone dark:border-white/5 uppercase tracking-wider",
            children: "+ Nueva Lista"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(
      "button",
      {
        id: `play-btn-${track.id}`,
        onClick: handlePlay,
        disabled: !hasPreview,
        "aria-label": isPlaying ? `Pausar ${track.title}` : `Reproducir ${track.title}`,
        className: [
          "absolute bottom-20 right-3 w-11 h-11 rounded-full flex items-center justify-center z-20",
          "transition-all duration-200 shadow-xl",
          "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
          hasPreview ? "bg-ink dark:bg-screen text-screen dark:text-ink hover:scale-105 hover:bg-lilac-mist dark:hover:bg-lilac-mist cursor-pointer" : "bg-bone dark:bg-night-edge text-slate dark:text-mist cursor-not-allowed opacity-50"
        ].join(" "),
        children: /* @__PURE__ */ jsx(
          Icon,
          {
            icon: isPlaying ? "tabler:player-pause-filled" : "tabler:player-play-filled",
            className: "text-2xl"
          }
        )
      }
    ),
    !hasPreview && /* @__PURE__ */ jsx("div", { className: "absolute top-2 left-2 rounded-full bg-abyss/60 px-2 py-0.5 text-[10px] text-mist font-medium z-20", children: "No preview" }),
    /* @__PURE__ */ jsxs("a", { href: `/music/${track.id}`, className: "p-3 space-y-1 block no-underline", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-semibold text-ink dark:text-screen text-sm leading-snug line-clamp-1", children: track.title }),
      /* @__PURE__ */ jsx("p", { className: "text-slate dark:text-mist text-xs line-clamp-1", children: track.artist }),
      track.genre && /* @__PURE__ */ jsx("span", { className: "inline-block text-[10px] font-medium rounded-full border border-amethyst/30 bg-lilac-mist dark:bg-depth text-amethyst dark:text-orchid px-2 py-0.5", children: track.genre })
    ] })
  ] });
}

const API_BASE = "";
function MusicGrid({ initialTracks = [], pageSize = 24 }) {
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
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-10", children: [
    pages.map((batch, batchIdx) => /* @__PURE__ */ jsxs("div", { children: [
      batchIdx > 0 && /* @__PURE__ */ jsxs(
        "div",
        {
          ref: batchIdx === pages.length - 1 ? loadMoreRef : null,
          className: "flex items-center gap-4 mb-6",
          children: [
            /* @__PURE__ */ jsx("div", { className: "flex-1 h-px bg-bone dark:bg-night-edge" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-slate dark:text-mist uppercase tracking-widest", children: "More songs" }),
            /* @__PURE__ */ jsx("div", { className: "flex-1 h-px bg-bone dark:bg-night-edge" })
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4", children: batch.map((track) => /* @__PURE__ */ jsx(TrackCard, { track, queue: allTracks }, track.id)) })
    ] }, batchIdx)),
    !exhausted && /* @__PURE__ */ jsx("div", { className: "flex justify-center pt-2 pb-4", children: /* @__PURE__ */ jsx(
      "button",
      {
        id: "load-more-songs-btn",
        onClick: loadMore,
        disabled: loading,
        className: [
          "inline-flex items-center gap-2.5 px-7 py-3 rounded-full text-sm font-semibold",
          "border transition-all duration-200",
          loading ? "border-bone dark:border-night-edge text-slate dark:text-mist bg-sand dark:bg-coal cursor-not-allowed" : "border-bone dark:border-night-edge text-ink dark:text-screen bg-sand dark:bg-coal hover:bg-linen dark:hover:bg-coal hover:border-bone dark:hover:border-night-edge cursor-pointer active:scale-95"
        ].join(" "),
        children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs(
            "svg",
            {
              className: "w-4 h-4 animate-spin text-slate dark:text-mist",
              viewBox: "0 0 24 24",
              fill: "none",
              children: [
                /* @__PURE__ */ jsx(
                  "circle",
                  {
                    className: "opacity-25",
                    cx: "12",
                    cy: "12",
                    r: "10",
                    stroke: "currentColor",
                    strokeWidth: "4"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "path",
                  {
                    className: "opacity-75",
                    fill: "currentColor",
                    d: "M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                  }
                )
              ]
            }
          ),
          "Loading…"
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            Icon,
            {
              icon: "tabler:chevron-down",
              className: "w-[18px] h-[18px]"
            }
          ),
          "More songs"
        ] })
      }
    ) })
  ] });
}

const $$Music = createComponent(async ($$result, $$props, $$slots) => {
  let tracks = [];
  let fetchError = null;
  const { data, error } = await serverApi.api.music.trending.songs.get();
  if (error) {
    fetchError = "Could not reach the API. Make sure apps/api is running on port 3000.";
  } else if (data && typeof data === "object" && "results" in data) {
    tracks = data.results ?? [];
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Music" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="space-y-8"> <!-- Encabezado --> <div class="space-y-1"> <h1 class="text-3xl font-bold text-ink dark:text-screen tracking-tight">🎵 Music</h1> <p class="text-slate dark:text-mist text-sm">
Top songs right now — powered by Apple Music · iTunes preview (30s)
</p> </div> <!-- Estado de error --> ${fetchError && renderTemplate`<div class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
⚠️ ${fetchError} </div>`} <!-- Cuadrícula de pistas con cargar más --> ${tracks.length > 0 && renderTemplate`${renderComponent($$result2, "MusicGrid", MusicGrid, { "client:load": true, "initialTracks": tracks, "pageSize": tracks.length, "client:component-hydration": "load", "client:component-path": "C:/Users/sabax/OneDrive/Desktop/Final-Degree-Project/apps/web/src/components/music/MusicGrid.jsx", "client:component-export": "default" })}`} <!-- Estado vacío --> ${!fetchError && tracks.length === 0 && renderTemplate`<div class="flex flex-col items-center justify-center py-24 gap-4 text-slate dark:text-mist"> <span class="text-6xl">🎵</span> <p class="text-lg font-medium">No tracks found</p> <p class="text-sm">
Make sure the API is running and iTunes is reachable.
</p> </div>`} </section> ` })}`;
}, "C:/Users/sabax/OneDrive/Desktop/Final-Degree-Project/apps/web/src/pages/music.astro", void 0);

const $$file = "C:/Users/sabax/OneDrive/Desktop/Final-Degree-Project/apps/web/src/pages/music.astro";
const $$url = "/music";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Music,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
