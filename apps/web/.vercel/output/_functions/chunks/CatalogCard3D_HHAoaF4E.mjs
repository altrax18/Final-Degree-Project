import { treaty } from '@elysiajs/eden';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useMemo, memo, useState, useRef, useEffect } from 'react';
import { create } from 'zustand';
import { u as useCollections } from './useCollections_DR3EEX-I.mjs';
import { Icon } from '@iconify/react';

function getErrorReason(errorValue) {
  if (typeof errorValue === "string") {
    return errorValue;
  }
  if (typeof errorValue === "object" && errorValue !== null && "message" in errorValue && typeof errorValue.message === "string") {
    return errorValue.message;
  }
  return "API no disponible";
}
async function requestApi(request, errorPrefix) {
  const { data, error } = await request();
  if (!data || error) {
    const reason = getErrorReason(error?.value);
    throw new Error(`${errorPrefix}: ${reason}`);
  }
  return data;
}
async function getGames() {
  return requestApi(
    () => api.api.games.get(),
    "No se pudieron cargar los juegos"
  );
}
async function getMovies() {
  return requestApi(
    () => api.api.movies.get(),
    "No se pudieron cargar las peliculas"
  );
}
const getApiUrl = () => {
  if (typeof window !== "undefined") return window.location.origin;
  if (typeof process !== "undefined" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:4321";
};
const api = treaty(getApiUrl());

function CatalogFilters({
  searchTerm,
  selectedGenre,
  genres,
  searchPlaceholder,
  filterTitle,
  onSearchTermChange,
  onGenreChange
}) {
  return (
    // CONCEPTO: Controles de Búsqueda y Filtro
    // QUE HACE: Agrupa el buscador controlado y los botones de género en una sola pieza visual.
    // POR QUE LO USO: Este bloque cambia según el estado del catálogo, así que conviene aislarlo como componente reutilizable.
    // DOCUMENTACION: https://react.dev/learn/sharing-state-between-components
    /* @__PURE__ */ jsxs("div", { className: "mb-12 flex flex-col gap-8", children: [
      /* @__PURE__ */ jsx("div", { className: "w-full max-w-2xl mx-auto", children: /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          placeholder: searchPlaceholder,
          value: searchTerm,
          onChange: (event) => onSearchTermChange(event.target.value),
          className: "w-full bg-transparent border-b-2 border-bone dark:border-night-edge px-4 py-3 text-xl text-ink dark:text-screen placeholder:text-slate dark:placeholder:text-mist transition-all focus:border-amethyst dark:focus:border-electric-sky focus:outline-none text-center"
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xs uppercase tracking-[0.2em] text-slate dark:text-mist mb-4 text-center font-bold", children: filterTitle }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap justify-center gap-3", children: genres.map((genre) => {
          const isSelected = selectedGenre === genre;
          return /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => onGenreChange(genre),
              className: `px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all duration-200 border ${isSelected ? "border-ink dark:border-screen text-ink dark:text-screen bg-ink/5 dark:bg-screen/5 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]" : "border-bone dark:border-night-edge text-slate dark:text-mist hover:border-ink/40 dark:hover:border-screen/40 hover:text-ink/80 dark:hover:text-screen/80 bg-transparent"}`,
              children: genre
            },
            genre
          );
        }) })
      ] })
    ] })
  );
}

