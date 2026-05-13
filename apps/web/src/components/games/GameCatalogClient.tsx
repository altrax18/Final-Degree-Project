// apps/web/src/components/games/GameCatalogClient.tsx
/*
  RESPONSABILIDAD: Cliente React hidratado que consume el endpoint de /api/games
  - Construye la query (q, page, limit, genres) y maneja la paginación en el cliente.
  - NO realiza transformaciones complejas de negocio; delega eso al servicio del backend.
  MOTIVO: Mantener separación UI <-> servicio para facilitar testing y mantenimiento.
*/
import type { Game } from "../../types/game";
import type { CatalogPage } from "../../hooks/useCatalogQuery";
import SharedCatalogClient from "../shared/catalog/SharedCatalogClient";

type Props = {
  initialGames: CatalogPage<Game>;
};

export default function GameCatalogClient({ initialGames }: Props) {
  return (
    <SharedCatalogClient
      catalogKey="games"
      apiPath="/api/games"
      initialData={initialGames}
      itemRoutePrefix="/games"
      labels={{
        searchPlaceholder: "Buscar un juego por título...",
        countText: "juegos",
        notFound: "No se encontraron juegos que coincidan con tu búsqueda",
        error: "No se pudieron cargar los juegos",
      }}
    />
  );
}