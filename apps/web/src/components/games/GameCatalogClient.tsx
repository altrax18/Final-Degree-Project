// apps/web/src/components/games/GameCatalogClient.tsx
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { Game } from "../../types/game";
import { getGames } from "../../lib/api";
import CatalogBrowser from "../shared/catalog/CatalogBrowser";
import CatalogCard3D from "../shared/catalog/CatalogCard3D";

interface Props {
  initialGames: Game[];
}

export default function GameCatalogClient({ initialGames }: Props) {
  // CONCEPTO: Inicialización de QueryClient en SSR (Astro)
  // QUÉ HACE: Crea la instancia de caché de React Query usando un lazy initializer (función dentro de useState).
  // POR QUÉ LO USO: En arquitecturas de "Islas" como Astro, si declaramos `new QueryClient()` fuera del componente, la caché se compartiría globalmente en el servidor, filtrando datos entre usuarios. Si lo declaramos dentro sin `useState`, la caché se destruiría en cada re-render.
  // DOCUMENTACIÓN: https://tanstack.com/query/latest/docs/framework/react/guides/ssr#an-in-depth-look-at-server-rendering-strategies
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutos de caché en el navegador
            refetchOnWindowFocus: false, // No volver a peticionar al cambiar de pestaña
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <GameCatalogContent initialGames={initialGames} />
    </QueryClientProvider>
  );
}

function GameCatalogContent({ initialGames }: Props) {
  // CONCEPTO: Hidratación de Caché (Initial Data)
  // QUÉ HACE: Inyecta los datos de `initialGames` (descargados por Astro en el servidor) directamente en la caché de React Query antes de que haga ninguna petición.
  // POR QUÉ LO USO: Permite que el usuario vea los juegos inmediatamente sin pantallas de carga blancas (SEO amigable), mientras React Query asume el control en segundo plano para futuras actualizaciones.
  // DOCUMENTACIÓN: https://tanstack.com/query/latest/docs/framework/react/guides/initial-data
  const { data: games = initialGames } = useQuery({
    queryKey: ["catalog", "games"],
    queryFn: getGames,
    initialData: initialGames,
  });

  return (
    // CONCEPTO: Composición de Contenedores
    // QUE HACE: Reutiliza el browser genérico para mantener el dominio de juegos delgado.
    // POR QUE LO USO: Separa recuperación de datos, estado de filtros y presentación de tarjetas.
    // DOCUMENTACIÓN: https://react.dev/learn/passing-props-to-a-component
    <CatalogBrowser
      catalogKey="games"
      items={games}
      getTitle={(game) => game.title}
      getGenres={(game) => game.genres}
      searchPlaceholder="Buscar un juego por título..."
      filterTitle="Filtrar por Categoría"
      emptyMessage="No se encontraron juegos que coincidan con tu búsqueda"
      itemsPerPage={20}
      renderCard={(game) => (
        // CONCEPTO: Navegacion Declarativa con Enlaces
        // QUE HACE: Convierte cada tarjeta de juego en un enlace hacia su pagina de detalle.
        // POR QUE LO USO: Mantiene una UX predecible y permite abrir detalle en nueva pestana con click derecho.
        // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a
        <a key={game.id} href={`/games/${game.id}`} aria-label={`Ver detalle de ${game.title}`}>
          <CatalogCard3D item={game} />
        </a>
      )}
    />
  );
}