function clampCatalogPage(page, totalPages) {
  return Math.max(1, Math.min(page, Math.max(totalPages, 1)));
}
function getVisibleCatalogPageNumbers(currentPage, totalPages, maxVisiblePages) {
  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const leftWindow = Math.floor(maxVisiblePages / 2);
  let start = Math.max(1, currentPage - leftWindow);
  let end = start + maxVisiblePages - 1;
  if (end > totalPages) {
    end = totalPages;
    start = end - maxVisiblePages + 1;
  }
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function CatalogPagination({
  currentPage,
  totalPages,
  onPageChange
}) {
  const goToPage = (page) => {
    const normalizedPage = clampCatalogPage(page, totalPages);
    if (normalizedPage !== currentPage) {
      onPageChange(normalizedPage);
    }
  };
  const pageNumbers = useMemo(
    () => getVisibleCatalogPageNumbers(currentPage, totalPages, 5),
    [currentPage, totalPages]
  );
  if (totalPages <= 1) {
    return null;
  }
  return (
    // CONCEPTO: Navegación Semántica
    // QUE HACE: Usa <nav> para exponer el control de página como navegación accesible.
    // POR QUE LO USO: Mejora accesibilidad y deja claro que este bloque cambia el resultado visible.
    // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/nav
    /* @__PURE__ */ jsx("nav", { className: "mt-10 flex justify-center", "aria-label": "Catalog pagination", children: /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center overflow-hidden rounded-xl border border-bone dark:border-night-edge bg-parchment dark:bg-coal text-sm shadow-sm", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => goToPage(currentPage - 1),
          disabled: currentPage === 1,
          className: "flex items-center gap-2 px-4 py-3 text-slate dark:text-mist transition-colors hover:bg-sand dark:hover:bg-night-edge disabled:cursor-not-allowed disabled:opacity-40",
          "aria-label": "Previous page",
          children: [
            /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "‹" }),
            /* @__PURE__ */ jsx("span", { children: "Anterior" })
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "h-9 w-px bg-bone dark:bg-night-edge" }),
      pageNumbers.map((page) => {
        const isActive = page === currentPage;
        return /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => goToPage(page),
            className: `min-w-11 px-3 py-3 font-semibold transition-colors ${isActive ? "border-x border-ink dark:border-screen bg-sand dark:bg-night-edge text-ink dark:text-screen" : "text-slate dark:text-mist hover:bg-sand dark:hover:bg-night-edge"}`,
            "aria-current": isActive ? "page" : void 0,
            "aria-label": `Go to page ${page}`,
            children: page
          },
          page
        );
      }),
      /* @__PURE__ */ jsx("div", { className: "h-9 w-px bg-bone dark:bg-night-edge" }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => goToPage(currentPage + 1),
          disabled: currentPage === totalPages,
          className: "flex items-center gap-2 px-4 py-3 text-slate dark:text-mist transition-colors hover:bg-sand dark:hover:bg-night-edge disabled:cursor-not-allowed disabled:opacity-40",
          "aria-label": "Next page",
          children: [
            /* @__PURE__ */ jsx("span", { children: "Siguiente" }),
            /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "›" })
          ]
        }
      )
    ] }) })
  );
}

function getUniqueCatalogGenres(items, getGenres) {
  const genres = /* @__PURE__ */ new Set();
  items.forEach((item) => {
    getGenres(item).forEach((genre) => genres.add(genre));
  });
  return [
    "All",
    ...Array.from(genres).sort((left, right) => left.localeCompare(right))
  ];
}
function filterCatalogItems(items, searchTerm, selectedGenre, getTitle, getGenres) {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  return items.filter((item) => {
    const title = getTitle(item).toLowerCase();
    const genres = getGenres(item);
    const matchesSearch = normalizedSearch.length === 0 || title.includes(normalizedSearch);
    const matchesGenre = selectedGenre === "All" || genres.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });
}
function paginateCatalogItems(items, currentPage, itemsPerPage) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return items.slice(startIndex, endIndex);
}

