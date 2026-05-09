import { useState, useCallback, useEffect } from "react";
import type { UserCollection, CollectionItem } from "../types/collection";
import { readSession } from "../types/user";

export function useCollections() {
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = readSession();
  const userId = user?.id;

  const fetchCollections = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}/collections`);
      if (!res.ok) throw new Error("Error al obtener colecciones");
      const data = await res.json();
      setCollections(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createCollection = useCallback(async (name: string, type: "movie" | "music" | "game") => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/users/${userId}/collections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type }),
      });
      if (!res.ok) throw new Error("Error al crear colección");
      const newCollection = await res.json();
      setCollections((prev) => [newCollection, ...prev]);
      return newCollection;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [userId]);

  const deleteCollection = useCallback(async (collectionId: number) => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/users/${userId}/collections/${collectionId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar colección");
      setCollections((prev) => prev.filter((c) => c.id !== collectionId));
    } catch (err: any) {
      setError(err.message);
    }
  }, [userId]);

  const fetchItems = useCallback(async (collectionId: number) => {
    if (!userId) return [];
    try {
      const res = await fetch(`/api/users/${userId}/collections/${collectionId}/items`);
      if (!res.ok) throw new Error("Error al obtener items");
      return await res.json() as CollectionItem[];
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  }, [userId]);

  const addItem = useCallback(async (collectionId: number, item: Omit<CollectionItem, "id" | "collectionId" | "createdAt">) => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/users/${userId}/collections/${collectionId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error("Error al añadir item");
      const newItem = await res.json();
      
      setCollections(prev => prev.map(col => {
        if (col.id === collectionId) {
          // Evitar duplicados en el estado local
          const exists = col.items.some(i => i.apiId === newItem.apiId);
          if (exists) return col;
          return { ...col, items: [...col.items, newItem] };
        }
        return col;
      }));
      
      return newItem;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [userId]);

  const removeItem = useCallback(async (collectionId: number, itemId: number) => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/users/${userId}/collections/${collectionId}/items/${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar item");
      
      setCollections(prev => prev.map(col => {
        if (col.id === collectionId) {
          return { ...col, items: col.items.filter(i => i.id !== itemId) };
        }
        return col;
      }));
    } catch (err: any) {
      setError(err.message);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchCollections();
    }
  }, [userId, fetchCollections]);

  return {
    collections,
    loading,
    error,
    fetchCollections,
    createCollection,
    deleteCollection,
    fetchItems,
    addItem,
    removeItem,
  };
}
