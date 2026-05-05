import { c as createComponent } from './astro-component_CvTESmvA.mjs';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_DF_D8ei4.mjs';
import { $ as $$Layout } from './Layout_Dqj83iAE.mjs';
import { jsx } from 'react/jsx-runtime';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { g as getGames, C as CatalogBrowser, a as CatalogCard3D } from './CatalogCard3D_BIyU3smy.mjs';
import { s as serverApi } from './server-api_BGd5GONv.mjs';

function GameCatalogClient({ initialGames }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1e3 * 60 * 5,
          // 5 minutos de caché en el navegador
          refetchOnWindowFocus: false
          // No volver a peticionar al cambiar de pestaña
        }
      }
    })
  );
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(GameCatalogContent, { initialGames }) });
}
function GameCatalogContent({ initialGames }) {
  const { data: games = initialGames } = useQuery({
    queryKey: ["catalog", "games"],
    queryFn: getGames,
    initialData: initialGames
  });
  return (
    // CONCEPTO: Composición de Contenedores
    // QUE HACE: Reutiliza el browser genérico para mantener el dominio de juegos delgado.
    // POR QUE LO USO: Separa recuperación de datos, estado de filtros y presentación de tarjetas.
    // DOCUMENTACIÓN: https://react.dev/learn/passing-props-to-a-component
    /* @__PURE__ */ jsx(
      CatalogBrowser,
      {
        catalogKey: "games",
        items: games,
        getTitle: (game) => game.title,
        getGenres: (game) => game.genres,
        searchPlaceholder: "Buscar un juego por título...",
        filterTitle: "Filtrar por Categoría",
        emptyMessage: "No se encontraron juegos que coincidan con tu búsqueda",
        itemsPerPage: 20,
        renderCard: (game) => (
          // CONCEPTO: Navegacion Declarativa con Enlaces
          // QUE HACE: Convierte cada tarjeta de juego en un enlace hacia su pagina de detalle.
          // POR QUE LO USO: Mantiene una UX predecible y permite abrir detalle en nueva pestana con click derecho.
          // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a
          /* @__PURE__ */ jsx("a", { href: `/games/${game.id}`, "aria-label": `Ver detalle de ${game.title}`, children: /* @__PURE__ */ jsx(CatalogCard3D, { item: game }) }, game.id)
        )
      }
    )
  );
}

const $$Games = createComponent(async ($$result, $$props, $$slots) => {
  let games = [];
  let errorMessage = "";
  try {
    const { data, error } = await serverApi.api.games.get();
    if (error) throw new Error(typeof error.value === "string" ? error.value : "API no disponible");
    games = data;
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "No se pudieron cargar los juegos";
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Explorar Juegos - Alexandria" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen pt-8"> <div class="max-w-7xl mx-auto px-4 text-center"> <h1 class="text-4xl md:text-5xl font-extrabold text-ink dark:text-screen mb-4 tracking-tight">
Catálogo de <span class="text-sapphire dark:text-electric-sky">Juegos</span> </h1> <p class="text-slate dark:text-mist text-lg max-w-2xl mx-auto mb-8">
Explora la base de datos, filtra por tus géneros favoritos y descubre tu
        próxima aventura.
</p> </div> ${errorMessage && renderTemplate`<div class="max-w-3xl mx-auto mt-8 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-center"> <p> ${errorMessage}. Verifica que apps/api esté corriendo en el puerto
            3000.
</p> </div>`}  ${!errorMessage && renderTemplate`${renderComponent($$result2, "GameCatalogClient", GameCatalogClient, { "client:load": true, "initialGames": games, "client:component-hydration": "load", "client:component-path": "C:/Users/sabax/OneDrive/Desktop/Final-Degree-Project/apps/web/src/components/games/GameCatalogClient", "client:component-export": "default" })}`} </main> ` })}`;
}, "C:/Users/sabax/OneDrive/Desktop/Final-Degree-Project/apps/web/src/pages/games.astro", void 0);

const $$file = "C:/Users/sabax/OneDrive/Desktop/Final-Degree-Project/apps/web/src/pages/games.astro";
const $$url = "/games";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Games,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