const defaultCatalogFilters = {
  searchTerm: "",
  selectedGenre: "All",
  currentPage: 1
};
function getCatalogFilters(filtersByKey, catalogKey) {
  return filtersByKey[catalogKey] ?? defaultCatalogFilters;
}
const useCatalogFilterStore = create((set) => ({
  filtersByKey: {},
  setSearchTerm: (catalogKey, searchTerm) => set((state) => ({
    filtersByKey: {
      ...state.filtersByKey,
      [catalogKey]: {
        ...getCatalogFilters(state.filtersByKey, catalogKey),
        searchTerm,
        // CONCEPTO: Sincronización de Interfaz
        // QUÉ HACE: Al escribir en el buscador, forzamos la página a 1.
        // POR QUÉ LO USO: Si el usuario está en la página 5 y busca algo nuevo que solo tiene 2 resultados, la pantalla quedaría vacía. Esto lo previene.
        currentPage: 1
      }
    }
  })),
  setSelectedGenre: (catalogKey, selectedGenre) => set((state) => ({
    filtersByKey: {
      ...state.filtersByKey,
      [catalogKey]: {
        ...getCatalogFilters(state.filtersByKey, catalogKey),
        selectedGenre,
        currentPage: 1
      }
    }
  })),
  setCurrentPage: (catalogKey, currentPage) => set((state) => ({
    filtersByKey: {
      ...state.filtersByKey,
      [catalogKey]: {
        ...getCatalogFilters(state.filtersByKey, catalogKey),
        currentPage
      }
    }
  })),
  resetCatalogFilters: (catalogKey) => set((state) => ({
    filtersByKey: {
      ...state.filtersByKey,
      [catalogKey]: { ...defaultCatalogFilters }
    }
  }))
}));
function useCatalogFilters(catalogKey) {
  const searchTerm = useCatalogFilterStore(
    (state) => getCatalogFilters(state.filtersByKey, catalogKey).searchTerm
  );
  const selectedGenre = useCatalogFilterStore(
    (state) => getCatalogFilters(state.filtersByKey, catalogKey).selectedGenre
  );
  const currentPage = useCatalogFilterStore(
    (state) => getCatalogFilters(state.filtersByKey, catalogKey).currentPage
  );
  const setSearchTerm = useCatalogFilterStore((state) => state.setSearchTerm);
  const setSelectedGenre = useCatalogFilterStore(
    (state) => state.setSelectedGenre
  );
  const setCurrentPage = useCatalogFilterStore((state) => state.setCurrentPage);
  const resetCatalogFilters = useCatalogFilterStore(
    (state) => state.resetCatalogFilters
  );
  return {
    searchTerm,
    selectedGenre,
    currentPage,
    setSearchTerm: (value) => setSearchTerm(catalogKey, value),
    setSelectedGenre: (value) => setSelectedGenre(catalogKey, value),
    setCurrentPage: (value) => setCurrentPage(catalogKey, value),
    resetCatalogFilters: () => resetCatalogFilters(catalogKey)
  };
}

function CatalogBrowser({
  catalogKey,
  items,
  getTitle,
  getGenres,
  renderCard,
  searchPlaceholder,
  filterTitle,
  emptyMessage,
  itemsPerPage = 20
}) {
  const {
    searchTerm,
    selectedGenre,
    currentPage,
    setSearchTerm,
    setSelectedGenre,
    setCurrentPage,
    resetCatalogFilters
  } = useCatalogFilters(catalogKey);
  const genres = useMemo(
    () => getUniqueCatalogGenres(items, getGenres),
    [items, getGenres]
  );
  const filteredItems = useMemo(
    () => filterCatalogItems(items, searchTerm, selectedGenre, getTitle, getGenres),
    [items, searchTerm, selectedGenre, getTitle, getGenres]
  );
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const safeCurrentPage = clampCatalogPage(currentPage, totalPages);
  const paginatedItems = useMemo(
    () => paginateCatalogItems(filteredItems, safeCurrentPage, itemsPerPage),
    [filteredItems, safeCurrentPage, itemsPerPage]
  );
  const hasResults = filteredItems.length > 0;
  return /* @__PURE__ */ jsxs("section", { className: "w-full max-w-7xl mx-auto px-4 py-8", children: [
    /* @__PURE__ */ jsx(
      CatalogFilters,
      {
        searchTerm,
        selectedGenre,
        genres,
        searchPlaceholder,
        filterTitle,
        onSearchTermChange: setSearchTerm,
        onGenreChange: setSelectedGenre
      }
    ),
    hasResults ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5", children: paginatedItems.map((item) => renderCard(item)) }),
      /* @__PURE__ */ jsx(
        CatalogPagination,
        {
          currentPage: safeCurrentPage,
          totalPages,
          onPageChange: setCurrentPage
        }
      )
    ] }) : /* @__PURE__ */ jsxs("div", { className: "py-20 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xl text-slate dark:text-mist", children: emptyMessage }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: resetCatalogFilters,
          className: "mt-4 text-sapphire dark:text-electric-sky hover:text-sapphire/80 dark:hover:text-electric-sky/80 underline",
          children: "Limpiar filtros"
        }
      )
    ] })
  ] });
}

