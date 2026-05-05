import { c as createComponent } from './astro-component_Ca-ehMXU.mjs';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_BHKh6TqG.mjs';
import { $ as $$Layout } from './Layout_CvdiqHQU.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useRef, useEffect } from 'react';
import { u as useCollections } from './useCollections_DR3EEX-I.mjs';
import { Icon } from '@iconify/react';
import { s as serverApi } from './server-api_05J3DRLn.mjs';

function GameDetailsClient({ game }) {
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
      apiId: game.id,
      title: game.title,
      type: "game",
      metadata: {
        image: game.image,
        rating: game.rating,
        genres: game.genres,
        developer: game.developer
      }
    });
    setShowCollections(false);
    alert("¡Juego añadido a la colección!");
  };
  const relevantCollections = collections.filter((c) => c.type === "game");
  const releaseDate = game.firstReleaseDate ? new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(new Date(game.firstReleaseDate * 1e3)) : "Fecha desconocida";
  const heroBackground = game.screenshots && game.screenshots.length > 0 ? game.screenshots[0] : game.image;
  return /* @__PURE__ */ jsxs("article", { className: "min-h-screen bg-parchment dark:bg-obsidian text-ink dark:text-screen w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative w-full h-[50vh] md:h-[60vh] flex items-end justify-center", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute inset-0 bg-cover bg-center opacity-30 mask-image-gradient",
          style: { backgroundImage: `url(${heroBackground})` }
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-parchment dark:from-obsidian via-parchment/60 dark:via-obsidian/60 to-transparent" }),
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 w-full max-w-7xl mx-auto px-4 pb-10 flex flex-col md:flex-row items-end gap-8", children: [
        /* @__PURE__ */ jsx("div", { className: "w-48 md:w-64 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border-2 border-bone dark:border-night-edge shadow-black/50 transform md:translate-y-16", children: /* @__PURE__ */ jsx("img", { src: game.image || "", alt: game.title, className: "w-full h-auto object-cover aspect-[3/4]" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 pb-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-blue-400 font-semibold tracking-widest uppercase text-xs mb-2", children: game.developer }),
          /* @__PURE__ */ jsx("h1", { className: "text-4xl md:text-6xl font-black tracking-tight mb-4 drop-shadow-lg", children: game.title }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4 text-sm font-medium text-slate dark:text-mist", children: [
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 bg-ink/10 dark:bg-screen/10 px-3 py-1 rounded-full backdrop-blur-md", children: [
              "⭐ ",
              /* @__PURE__ */ jsx("span", { className: "text-ink dark:text-screen font-bold", children: game.rating }),
              " / 100"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "bg-ink/10 dark:bg-screen/10 px-3 py-1 rounded-full backdrop-blur-md", children: [
              "📅 ",
              releaseDate
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "w-full max-w-7xl mx-auto px-4 py-16 md:py-24 mt-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-12", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-10", children: [
          /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-4 border-b border-bone dark:border-night-edge pb-2", children: "Acerca del juego" }),
            /* @__PURE__ */ jsx("p", { className: "text-slate dark:text-mist leading-relaxed text-lg", children: game.summary }),
            game.storyline && /* @__PURE__ */ jsxs("div", { className: "mt-6 p-6 bg-linen dark:bg-coal rounded-xl border border-bone dark:border-night-edge italic text-slate dark:text-mist", children: [
              '"',
              game.storyline,
              '"'
            ] })
          ] }),
          game.screenshots && game.screenshots.length > 0 && /* @__PURE__ */ jsxs("section", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-4 border-b border-bone dark:border-night-edge pb-2", children: "Galería" }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-4", children: game.screenshots.slice(0, 4).map((shot, idx) => /* @__PURE__ */ jsx("img", { src: shot, alt: `Captura ${idx + 1}`, className: "rounded-lg object-cover w-full aspect-video hover:opacity-80 transition cursor-pointer border border-bone dark:border-night-edge" }, idx)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("aside", { className: "space-y-8 bg-sand dark:bg-coal p-6 rounded-2xl border border-bone dark:border-night-edge h-fit", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm uppercase tracking-widest text-slate dark:text-mist mb-3 font-bold", children: "Plataformas" }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: game.platforms.map((p) => /* @__PURE__ */ jsx("span", { className: "px-3 py-1 bg-linen dark:bg-night-edge text-sm rounded-md text-slate dark:text-mist", children: p }, p)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm uppercase tracking-widest text-slate dark:text-mist mb-3 font-bold", children: "Géneros" }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: game.genres.map((g) => /* @__PURE__ */ jsx("span", { className: "px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-md border border-blue-500/30", children: g }, g)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative", ref: menuRef, children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setShowCollections(!showCollections),
                className: "w-full py-4 bg-ink dark:bg-screen text-screen dark:text-ink font-bold rounded-xl hover:bg-ink/80 dark:hover:bg-screen/80 transition-transform active:scale-95 shadow-[0_0_20px_rgba(0,0,0,0.2)] dark:shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2",
                children: [
                  /* @__PURE__ */ jsx(Icon, { icon: "tabler:plus", className: "w-5 h-5" }),
                  "Añadir a mi Colección"
                ]
              }
            ),
            showCollections && /* @__PURE__ */ jsxs("div", { className: "absolute bottom-full left-0 mb-3 w-full bg-white dark:bg-night-edge border border-bone dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200", children: [
              /* @__PURE__ */ jsx("div", { className: "p-3 border-b border-bone dark:border-white/5", children: /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate dark:text-white/40 uppercase tracking-widest px-2 text-left", children: "Mis Listas de Juegos" }) }),
              /* @__PURE__ */ jsx("div", { className: "max-h-60 overflow-y-auto", children: relevantCollections.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-slate dark:text-white/30 p-4 italic text-center", children: "No tienes listas de juegos" }) : relevantCollections.map((col) => {
                const isAdded = col.items.some((i) => i.apiId === game.id);
                return /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => !isAdded && handleAddToCollection(col.id),
                    disabled: isAdded,
                    className: `w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors ${isAdded ? "text-blue-500 bg-blue-500/5 cursor-default" : "text-ink dark:text-white/70 hover:bg-blue-600/10 hover:text-blue-500"}`,
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
                  className: "block text-center p-3 text-[10px] font-bold text-blue-500 hover:text-blue-400 border-t border-bone dark:border-white/5 uppercase tracking-wider",
                  children: "+ Nueva Lista"
                }
              )
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-20 pt-10 border-t border-bone dark:border-night-edge", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-black mb-2", children: "Comunidad" }),
        /* @__PURE__ */ jsxs("p", { className: "text-slate dark:text-mist mb-8", children: [
          "¿Qué opina la red de Alexandria sobre ",
          game.title,
          "?"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-sand dark:bg-coal p-6 rounded-2xl border border-bone dark:border-night-edge", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex gap-4 mb-8", children: [
            /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg flex-shrink-0", children: "TÚ" }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  className: "w-full bg-linen dark:bg-coal text-ink dark:text-screen p-4 rounded-xl border border-bone dark:border-night-edge focus:border-amethyst dark:focus:border-electric-sky focus:outline-none resize-none",
                  rows: 3,
                  placeholder: "Escribe un post debatiendo sobre este juego..."
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "flex justify-end mt-2", children: /* @__PURE__ */ jsx("button", { className: "px-6 py-2 bg-sapphire text-screen font-bold rounded-lg hover:bg-sapphire/80 transition", children: "Publicar" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
            /* @__PURE__ */ jsx("img", { src: "https://placehold.co/50x50/333/fff?text=UX", alt: "Avatar", className: "w-12 h-12 rounded-full" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                /* @__PURE__ */ jsx("span", { className: "font-bold text-blue-400", children: "@alexandria_user" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs text-slate dark:text-mist", children: "Hace 2 horas" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-slate dark:text-mist", children: "¡La dirección de arte de este juego es increíble! Alguien más atascado en el nivel 4? Necesito consejos urgentes." })
            ] })
          ] }) })
        ] })
      ] })
    ] })
  ] });
}

