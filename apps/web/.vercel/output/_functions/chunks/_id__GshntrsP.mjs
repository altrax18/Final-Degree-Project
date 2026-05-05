import { c as createComponent } from './astro-component_CvTESmvA.mjs';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_DF_D8ei4.mjs';
import { $ as $$Layout } from './Layout_Dqj83iAE.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useRef, useEffect } from 'react';
import { u as useCollections } from './useCollections_CzqFdQ5c.mjs';
import { Icon } from '@iconify/react';
import { s as serverApi } from './server-api_BGd5GONv.mjs';

function MovieDetailsClient({ movie }) {
  const [showCollections, setShowCollections] = useState(false);
  const { collections, addItem } = useCollections();
  const menuRef = useRef(null);
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
      apiId: movie.id,
      title: movie.title,
      type: "movie",
      metadata: {
        image: movie.image,
        rating: movie.rating,
        genres: movie.genres,
        director: movie.director
      }
    });
    setShowCollections(false);
    alert("¡Película añadida a la colección!");
  };
  const relevantCollections = collections.filter((c) => c.type === "movie");
  const releaseDate = movie.firstReleaseDate ? new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(movie.firstReleaseDate)) : "Fecha desconocida";
  const heroBackground = movie.backdrop || movie.image;
  const moneyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
  const formattedBudget = movie.budget && movie.budget > 0 ? moneyFormatter.format(movie.budget) : "No disponible";
  const formattedRevenue = movie.revenue && movie.revenue > 0 ? moneyFormatter.format(movie.revenue) : "No disponible";
  const trailerEmbedUrl = movie.trailer && movie.trailer.site === "YouTube" ? `https://www.youtube.com/embed/${movie.trailer.key}` : null;
  return /* @__PURE__ */ jsxs("article", { className: "min-h-screen bg-parchment dark:bg-obsidian text-ink dark:text-screen w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative w-full h-[50vh] md:h-[60vh] flex items-end justify-center", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute inset-0 bg-cover bg-top opacity-30 mask-image-gradient",
          style: { backgroundImage: heroBackground ? `url(${heroBackground})` : "none" }
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-parchment dark:from-obsidian via-parchment/60 dark:via-obsidian/60 to-transparent" }),
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 w-full max-w-7xl mx-auto px-4 pb-10 flex flex-col md:flex-row items-end gap-8", children: [
        /* @__PURE__ */ jsx("div", { className: "w-48 md:w-64 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border-2 border-bone dark:border-night-edge shadow-black/50 transform md:translate-y-16", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: movie.image || "https://placehold.co/600x900/111827/e5e7eb?text=No+Poster",
            alt: movie.title,
            className: "w-full h-auto object-cover aspect-[3/4]"
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 pb-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-blue-400 font-semibold tracking-widest uppercase text-xs mb-2", children: movie.director || "Direccion desconocida" }),
          /* @__PURE__ */ jsx("h1", { className: "text-4xl md:text-6xl font-black tracking-tight mb-4 drop-shadow-lg", children: movie.title }),
          movie.tagline && /* @__PURE__ */ jsxs("p", { className: "text-slate dark:text-mist italic mb-4", children: [
            '"',
            movie.tagline,
            '"'
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4 text-sm font-medium text-slate dark:text-mist", children: [
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 bg-ink/10 dark:bg-screen/10 px-3 py-1 rounded-full backdrop-blur-md border border-bone dark:border-night-edge", children: [
              "⭐ ",
              /* @__PURE__ */ jsx("span", { className: "text-ink dark:text-screen font-bold", children: movie.rating }),
              " / 100"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "bg-ink/10 dark:bg-screen/10 px-3 py-1 rounded-full backdrop-blur-md border border-bone dark:border-night-edge", children: [
              "📅 ",
              releaseDate
            ] }),
            movie.runtime && /* @__PURE__ */ jsxs("span", { className: "bg-ink/10 dark:bg-screen/10 px-3 py-1 rounded-full backdrop-blur-md border border-bone dark:border-night-edge", children: [
              "⏱ ",
              movie.runtime,
              " min"
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "w-full max-w-7xl mx-auto px-4 py-16 md:py-24 mt-8", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-12", children: [
        /* @__PURE__ */ jsxs("section", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-4 border-b border-bone dark:border-night-edge pb-2", children: "Sinopsis" }),
          /* @__PURE__ */ jsx("p", { className: "text-slate dark:text-mist leading-relaxed text-lg", children: movie.summary })
        ] }),
        trailerEmbedUrl && /* @__PURE__ */ jsxs("section", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-4 border-b border-bone dark:border-night-edge pb-2", children: "Trailer oficial" }),
          /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl", children: /* @__PURE__ */ jsx("div", { className: "aspect-video", children: /* @__PURE__ */ jsx(
            "iframe",
            {
              src: trailerEmbedUrl,
              title: movie.trailer?.title || `Trailer de ${movie.title}`,
              className: "h-full w-full",
              allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
              allowFullScreen: true
            }
          ) }) })
        ] }),
        (movie.cast || []).length > 0 && /* @__PURE__ */ jsxs("section", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-4 border-b border-bone dark:border-night-edge pb-2", children: "Reparto principal" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4", children: (movie.cast || []).map((actor) => /* @__PURE__ */ jsxs(
            "article",
            {
              className: "rounded-xl border border-bone dark:border-night-edge bg-sand dark:bg-coal p-3 shadow-lg",
              children: [
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: actor.profile || "https://placehold.co/185x278/111827/e5e7eb?text=No+Photo",
                    alt: `Foto de ${actor.name}`,
                    className: "mb-3 h-44 w-full rounded-lg object-cover"
                  }
                ),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-ink dark:text-screen truncate", title: actor.name, children: actor.name }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-slate dark:text-mist truncate", title: actor.character, children: actor.character })
              ]
            },
            `${actor.name}-${actor.character}`
          )) })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "mt-16 pt-10 border-t border-bone dark:border-night-edge", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-3xl font-black mb-2", children: "Reseñas de la Comunidad" }),
          /* @__PURE__ */ jsxs("p", { className: "text-slate dark:text-mist mb-8", children: [
            "Comparte tu crítica sobre ",
            movie.title
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-sand dark:bg-coal p-6 rounded-2xl border border-bone dark:border-night-edge shadow-2xl", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex gap-4 mb-8", children: [
              /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-full bg-red-600 flex items-center justify-center font-bold text-lg flex-shrink-0", children: "TÚ" }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    className: "w-full bg-linen dark:bg-coal text-ink dark:text-screen p-4 rounded-xl border border-bone dark:border-night-edge focus:border-amethyst dark:focus:border-electric-sky focus:outline-none resize-none",
                    rows: 3,
                    placeholder: "¿Qué te pareció la película? Deja tu reseña sin spoilers..."
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mt-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-sm text-slate dark:text-mist flex items-center gap-2", children: "Valoración: ⭐⭐⭐⭐⭐" }),
                  /* @__PURE__ */ jsx("button", { className: "px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition", children: "Publicar Reseña" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-4 border-t border-bone dark:border-night-edge pt-6", children: [
              /* @__PURE__ */ jsx("img", { src: "https://placehold.co/50x50/222/fff?text=CR", alt: "Avatar", className: "w-12 h-12 rounded-full" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-1", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-bold text-red-400", children: "@cinefilo_pro" }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs bg-linen dark:bg-night-edge px-2 py-0.5 rounded text-ink dark:text-screen border border-bone dark:border-night-edge", children: "⭐ 90/100" }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs text-slate dark:text-mist", children: "Hace 5 horas" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-slate dark:text-mist", children: "La cinematografía y la banda sonora están a otro nivel. El director supo exactamente cómo mantener la tensión de principio a fin. Directo a mi top del año." })
              ] })
            ] }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("aside", { className: "space-y-8 bg-sand dark:bg-coal p-6 rounded-2xl border border-bone dark:border-night-edge h-fit shadow-2xl", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm uppercase tracking-widest text-slate dark:text-mist mb-3 font-bold", children: "Géneros" }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: movie.genres.map((genre) => /* @__PURE__ */ jsx(
            "span",
            {
              className: "px-3 py-1 bg-red-500/20 text-red-300 text-sm rounded-md border border-red-500/30",
              children: genre
            },
            genre
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm uppercase tracking-widest text-slate dark:text-mist mb-3 font-bold", children: "Datos técnicos" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-slate dark:text-mist", children: [
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-slate dark:text-mist block mb-1", children: "Título original:" }),
              /* @__PURE__ */ jsx("span", { className: "font-semibold text-ink dark:text-screen", children: movie.originalTitle || movie.title })
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-slate dark:text-mist block mb-1", children: "Estado:" }),
              movie.status || "No disponible"
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-slate dark:text-mist block mb-1", children: "Presupuesto:" }),
              formattedBudget
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-slate dark:text-mist block mb-1", children: "Recaudación:" }),
              formattedRevenue
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3 pt-4 border-t border-bone dark:border-night-edge", children: [
          movie.homepage && /* @__PURE__ */ jsx(
            "a",
            {
              href: movie.homepage,
              target: "_blank",
              rel: "noreferrer",
              className: "block w-full rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-center font-semibold text-blue-300 hover:bg-blue-500/20 transition",
              children: "Sitio web oficial"
            }
          ),
          movie.imdbId && /* @__PURE__ */ jsx(
            "a",
            {
              href: `https://www.imdb.com/title/${movie.imdbId}/`,
              target: "_blank",
              rel: "noreferrer",
              className: "block w-full rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-center font-semibold text-yellow-300 hover:bg-yellow-500/20 transition",
              children: "Ver en IMDb"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", ref: menuRef, children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setShowCollections(!showCollections),
              className: "w-full py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 transition-transform active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.2)] flex items-center justify-center gap-2",
              children: [
                /* @__PURE__ */ jsx(Icon, { icon: "tabler:plus", className: "w-5 h-5" }),
                "Añadir a mi Watchlist"
              ]
            }
          ),
          showCollections && /* @__PURE__ */ jsxs("div", { className: "absolute bottom-full left-0 mb-3 w-full bg-white dark:bg-night-edge border border-bone dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200", children: [
            /* @__PURE__ */ jsx("div", { className: "p-3 border-b border-bone dark:border-white/5", children: /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate dark:text-white/40 uppercase tracking-widest px-2 text-left", children: "Mis Listas de Películas" }) }),
            /* @__PURE__ */ jsx("div", { className: "max-h-60 overflow-y-auto", children: relevantCollections.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-slate dark:text-white/30 p-4 italic text-center", children: "No tienes listas de películas" }) : relevantCollections.map((col) => {
              const isAdded = col.items.some((i) => i.apiId === movie.id);
              return /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => !isAdded && handleAddToCollection(col.id),
                  disabled: isAdded,
                  className: `w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors ${isAdded ? "text-red-500 bg-red-500/5 cursor-default" : "text-ink dark:text-white/70 hover:bg-red-600/10 hover:text-red-500"}`,
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 truncate", children: [
                      /* @__PURE__ */ jsx(Icon, { icon: "tabler:list", className: "w-5 h-5 opacity-40" }),
                      /* @__PURE__ */ jsx("span", { className: "truncate", children: col.name })
                    ] }),
                    isAdded && /* @__PURE__ */ jsx(Icon, { icon: "tabler:check", className: "w-5 h-5" })
                  ]
                },
                col.id
              );
            }) }),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "/profile",
                className: "block text-center p-3 text-[10px] font-bold text-red-500 hover:text-red-400 border-t border-bone dark:border-white/5 uppercase tracking-wider",
                children: "+ Nueva Lista"
              }
            )
          ] })
        ] })
      ] })
    ] }) })
  ] });
}

