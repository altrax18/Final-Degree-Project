import { c as createComponent } from './astro-component_CvTESmvA.mjs';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_DF_D8ei4.mjs';
import { $ as $$Layout } from './Layout_Dqj83iAE.mjs';
import { jsx } from 'react/jsx-runtime';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { b as getMovies, C as CatalogBrowser, a as CatalogCard3D } from './CatalogCard3D_BIyU3smy.mjs';
import { s as serverApi } from './server-api_BGd5GONv.mjs';

function MovieCatalogClient({ initialMovies }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          // CONCEPTO: Freshness Window
          // QUE HACE: Mantiene los datos de la consulta como frescos durante 5 minutos.
          // POR QUE LO USO: Reduce peticiones repetidas mientras el usuario filtra y pagina el catálogo.
          // DOCUMENTACION: https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults
          staleTime: 1e3 * 60 * 5,
          // CONCEPTO: Refetch Controlado
          // QUE HACE: Desactiva el refetch automático al volver a enfocar la pestaña.
          // POR QUE LO USO: En una pantalla de catálogo, la interacción principal es el filtrado local; no necesitamos revalidar cada cambio de foco.
          // DOCUMENTACION: https://tanstack.com/query/latest/docs/framework/react/guides/window-focus-refetching
          refetchOnWindowFocus: false
        }
      }
    })
  );
  return (
    // CONCEPTO: Provider de React Context
    // QUE HACE: Expone la caché de React Query a todo el subárbol del catálogo.
    // POR QUE LO USO: Permite usar `useQuery` en el contenido interno sin pasar props manualmente.
    // DOCUMENTACION: https://tanstack.com/query/latest/docs/framework/react/reference/QueryClientProvider
    /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(MovieCatalogContent, { initialMovies }) })
  );
}
function MovieCatalogContent({ initialMovies }) {
  const { data: movies = initialMovies } = useQuery({
    queryKey: ["catalog", "movies"],
    queryFn: getMovies,
    initialData: initialMovies
  });
  return (
    // CONCEPTO: Composición de Contenedores
    // QUE HACE: Reutiliza el browser genérico para mantener el dominio de películas delgado.
    // POR QUE LO USO: Separa recuperación de datos, estado de filtros y presentación de tarjetas.
    // DOCUMENTACION: https://react.dev/learn/passing-props-to-a-component
    /* @__PURE__ */ jsx(
      CatalogBrowser,
      {
        catalogKey: "movies",
        items: movies,
        getTitle: (movie) => movie.title,
        getGenres: (movie) => movie.genres,
        searchPlaceholder: "Buscar una pelicula por titulo...",
        filterTitle: "Filtrar por Genero",
        emptyMessage: "No se encontraron peliculas que coincidan con tu busqueda",
        itemsPerPage: 20,
        renderCard: (movie) => (
          // CONCEPTO: Navegacion Declarativa con Enlaces
          // QUE HACE: Convierte cada tarjeta de pelicula en enlace al detalle.
          // POR QUE LO USO: Habilita flujo catalogo -> detalle y comportamiento nativo del navegador.
          // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a
          /* @__PURE__ */ jsx(
            "a",
            {
              href: `/movies/${movie.id}`,
              "aria-label": `Ver detalle de ${movie.title}`,
              children: /* @__PURE__ */ jsx(CatalogCard3D, { item: movie })
            },
            movie.id
          )
        )
      }
    )
  );
}

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  let movies = [];
  let errorMessage = "";
  try {
    const { data, error } = await serverApi.api.movies.get();
    if (error) throw new Error(typeof error.value === "string" ? error.value : "API no disponible");
    movies = data;
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "No se pudieron cargar las peliculas";
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Explorar Peliculas - Alexandria" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen pt-8"> <div class="max-w-7xl mx-auto px-4 text-center"> <h1 class="text-4xl md:text-5xl font-extrabold text-ink dark:text-screen mb-4 tracking-tight">
Catalogo de <span class="text-sapphire dark:text-electric-sky">Peliculas</span> </h1> <p class="text-slate dark:text-mist text-lg max-w-2xl mx-auto mb-8">
Descubre peliculas populares, filtra por genero y encuentra que ver esta
        noche.
</p> </div> ${errorMessage && renderTemplate`<div class="max-w-3xl mx-auto mt-8 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-center"> <p> ${errorMessage}. Verifica que apps/api este corriendo en el puerto
            3000 y que TMDB_BEARER_TOKEN o TMDB_API_KEY existan en tu .env.
</p> </div>`}  ${!errorMessage && renderTemplate`${renderComponent($$result2, "MovieCatalogClient", MovieCatalogClient, { "client:load": true, "initialMovies": movies, "client:component-hydration": "load", "client:component-path": "C:/Users/sabax/OneDrive/Desktop/Final-Degree-Project/apps/web/src/components/movies/MovieCatalogClient", "client:component-export": "default" })}`} </main> ` })}`;
}, "C:/Users/sabax/OneDrive/Desktop/Final-Degree-Project/apps/web/src/pages/movies/index.astro", void 0);

const $$file = "C:/Users/sabax/OneDrive/Desktop/Final-Degree-Project/apps/web/src/pages/movies/index.astro";
const $$url = "/movies";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