const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  let game = null;
  let errorMessage = "";
  try {
    if (!id) {
      throw new Error("ID de juego no proporcionado");
    }
    const { data, error } = await serverApi.api.games({ apiId: id }).get();
    if (error)
      throw new Error(
        typeof error.value === "string" ? error.value : "API no disponible"
      );
    game = data;
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Ocurrio un error al cargar los detalles del juego";
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": game ? `${game.title} - Detalles | Alexandria` : "Error | Alexandria" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-7xl mx-auto px-4 pt-6"> <a href="/games" class="inline-flex items-center gap-2 text-sm text-slate dark:text-mist hover:text-ink dark:hover:text-screen transition-colors group"> ${renderComponent($$result2, "Icon", Icon, { "icon": "tabler:arrow-left", "className": "w-5 h-5 group-hover:-translate-x-0.5 transition-transform" })}
Volver a Videojuegos
</a> </div> ${errorMessage || !game ? renderTemplate`<div class="min-h-screen flex flex-col items-center justify-center bg-parchment dark:bg-obsidian text-ink dark:text-screen"> <h1 class="text-4xl font-bold text-red-500 mb-4">Ups...</h1>  <p class="text-slate dark:text-mist">${errorMessage || "Juego no encontrado"}</p> <a href="/games" class="mt-8 text-sapphire dark:text-electric-sky hover:underline">
Volver al catalogo
</a> </div>` : (
    // CONCEPTO: Hidratacion de Isla React
    // QUE HACE: Activa comportamiento interactivo del detalle (botones, comentarios, etc.).
    // POR QUE LO USO: Mantiene el render inicial en SSR y la interactividad en cliente.
    // DOCUMENTACION: https://docs.astro.build/en/reference/directives-reference/#clientload
    renderTemplate`${renderComponent($$result2, "GameDetailsClient", GameDetailsClient, { "client:load": true, "game": game, "client:component-hydration": "load", "client:component-path": "C:/Users/sabax/OneDrive/Desktop/Final-Degree-Project/apps/web/src/components/games/GameDetailsClient", "client:component-export": "default" })}`
  )}` })}`;
}, "C:/Users/sabax/OneDrive/Desktop/Final-Degree-Project/apps/web/src/pages/games/[id].astro", void 0);

const $$file = "C:/Users/sabax/OneDrive/Desktop/Final-Degree-Project/apps/web/src/pages/games/[id].astro";
const $$url = "/games/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
