import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import type { UserCollection, CollectionItem } from "../../types/collection";

interface Props {
  collections: UserCollection[];
  loading: boolean;
  error: string | null;
  createCollection?: (name: string, type: "movie" | "music" | "game") => Promise<any>;
  deleteCollection?: (id: number) => Promise<void>;
  removeItem?: (colId: number, itemId: number) => Promise<void>;
  isReadOnly?: boolean;
}

// --- Equalizer animado estilo Spotify ---

const equalizerStyle = `
  @keyframes bar1 {
    0%, 100% { height: 4px; }
    25%       { height: 14px; }
    75%       { height: 6px; }
  }
  @keyframes bar2 {
    0%, 100% { height: 10px; }
    40%       { height: 3px; }
    60%       { height: 14px; }
  }
  @keyframes bar3 {
    0%, 100% { height: 6px; }
    30%       { height: 14px; }
    70%       { height: 4px; }
  }
  .eq-bar-1 { animation: bar1 1.0s ease-in-out infinite; }
  .eq-bar-2 { animation: bar2 1.1s ease-in-out infinite 0.18s; }
  .eq-bar-3 { animation: bar3 0.9s ease-in-out infinite 0.09s; }
`;

/** Tres barras que se mueven al ritmo, como el indicador de Spotify */
function NowPlayingBars({ paused = false }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: equalizerStyle }} />
      <span
        className="inline-flex items-end gap-[2px] h-[14px] w-[14px]"
        aria-label="Reproduciendo"
      >
        {["eq-bar-1", "eq-bar-2", "eq-bar-3"].map((cls) => (
          <span
            key={cls}
            className={[
              "w-[3px] rounded-full bg-amethyst dark:bg-orchid origin-bottom",
              paused ? "" : cls,
            ].join(" ")}
            style={paused ? { height: "8px" } : undefined}
          />
        ))}
      </span>
    </>
  );
}