const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  let movie = null;
  let errorMessage = "";
  try {
    if (!id) {
      throw new Error("ID de pelicula no proporcionado");
    }
    const { data, error } = await serverApi.api.movies({ apiId: id }).get();
    if (error) throw new Error(typeof error.value === "string" ? error.value : "API no disponible");
    movie = data;
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Ocurrio un error al cargar los detalles de la pelicula";
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": movie ? `${movie.title} - Detalles | Alexandria` : "Error | Alexandria" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-7xl mx-auto px-4 pt-6"> <a href="/movies" class="inline-flex items-center gap-2 text-sm text-slate dark:text-mist hover:text-ink dark:hover:text-screen transition-colors group"> ${renderComponent($$result2, "Icon", Icon, { "icon": "tabler:arrow-left", "className": "w-5 h-5 group-hover:-translate-x-0.5 transition-transform" })}
Volver a Películas
</a> </div> ${errorMessage || !movie ? renderTemplate`<div class="min-h-screen flex flex-col items-center justify-center bg-parchment dark:bg-obsidian text-ink dark:text-screen"> <h1 class="text-4xl font-bold text-red-500 mb-4">Ups...</h1> <p class="text-slate dark:text-mist">${errorMessage || "Pelicula no encontrada"}</p> <a href="/movies" class="mt-8 text-blue-400 hover:underline">
Volver al catalogo
</a> </div>` : (
    // CONCEPTO: Hidratacion de Isla React
    // QUE HACE: Activa interacciones del detalle de pelicula en cliente.
    // POR QUE LO USO: Combina SSR inicial con UX interactiva.
    // DOCUMENTACION: https://docs.astro.build/en/reference/directives-reference/#clientload
    renderTemplate`${renderComponent($$result2, "MovieDetailsClient", MovieDetailsClient, { "client:load": true, "movie": movie, "client:component-hydration": "load", "client:component-path": "C:/Users/sabax/OneDrive/Desktop/Final-Degree-Project/apps/web/src/components/movies/MovieDetailsClient", "client:component-export": "default" })}`
  )}` })}`;
}, "C:/Users/sabax/OneDrive/Desktop/Final-Degree-Project/apps/web/src/pages/movies/[id].astro", void 0);

const $$file = "C:/Users/sabax/OneDrive/Desktop/Final-Degree-Project/apps/web/src/pages/movies/[id].astro";
const $$url = "/movies/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
