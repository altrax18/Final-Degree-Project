// apps/web/src/components/music/MusicCatalogClient.tsx
/*
  RESPONSABILIDAD: Cliente React hidratado que consume el endpoint de /api/music
  - Construye la query (q, page, limit, genres) y maneja la paginación en el cliente.
  - Utiliza el componente genérico SharedCatalogClient para heredar todos los filtros y estilos visuales.
*/
import type { CatalogPage } from "../../hooks/useCatalogQuery";
import SharedCatalogClient from "../shared/catalog/SharedCatalogClient";

type Props = {
  initialMusic: CatalogPage<any>;
};

export default function MusicCatalogClient({ initialMusic }: Props) {
  return (
    <SharedCatalogClient
      catalogKey="music"
      apiPath="/api/music"
      initialData={initialMusic}
      itemRoutePrefix="/music"
      labels={{
        searchPlaceholder: "Buscar una canción por título o artista...",
        countText: "canciones",
        notFound: "No se encontraron canciones que coincidan con tu búsqueda",
        error: "No se pudieron cargar las canciones",
      }}
    />
  );
}