export default function ProfileCollections({ 
  collections, 
  loading, 
  error, 
  createCollection, 
  deleteCollection, 
  removeItem,
  isReadOnly = false
}: Props) {
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListType, setNewListType] = useState<"movie" | "music" | "game">("music");
  const [expandedCollections, setExpandedCollections] = useState<Set<number>>(new Set());
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Sincronizar con el reproductor
  useEffect(() => {
    const onPlayerState = (e: any) => {
      setCurrentTrackId(e.detail?.id ?? null);
      setIsPlaying(Boolean(e.detail?.playing));
    };
    window.addEventListener("player-state", onPlayerState);
    return () => window.removeEventListener("player-state", onPlayerState);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim() || !createCollection) return;
    const result = await createCollection(newListName, newListType);
    if (result) {
      setNewListName("");
      setIsCreating(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedCollections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /** Devuelve la URL de detalle según el tipo de ítem */
  const getItemUrl = (item: { type: string; apiId: string }) => {
    if (item.type === "music") return `/music/${item.apiId}`;
    if (item.type === "movie") return `/movies/${item.apiId}`;
    if (item.type === "game") return `/games/${item.apiId}`;
    return "#";
  };

  /** Reproduce toda la colección de música empezando por la pista indicada */
  const handlePlayCollection = (col: UserCollection, startIndex = 0) => {
    if (col.type !== "music" || !col.items || col.items.length === 0) return;
    
    const tracks = col.items.map(item => ({
      id: item.apiId,
      title: item.title,
      artist: item.metadata?.artist,
      cover: item.metadata?.cover,
      previewUrl: item.metadata?.previewUrl,
      genre: item.metadata?.genre,
      album: item.metadata?.album,
      albumId: item.metadata?.albumId
    }));

    // Reordena la cola para que empiece en la pista seleccionada
    const queue = [...tracks.slice(startIndex), ...tracks.slice(0, startIndex)];

    window.dispatchEvent(
      new CustomEvent("play-track", {
        detail: { track: queue[0], queue },
      })
    );
  };

  if (loading && collections.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-amethyst/30 border-t-amethyst animate-spin rounded-full" />
      </div>
    );
  }

  const collectionsByType = {
    music: collections.filter((c) => c.type === "music"),
    movie: collections.filter((c) => c.type === "movie"),
    game: collections.filter((c) => c.type === "game"),
  };

  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink dark:text-screen tracking-tight">Mis Colecciones</h2>
          <p className="text-sm text-slate dark:text-mist mt-1">
            {isReadOnly ? "Colecciones públicas de este usuario" : "Gestiona tus listas personalizadas de contenido"}
          </p>
        </div>
        {!isReadOnly && (
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 px-4 py-2 bg-ink/5 dark:bg-white/5 hover:bg-ink/10 dark:hover:bg-white/10 border border-bone dark:border-night-edge rounded-xl text-ink dark:text-screen text-sm font-medium transition-all"
          >
            <Icon icon="tabler:plus" className="w-4 h-4" />
            Nueva Lista
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm flex items-center gap-3">
          <Icon icon="tabler:alert-circle" className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="p-6 bg-sand dark:bg-coal border border-bone dark:border-night-edge rounded-2xl flex flex-col md:flex-row items-end gap-4 animate-in zoom-in-95 duration-200"
        >
          <div className="flex-1 space-y-2 w-full">
            <label className="text-xs font-semibold text-slate dark:text-mist uppercase tracking-wider">Nombre de la lista</label>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Ej: Favoritos de los 90..."
              className="w-full bg-ink/5 dark:bg-white/5 border border-bone dark:border-night-edge rounded-xl px-4 py-2.5 text-ink dark:text-screen placeholder:text-ink/30 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-amethyst/50"
              autoFocus
            />
          </div>
          <div className="space-y-2 w-full md:w-48">
            <label className="text-xs font-semibold text-slate dark:text-mist uppercase tracking-wider">Tipo</label>
            <select
              value={newListType}
              onChange={(e) => setNewListType(e.target.value as any)}
              className="w-full bg-ink/5 dark:bg-white/5 border border-bone dark:border-night-edge rounded-xl px-4 py-2.5 text-ink dark:text-screen appearance-none focus:outline-none focus:ring-2 focus:ring-amethyst/50"
            >
              <option value="music" className="bg-linen dark:bg-coal text-ink dark:text-screen">Música</option>
              <option value="movie" className="bg-linen dark:bg-coal text-ink dark:text-screen">Películas</option>
              <option value="game" className="bg-linen dark:bg-coal text-ink dark:text-screen">Videojuegos</option>
            </select>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2.5 text-slate dark:text-mist hover:text-ink dark:hover:text-screen transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 md:flex-none px-6 py-2.5 bg-amethyst hover:bg-orchid text-white font-semibold rounded-xl transition-all shadow-lg shadow-amethyst/20"
            >
              Crear
            </button>
          </div>
        </form>
      )}

      {collections.length === 0 && !isCreating ? (
        <div className="rounded-3xl border border-bone dark:border-night-edge border-dashed flex flex-col items-center justify-center py-24 gap-4 text-ink/25 dark:text-screen/25">
          <div className="w-16 h-16 rounded-2xl bg-ink/[0.02] dark:bg-screen/[0.02] flex items-center justify-center border border-bone/50 dark:border-night-edge/50">
             <Icon icon="tabler:folders" className="w-8 h-8 opacity-20" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-ink/60 dark:text-screen/60">
              {isReadOnly ? "No hay colecciones públicas" : "Aún no tienes colecciones"}
            </p>
            {!isReadOnly && (
              <p className="text-sm text-slate dark:text-mist max-w-xs mx-auto mt-1">
                Empieza creando una lista para organizar tus películas, canciones o juegos favoritos.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-12">
          {(["music", "movie", "game"] as const).map((type) => {
            const list = collectionsByType[type];
            if (list.length === 0) return null;

            return (
              <div key={type} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    type === "music" ? "bg-amethyst/20 text-amethyst" :
                    type === "movie" ? "bg-amber-500/20 text-amber-500" :
                    "bg-emerald-500/20 text-emerald-500"
                  }`}>
                    <Icon 
                      icon={type === "music" ? "tabler:music" : type === "movie" ? "tabler:movie" : "tabler:device-gamepad-2"} 
                      className="w-5 h-5" 
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-ink dark:text-screen capitalize">
                    {type === "music" ? "Música" : type === "movie" ? "Películas" : "Videojuegos"}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                  {list.map((col) => (
                    <div 
                      key={col.id} 
                      className={`group relative overflow-hidden bg-sand dark:bg-coal border border-bone dark:border-night-edge rounded-3xl transition-all duration-500 ${
                        expandedCollections.has(col.id) 
                          ? "ring-2 ring-amethyst/30 bg-linen dark:bg-white/[0.07] border-bone dark:border-white/20 shadow-2xl shadow-amethyst/10" 
                          : "hover:border-bone dark:hover:border-white/20 hover:bg-linen dark:hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="p-5 flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                          {/* Grid de Portadas */}
                          <div className="grid grid-cols-2 gap-0.5 w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-sand dark:bg-white/5 border border-bone dark:border-white/5 shadow-xl group-hover:scale-105 transition-transform duration-500">
                            {col.items?.length > 0 ? (
                              col.items.slice(0, 4).map((item, i) => (
                                <img 
                                  key={item.id} 
                                  src={item.metadata?.image || item.metadata?.cover || "https://placehold.co/40x40/111/fff?text=?"} 
                                  className="w-full h-full object-cover"
                                  alt=""
                                />
                              ))
                            ) : (
                              <div className="col-span-2 row-span-2 flex items-center justify-center">
                                <Icon icon="tabler:photo-off" className="w-6 h-6 opacity-10" />
                              </div>
                            )}
                            {/* Rellenar si hay menos de 4 */}
                            {col.items && col.items.length > 0 && col.items.length < 4 && Array.from({ length: 4 - col.items.length }).map((_, i) => (
                              <div key={i} className="bg-white/[0.02]" />
                            ))}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="cursor-pointer flex-1" onClick={() => toggleExpand(col.id)}>
                                <h4 className="font-bold text-ink dark:text-screen group-hover:text-amethyst transition-colors line-clamp-1">{col.name}</h4>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-slate dark:text-mist mt-1">
                                  {col.items?.length || 0} elementos
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                {type === "music" && col.items?.length > 0 && (
                                  <button
                                    onClick={() => handlePlayCollection(col)}
                                    className="p-2 text-amethyst hover:text-orchid hover:bg-amethyst/10 rounded-full transition-all"
                                    title="Reproducir lista"
                                  >
                                    <Icon icon="tabler:player-play-filled" className="w-5 h-5" />
                                  </button>
                                )}
                                {!isReadOnly && deleteCollection && (
                                  <button 
                                    onClick={() => {
                                      if(confirm("¿Estás seguro de que quieres eliminar esta lista?")) deleteCollection(col.id);
                                    }}
                                    className="p-2 text-slate/50 dark:text-mist/50 hover:text-rose-500 transition-colors"
                                    title="Eliminar lista"
                                  >
                                    <Icon icon="tabler:trash" className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {expandedCollections.has(col.id) && (
                          <div className="space-y-1 mt-2 pt-4 border-t border-bone dark:border-night-edge animate-in slide-in-from-top-2 duration-300">
                            {col.items?.length === 0 ? (
                              <p className="text-xs text-slate dark:text-mist italic py-4 text-center">No hay elementos en esta lista</p>
                            ) : (
                              col.items?.map((item, itemIdx) => {
                                const isItemActive = currentTrackId === item.apiId;
                                return (
                                  <div 
                                    key={item.id} 
                                    className={[
                                      "flex items-center justify-between group/item p-2 rounded-xl transition-all duration-200",
                                      isItemActive 
                                        ? "bg-amethyst/10 border border-amethyst/20" 
                                        : "hover:bg-sand dark:hover:bg-white/5 border border-transparent"
                                    ].join(" ")}
                                  >
                                    {/* Portada + título clicables → página de detalle */}
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                      {/* Icono de Play / Equalizer en hover o activo */}
                                      <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
                                        {isItemActive ? (
                                          <NowPlayingBars paused={!isPlaying} />
                                        ) : (
                                          <img 
                                            src={item.metadata?.image || item.metadata?.cover || ""} 
                                            className="w-full h-full rounded-lg object-cover bg-sand dark:bg-white/5 group-hover/item:opacity-40 transition-all"
                                            alt=""
                                          />
                                        )}
                                        {col.type === "music" && !isItemActive && (
                                          <button
                                            onClick={(e) => { e.preventDefault(); handlePlayCollection(col, itemIdx); }}
                                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/item:opacity-100 text-white transition-opacity"
                                          >
                                            <Icon icon="tabler:player-play-filled" className="w-4 h-4" />
                                          </button>
                                        )}
                                      </div>

                                      <a
                                        href={getItemUrl(item)}
                                        className="flex flex-col min-w-0 cursor-pointer"
                                        title={`Ver detalles de ${item.title}`}
                                      >
                                        <span className={[
                                          "text-sm line-clamp-1 transition-colors",
                                          isItemActive ? "text-amethyst font-bold" : "text-ink/70 dark:text-screen/70 group-hover/item:text-ink dark:group-hover/item:text-screen"
                                        ].join(" ")}>
                                          {item.title}
                                        </span>
                                        {item.metadata?.artist && <span className="text-[10px] text-slate dark:text-mist">{item.metadata.artist}</span>}
                                      </a>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                      {/* Botón de play individual para canciones (si no está ya activa) */}
                                      {col.type === "music" && isItemActive && (
                                        <button
                                          onClick={() => handlePlayCollection(col, itemIdx)}
                                          className="p-1.5 text-amethyst hover:text-orchid hover:bg-amethyst/10 rounded-full transition-all"
                                          title={isPlaying ? "Pausar" : "Reanudar"}
                                        >
                                          <Icon icon={isPlaying ? "tabler:player-pause-filled" : "tabler:player-play-filled"} className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                      {!isReadOnly && removeItem && (
                                        <button 
                                          onClick={() => removeItem(col.id, item.id)}
                                          className="opacity-0 group-hover/item:opacity-100 p-1.5 text-slate/50 dark:text-mist/50 hover:text-rose-500 transition-all"
                                          title="Eliminar de la lista"
                                        >
                                          <Icon icon="tabler:x" className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-auto">
                           <span className="text-[10px] text-ink/20 dark:text-screen/20 italic">
                             {expandedCollections.has(col.id) ? "" : `Creada ${new Date(col.createdAt).toLocaleDateString()}`}
                           </span>
                           <button 
                             onClick={() => toggleExpand(col.id)}
                             className={`text-xs font-semibold transition-colors flex items-center gap-1 ${
                               expandedCollections.has(col.id) ? "text-amethyst hover:text-orchid" : "text-slate dark:text-mist hover:text-ink dark:hover:text-screen"
                             }`}
                           >
                             {expandedCollections.has(col.id) ? "Cerrar" : "Ver detalles"}
                             <Icon icon={expandedCollections.has(col.id) ? "tabler:chevron-up" : "tabler:chevron-down"} className="w-3 h-3" />
                           </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
