import { useState, useEffect } from "react";
import { useCollections } from "../../hooks/useCollections";
import { Icon } from "@iconify/react";
import type { UserCollection, CollectionItem } from "../../types/collection";

export default function ProfileCollections() {
  const { collections, loading, error, createCollection, deleteCollection, fetchItems, removeItem } = useCollections();
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListType, setNewListType] = useState<"movie" | "music" | "game">("music");
  const [expandedCollection, setExpandedCollection] = useState<number | null>(null);
  const [collectionItems, setCollectionItems] = useState<Record<number, CollectionItem[]>>({});

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    const result = await createCollection(newListName, newListType);
    if (result) {
      setNewListName("");
      setIsCreating(false);
    }
  };

  const toggleExpand = async (id: number) => {
    if (expandedCollection === id) {
      setExpandedCollection(null);
    } else {
      setExpandedCollection(id);
      if (!collectionItems[id]) {
        const items = await fetchItems(id);
        setCollectionItems((prev) => ({ ...prev, [id]: items }));
      }
    }
  };

  const handleDeleteItem = async (colId: number, itemId: number) => {
    await removeItem(colId, itemId);
    setCollectionItems((prev) => ({
      ...prev,
      [colId]: prev[colId].filter((item) => item.id !== itemId),
    }));
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Mis Colecciones</h2>
          <p className="text-sm text-white/40 mt-1">
            Gestiona tus listas personalizadas de contenido
          </p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-medium transition-all"
        >
          <Icon icon="tabler:plus" className="w-4 h-4" />
          Nueva Lista
        </button>
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
          className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl flex flex-col md:flex-row items-end gap-4 animate-in zoom-in-95 duration-200"
        >
          <div className="flex-1 space-y-2 w-full">
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Nombre de la lista</label>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Ej: Favoritos de los 90..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-amethyst/50"
              autoFocus
            />
          </div>
          <div className="space-y-2 w-full md:w-48">
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Tipo</label>
            <select
              value={newListType}
              onChange={(e) => setNewListType(e.target.value as any)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-amethyst/50"
            >
              <option value="music" className="bg-coal text-white">Música</option>
              <option value="movie" className="bg-coal text-white">Películas</option>
              <option value="game" className="bg-coal text-white">Videojuegos</option>
            </select>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2.5 text-white/60 hover:text-white transition-colors"
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
        <div className="rounded-3xl border border-white/[0.06] border-dashed flex flex-col items-center justify-center py-24 gap-4 text-white/25">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.02] flex items-center justify-center border border-white/5">
             <Icon icon="tabler:folders" className="w-8 h-8 opacity-20" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-white/60">Aún no tienes colecciones</p>
            <p className="text-sm text-white/30 max-w-xs mx-auto mt-1">
              Empieza creando una lista para organizar tus películas, canciones o juegos favoritos.
            </p>
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
                  <h3 className="text-lg font-semibold text-white/80 capitalize">
                    {type === "music" ? "Música" : type === "movie" ? "Películas" : "Videojuegos"}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {list.map((col) => (
                    <div 
                      key={col.id} 
                      className={`group relative overflow-hidden bg-white/[0.03] border border-white/10 rounded-2xl transition-all duration-300 hover:border-white/20 ${
                        expandedCollection === col.id ? "ring-2 ring-amethyst/30" : ""
                      }`}
                    >
                      <div className="p-5 flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                          <div className="cursor-pointer flex-1" onClick={() => toggleExpand(col.id)}>
                            <h4 className="font-bold text-white group-hover:text-amethyst transition-colors line-clamp-1">{col.name}</h4>
                            <p className="text-xs text-white/30 mt-1">
                              Creada el {new Date(col.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <button 
                            onClick={() => {
                              if(confirm("¿Estás seguro de que quieres eliminar esta lista?")) deleteCollection(col.id);
                            }}
                            className="p-2 text-white/20 hover:text-rose-500 transition-colors"
                            title="Eliminar lista"
                          >
                            <Icon icon="tabler:trash" className="w-4 h-4" />
                          </button>
                        </div>

                        {expandedCollection === col.id && (
                          <div className="space-y-2 mt-2 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
                            {collectionItems[col.id]?.length === 0 ? (
                              <p className="text-xs text-white/20 italic py-4 text-center">No hay elementos en esta lista</p>
                            ) : (
                              collectionItems[col.id]?.map((item) => (
                                <div key={item.id} className="flex items-center justify-between group/item p-2 hover:bg-white/5 rounded-lg transition-colors">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center overflow-hidden">
                                       <Icon icon={type === "music" ? "tabler:music" : type === "movie" ? "tabler:movie" : "tabler:device-gamepad-2"} className="w-4 h-4 text-white/20" />
                                    </div>
                                    <span className="text-sm text-white/70 line-clamp-1">{item.title}</span>
                                  </div>
                                  <button 
                                    onClick={() => handleDeleteItem(col.id, item.id)}
                                    className="opacity-0 group-hover/item:opacity-100 p-1 text-white/20 hover:text-rose-500 transition-all"
                                  >
                                    <Icon icon="tabler:x" className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                        
                        {!expandedCollection && (
                           <div className="flex items-center justify-between mt-auto">
                              <span className="text-[10px] uppercase font-bold tracking-widest text-white/20">Contenido</span>
                              <button 
                                onClick={() => toggleExpand(col.id)}
                                className="text-xs text-amethyst hover:text-orchid font-semibold transition-colors"
                              >
                                Ver lista
                              </button>
                           </div>
                        )}
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
