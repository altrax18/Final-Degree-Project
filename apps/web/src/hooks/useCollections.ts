import { useState, useCallback, useEffect, useMemo } from "react";
import type { UserCollection, CollectionItem } from "../types/collection";
import { readSession } from "../types/user";
import { api } from "../lib/api";

// Simple singleton state manager to prevent 24 concurrent fetches on catalog load
// and synchronize state across all instances of the hook without Context.
let globalCollections: UserCollection[] = [];
let isInitialized = false;
let inFlightPromise: Promise<UserCollection[]> | null = null;
const listeners = new Set<(cols: UserCollection[]) => void>();

function notifyListeners(newCols: UserCollection[]) {
  globalCollections = newCols;
  listeners.forEach((l) => l(newCols));
}

export function useCollections() {
  const [collections, setCollections] = useState<UserCollection[]>(globalCollections);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = readSession();
  const userId = user?.id;

  const userApi = useMemo(() => userId ? api.api.users({ userId: String(userId) }) : null, [userId]);

  // Sync this local state instance with the global pool
  useEffect(() => {
    listeners.add(setCollections);
    return () => {
      listeners.delete(setCollections);
    };
  }, []);

  const fetchCollections = useCallback(async (force = false) => {
    if (!userApi) return;
    
    // If already loaded and not forcing, use existing cache
    if (isInitialized && !force) return;
    
    // If there is a fetch in flight, just await that one
    if (inFlightPromise) {
      try {
        await inFlightPromise;
      } catch {}
      return;
    }

    setLoading(true);
    
    const executeFetch = async () => {
      const { data, error } = await userApi.collections.get();
      if (error || !data) throw new Error("Error al obtener colecciones");
      return data as UserCollection[];
    };

    inFlightPromise = executeFetch();
    
    try {
      const data = await inFlightPromise;
      notifyListeners(data);
      isInitialized = true;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      inFlightPromise = null;
    }
  }, [userApi]);

  const createCollection = useCallback(async (name: string, type: "movie" | "music" | "game") => {
    if (!userApi) return;
    try {
      const { data, error } = await userApi.collections.post({ name, type });
      if (error || !data) throw new Error("Error al crear colección");
      
      notifyListeners([data as any, ...globalCollections]);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [userApi]);

  const deleteCollection = useCallback(async (collectionId: number) => {
    if (!userApi) return;
    try {
      const { error } = await userApi.collections({ collectionId: String(collectionId) }).delete();
      if (error) throw new Error("Error al eliminar colección");
      
      notifyListeners(globalCollections.filter((c) => c.id !== collectionId));
    } catch (err: any) {
      setError(err.message);
    }
  }, [userApi]);

  const fetchItems = useCallback(async (collectionId: number) => {
    if (!userApi) return [];
    try {
      const { data, error } = await userApi.collections({ collectionId: String(collectionId) }).items.get();
      if (error || !data) throw new Error("Error al obtener items");
      return data as CollectionItem[];
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  }, [userApi]);

  const addItem = useCallback(async (collectionId: number, item: Omit<CollectionItem, "id" | "collectionId" | "createdAt">) => {
    if (!userApi) return;
    try {
      // @ts-ignore - item fits shape expected by API
      const { data, error } = await userApi.collections({ collectionId: String(collectionId) }).items.post(item as any);
      if (error || !data) throw new Error("Error al añadir item");
      
      const newItem = data as any;
      const updated = globalCollections.map(col => {
        if (col.id === collectionId) {
          const exists = col.items.some((i: any) => i.apiId === newItem.apiId);
          if (exists) return col;
          return { ...col, items: [...col.items, newItem] };
        }
        return col;
      });
      
      notifyListeners(updated);
      return newItem;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [userApi]);

  const removeItem = useCallback(async (collectionId: number, itemId: number) => {
    if (!userApi) return;
    try {
      const { error } = await userApi.collections({ collectionId: String(collectionId) })
        .items({ itemId: String(itemId) })
        .delete();
      if (error) throw new Error("Error al eliminar item");
      
      const updated = globalCollections.map(col => {
        if (col.id === collectionId) {
          return { ...col, items: col.items.filter((i: any) => i.id !== itemId) };
        }
        return col;
      });
      notifyListeners(updated);
    } catch (err: any) {
      setError(err.message);
    }
  }, [userApi]);

  // Auto-fetch only once upon first mounting of ANY instance
  useEffect(() => {
    if (userApi && !isInitialized) {
      fetchCollections();
    }
  }, [userApi, fetchCollections]);

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
