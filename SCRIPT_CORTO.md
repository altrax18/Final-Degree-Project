# Script Corto - 10 min (Para leer en vivo)

---

## **[0-1 min] INTRODUCCIÓN**

"Este es **Alexandria**, una plataforma que te permite descubrir, coleccionar y debatir sobre películas, videojuegos y música en un ecosistema integrado.

Tiene redes sociales, chat en tiempo real, reseñas, y recomendaciones algorítmicas."

---

## **[1-2 min] STACK + ARQUITECTURA MONOREPO**

"El proyecto usa un **monorepo con Bun Workspaces**:

- **Backend:** ElysiaJS + Drizzle ORM en Neon PostgreSQL
- **Frontend:** Astro + React para componentes interactivos

¿Por qué monorepo? Para **sincronizar tipos TypeScript automáticamente**. Cambias un endpoint en backend y TypeScript te grita en el frontend inmediatamente."

---

## **[2-6 min] ARQUITECTURA FRONTEND** ⭐ **[LO MÁS IMPORTANTE]**

### **(A) COMUNICACIÓN: Eden Treaty**

"Para hablar con la API, usamos **Eden Treaty**: un cliente RPC type-safe.

```typescript
// Esto es type-safe - si backend cambia, TypeScript lo detecta
const games = await api.api.games.get({ query: { q: "zelda", page: 1 } });
```

Sin GraphQL, sin duplicar tipos. Un único fuente de verdad."

---

### **(B) ESTADO GLOBAL: Zustand**

"Para los **filtros de catálogo** (búsqueda, géneros, página), usamos **Zustand**:

```typescript
const useCatalogFilterStore = create(({ setSearchTerm, ... }) => ({
  filtersByKey: { "games": {...}, "movies": {...} }
  // Games y Movies comparten código pero con filtros separados
}));
```

¿Por qué? Sin Redux boilerplate, y cada catálogo tiene su estado independiente."

---

### **(C) CACHÉ INTELIGENTE: React Query**

"Para los **datos del servidor** (listas de juegos, películas), usamos **React Query** con 3 estrategias:

```typescript
1️⃣ STALE TIME (5 min)
   → Si vuelves a una página visitada, NO hace fetch

2️⃣ KEEP PREVIOUS DATA
   → Mientras carga página siguiente, muestra la anterior (sin parpadeos)

3️⃣ PREFETCH PROACTIVO
   → Cuando ves página 1, ya estoy cargando página 2 en background
```

**Impacto:** Navegación instantánea, cero parpadeos, menos requests."

---

### **(D) CONFIGURACIÓN CENTRALIZADA**

"Todas esas opciones de React Query las configuramos en **un solo lugar** (`CatalogQueryProvider`):

```typescript
const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});
```

Si mañana queres cambiar a 10 minutos, tocas UN lugar."

---

## **[6-8 min] COMPONENTES**

"El flujo es así:

1. **GameCatalogClient** recibe datos de Astro SSR
2. Pasa todo a **SharedCatalogClient** (reutilizable)
3. Que usa **useCatalogFilters** (Zustand) y **useCatalogQuery** (React Query)
4. Se renderiza la grilla con **CatalogCard3D** (tardeta interactiva)

El código es genérico: el mismo componente sirve para games, movies, music."

---

## **[8-9 min] OPTIMIZACIONES QUE YO IMPLEMENTÉ**

"Las principales son:

1. **Prefetch proactivo** → Navegación instantánea
2. **Keep previous data** → UX sin parpadeos
3. **Selector optimizado en Zustand** → Si filtras movies no rerenderiza games
4. **Stale time estratégico** → Menos carga en servidor
5. **Tailwind purging** → CSS mínimo"

---

## **[9-10 min] APIs EXTERNAS**

"TMDB, IGDB, Deezer: **el backend las consume**, no el frontend.

El backend actúa como proxy:
- Recibe request del frontend → `/api/games?q=zelda`
- Llama a IGDB → `https://api.igdb.com/...`
- Normaliza respuesta
- Devuelve JSON al frontend

**¿Por qué?** Seguridad (no expones claves), control de CORS, transformación de datos."

---

## **FIN**

"**Preguntas?**"

---

## **SI PREGUNTAN...**

**"¿Código?"**
→ Abre:
  - `apps/web/src/lib/api.ts` (Eden Treaty)
  - `apps/web/src/components/shared/catalog/catalogFilterStore.ts` (Zustand)
  - `apps/web/src/hooks/useCatalogQuery.ts` (React Query)
  - `apps/web/src/components/shared/catalog/SharedCatalogClient.tsx` (Todo junto)

**"¿Por qué Astro?"**
→ Island Architecture = cero JS innecesario. Solo React en partes interactivas.

**"¿Por qué Zustand vs Context?"**
→ Context = re-renders innecesarios. Zustand = updates quirky, sin providers.

**"¿Cuál fue tu mayor learning?"**
→ Prefetch proactivo. Cambió completamente la percepción de velocidad. El prefetch es más importante que el stale time.

---