function CatalogCard3D({ item }) {
  const [transform, setTransform] = useState("");
  const [isHovered, setIsHovered] = useState(false);
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
  const handleMouseMove = (event) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / centerY * -10;
    const rotateY = (x - centerX) / centerX * 10;
    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    );
  };
  const handleMouseLeave = () => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setIsHovered(false);
  };
  const handleAddToCollection = async (e, collectionId) => {
    e.preventDefault();
    e.stopPropagation();
    await addItem(collectionId, {
      apiId: item.id,
      title: item.title,
      type: item.type,
      metadata: {
        image: item.image,
        rating: item.rating,
        genres: item.genres
      }
    });
    setShowCollections(false);
    alert(`¡${item.type === "movie" ? "Película" : "Juego"} añadido a la colección!`);
  };
  const relevantCollections = collections.filter((c) => c.type === item.type);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "relative group cursor-pointer w-full aspect-[3/4] rounded-xl transition-all duration-200 ease-out shadow-lg",
      style: { transform, transformStyle: "preserve-3d" },
      onMouseMove: handleMouseMove,
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: handleMouseLeave,
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute inset-0 rounded-xl bg-cover bg-center blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 z-0",
            style: { backgroundImage: item.image ? `url(${item.image})` : "none" }
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 rounded-xl overflow-hidden border border-bone dark:border-night-edge bg-sand dark:bg-coal z-10", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: item.image || "https://placehold.co/300x400/1a1a1a/ffffff?text=No+Cover",
              alt: `Portada de ${item.title}`,
              className: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80" }),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: `absolute inset-x-0 bottom-0 p-4 transform transition-transform duration-300 ${isHovered ? "translate-y-0" : "translate-y-4"}`,
              children: [
                /* @__PURE__ */ jsx("h3", { className: "text-white font-bold text-lg leading-tight mb-1 drop-shadow-md", children: item.title }),
                /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100", children: item.genres.slice(0, 2).map((genre) => /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: "text-[10px] uppercase font-semibold text-gray-300 bg-white/10 px-2 py-0.5 rounded-sm",
                    children: genre
                  },
                  genre
                )) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "absolute top-3 right-3 flex flex-col gap-2 z-30", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-blue-600 text-white font-bold text-xs px-2 py-1 rounded-md shadow-md backdrop-blur-md text-center", children: item.rating }),
          /* @__PURE__ */ jsxs("div", { className: "relative", ref: menuRef, children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowCollections(!showCollections);
                },
                className: "w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 border border-white/10",
                title: "Añadir a colección",
                children: /* @__PURE__ */ jsx(Icon, { icon: "tabler:plus", className: "w-5 h-5" })
              }
            ),
            showCollections && /* @__PURE__ */ jsxs("div", { className: "absolute top-0 right-full mr-2 w-48 bg-white dark:bg-night-edge border border-bone dark:border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-right-2 duration-200", children: [
              /* @__PURE__ */ jsx("div", { className: "p-2 border-b border-bone dark:border-white/5", children: /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate dark:text-white/40 uppercase tracking-widest px-2 text-left", children: "Mis Listas" }) }),
              /* @__PURE__ */ jsx("div", { className: "max-h-48 overflow-y-auto", children: relevantCollections.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-slate dark:text-white/30 p-3 italic text-center", children: "No tienes listas de este tipo" }) : relevantCollections.map((col) => {
                const isAdded = col.items.some((i) => i.apiId === item.id);
                return /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: (e) => !isAdded && handleAddToCollection(e, col.id),
                    disabled: isAdded,
                    className: `w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors ${isAdded ? "text-blue-500 bg-blue-500/5 cursor-default" : "text-ink dark:text-white/70 hover:bg-blue-600/10 hover:text-blue-500"}`,
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
                  className: "block text-center p-2 text-[10px] font-bold text-blue-500 hover:text-blue-400 border-t border-bone dark:border-white/5 uppercase tracking-wider",
                  children: "+ Nueva Lista"
                }
              )
            ] })
          ] })
        ] })
      ]
    }
  );
}
const CatalogCard3D$1 = memo(CatalogCard3D);

export { CatalogBrowser as C, CatalogCard3D$1 as a, getMovies as b, getGames as g };
