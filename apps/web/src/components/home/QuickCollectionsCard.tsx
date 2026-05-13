import type { UserCollection } from "../../types/collection";

const typeLabel: Record<UserCollection["type"], string> = {
  music: "Música",
  movie: "Películas",
  game: "Juegos",
};


const getCollectionCover = (collection: UserCollection) => {
  const firstItem = collection.items?.[0];
  return (
    firstItem?.metadata?.image ??
    firstItem?.metadata?.cover ??
    "https://placehold.co/160x160/0A0A0A/FFFFFF?text=A"
  );
};

function MiniCollection({ collection }: { collection: UserCollection }) {
  return (
    <a
      href="/profile"
      className="group flex cursor-pointer items-center gap-3.5 rounded-lg border border-bone bg-parchment p-3 transition-all duration-300 hover:scale-[1.02] hover:border-amethyst hover:shadow-md dark:border-night-edge dark:bg-coal dark:hover:border-electric-sky active:scale-[0.98]"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-sand dark:bg-obsidian">
        <img
          src={getCollectionCover(collection)}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-abyss/50 to-transparent" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold leading-tight text-ink dark:text-screen">
          {collection.name}
        </p>
        <p className="mt-1 text-[11px] leading-snug text-slate sm:text-xs dark:text-mist">
          {collection.items?.length ?? 0} items · {typeLabel[collection.type]}
        </p>
      </div>
    </a>
  );
}

type Props = {
  collections: UserCollection[];
  loading: boolean;
  error: string | null;
};

// CONCEPTO: UI Component Extraction (Extracción de Componentes)
// QUE HACE: Centraliza la lógica visual de las colecciones, gestionando sus 3 estados posibles: Cargando (Skeletons), Error, y Éxito (Lista).
// POR QUE LO USO: Previene el anti-patrón "God Component", haciendo el código más modular, fácil de leer y testear de forma aislada.
export default function QuickCollectionsCard({ collections, loading, error }: Props) {
  const visibleCollections = collections.slice(0, 4);

  return (
    <section className="rounded-lg border border-bone bg-linen p-4 sm:p-5 dark:border-night-edge dark:bg-obsidian">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amethyst dark:text-electric-sky">
            Acceso rápido
          </p>
          <h2 className="mt-1 text-lg font-semibold text-ink dark:text-screen">
            Tus colecciones
          </h2>
        </div>
        <a
          href="/profile"
          className="cursor-pointer text-xs font-semibold text-slate transition-colors hover:text-ink dark:text-mist dark:hover:text-screen"
        >
          Perfil
        </a>
      </div>

      <div className="mt-4 space-y-2">
        {loading && collections.length === 0 ? (
          [0, 1, 2].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3.5 rounded-lg border border-bone bg-parchment/40 p-3 dark:border-night-edge dark:bg-coal/40"
            >
              <div className="h-14 w-14 shrink-0 animate-pulse rounded-lg bg-bone/60 dark:bg-night-edge/60" />
              <div className="flex min-w-0 flex-1 flex-col justify-center space-y-2.5">
                <div className="h-3 w-3/4 animate-pulse rounded-md bg-bone/60 dark:bg-night-edge/60" />
                <div className="h-2 w-1/2 animate-pulse rounded-md bg-bone/60 dark:bg-night-edge/60" />
              </div>
            </div>
          ))
        ) : null}

        {!loading && error ? (
          <p className="rounded-lg border border-bone bg-parchment p-3 text-xs text-slate dark:border-night-edge dark:bg-coal dark:text-mist">
            {error}
          </p>
        ) : null}

        {!loading && !error && visibleCollections.length === 0 ? (
          <div className="rounded-lg border border-dashed border-bone bg-parchment p-4 dark:border-night-edge dark:bg-coal">
            <p className="text-sm font-semibold text-ink dark:text-screen">
              Aún no hay listas
            </p>
            <p className="mt-1 text-xs leading-5 text-slate dark:text-mist">
              Crea colecciones desde el perfil y aparecerán aquí como accesos
              directos.
            </p>
          </div>
        ) : null}

        {visibleCollections.map((collection) => (
          <MiniCollection key={collection.id} collection={collection} />
        ))}
      </div>
    </section>
  );
}