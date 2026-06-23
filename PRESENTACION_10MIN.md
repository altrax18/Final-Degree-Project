# Presentación TFG - 10 Minutos

---

## **1️⃣ INTRODUCCIÓN AL PROYECTO (1-2 min)**

### **Elevator Pitch**
"Este es **Alexandria**: una plataforma social hiper-optimizada que permite a usuarios descubrir, coleccionar y debatir sobre Películas, Videojuegos y Música en un único ecosistema interconectado."

### **Características Clave**
- 🎬 Catálogos masivos (TMDB, IGDB, Deezer + Genius)
- 👥 Red social completa (perfiles, seguidores, recomendaciones algorítmicas)
- 💬 Chat en tiempo real con WebSockets
- 📚 Sistema de colecciones y listas organizadas
- ⭐ Sistema de reseñas con timestamps relativos

---

## **2️⃣ STACK TECNOLÓGICO (1 min)**

### **Frontend**
- **Astro** → Island Architecture (SEO perfecto, cero JS innecesario)
- **React 18** → Componentes interactivos complejos
- **Tailwind CSS** → Estilos con tokens personalizados y modo oscuro
- **Framer Motion** → Animaciones fluidas
- **Iconify** → Iconografía vector

### **Backend**
- **Bun** → Runtime ultra-rápido
- **ElysiaJS** → Framework REST + WebSockets
- **Drizzle ORM** → Queries type-safe
- **Neon PostgreSQL** → Serverless DB
- **Vercel Blob** → Almacenamiento de avatares

---

## **3️⃣ ARQUITECTURA DEL MONOREPO (1 min)**

### **¿Por qué Monorepo?**
**Razón:** Compartir tipos TypeScript entre frontend y backend automáticamente, sin duplicar contratos.

```
Final-Degree-Project/
├── apps/api/           # Backend ElysiaJS (Puerto 3000)
│   ├── src/db/         # Esquemas Drizzle
│   ├── src/routes/     # Endpoints
│   └── src/services/   # Lógica de negocio
│
└── apps/web/           # Frontend Astro + React (Puerto 4321)
    ├── src/components/ # Islas React (desacopladas)
    ├── src/lib/        # Cliente Eden Treaty
    └── src/pages/      # Rutas SSR
```

**Ventaja:** Cambios en la API se sincronizan automáticamente al frontend.

---

## **4️⃣ ARQUITECTURA FRONTEND (3-4 min)**

### **🔹 Patrón de Comunicación: Eden Treaty**

**¿Qué es?** Un cliente RPC type-safe que sincroniza tipos backend ↔ frontend.

**Donde está:** `apps/web/src/lib/api.ts`

```typescript
// ✅ Autocompletado automático basado en tipos del backend
export async function getGames(): Promise<Game[]> {
  return requestApi<Game[]>(
    () => api.api.games.get() as Promise<EdenResponse>,
    "No se pudieron cargar los juegos",
  );
}

// ✅ Si el backend cambia /api/games → /api/games-v2,
//    TypeScript lo va a gritar inmediatamente.
```

**¿Por qué lo usamos?**
- ❌ GraphQL = complejidad, boilerplate
- ❌ Swagger/OpenAPI = duplicación de tipos
- ✅ **Eden Treaty** = un único fuente de verdad

---

### **🔹 Manejo de Estado Global: Zustand**

**¿Qué controla?** Filtros y paginación de catálogos (games, movies, music)

**Donde está:** `apps/web/src/components/shared/catalog/catalogFilterStore.ts`

```typescript
// Zustand Store con patrón "Keyed" (diccionario)
const useCatalogFilterStore = create<CatalogFilterStore>((set) => ({
  filtersByKey: {},  // { "games": {...}, "movies": {...} }
  
  setSearchTerm: (catalogKey, searchTerm) => 
    set((state) => ({
      filtersByKey: {
        ...state.filtersByKey,
        [catalogKey]: { ...getCatalogFilters(...), searchTerm }
      }
    })),
  // ...
}));
```

**¿Por qué?**
- Games y Movies **reutilizan el mismo componente** (`SharedCatalogClient`)
- Pero **necesitan filtros independientes** (no se sobreescriben)
- Zustand permite estado global **sin Redux bloat**

**Bonus:** `useCatalogFilters("games")` solo renderiza si cambian filtros de games

---

### **🔹 Caché y Paginación: React Query**

**¿Qué hace?** Gestiona datos del servidor, caché inteligente y paginación fluida.

**Donde está:** `apps/web/src/hooks/useCatalogQuery.ts`

```typescript
export function useCatalogQuery<T>(
  catalogKey: string,
  apiPath: string,
  initialData?: CatalogPage<T>,
) {
  const { searchTerm, selectedGenres, currentPage } = useCatalogFilters(catalogKey);
  
  // 🚀 ESTRATEGIA 1: Stale Time (5 minutos)
  // Si vuelves atrás a una página visitada, NO hace fetch.
  const query = useQuery<CatalogPage<T>>({
    queryKey: ["catalog", apiPath, searchTerm, selectedGenres, currentPage],
    queryFn: () => queryFn(currentPage),
    staleTime: 1000 * 60 * 5,  // ← 5 minutos
    
    // 🚀 ESTRATEGIA 2: Keep Previous Data
    // Mientras carga la página siguiente, muestra la anterior (sin parpadeos).
    placeholderData: (prev) => prev,
  });
  
  // 🚀 ESTRATEGIA 3: Prefetch Proactivo
  // Cuando ves página 1, ya estoy cargando página 2 en background.
  useEffect(() => {
    if (query.data && currentPage < totalPages) {
      queryClient.prefetchQuery({
        queryKey: [/* nextPage */],
        queryFn: () => queryFn(currentPage + 1),
      });
    }
  }, [currentPage]);
  
  return { ...query, items, totalPages };
}
```

**¿Por qué estas 3 estrategias?**
1. **Stale Time** → Menos requests al backend
2. **Placeholder Data** → UX fluida sin parpadeos
3. **Prefetch** → Navegación instantánea

---

### **🔹 Configuración Centralizada: CatalogQueryProvider**

**Donde está:** `apps/web/src/components/shared/catalog/CatalogQueryProvider.tsx`

```typescript
const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 min
      refetchOnWindowFocus: false,    // No refetch al volver a tab
    },
  },
});

export default function CatalogQueryProvider({ children }) {
  return <QueryClientProvider client={defaultQueryClient}>{children}</QueryClientProvider>;
}
```

**¿Por qué centralizar?** Si mañana queres cambiar staleTime a 10 min, tocas UN lugar.

---

## **5️⃣ COMPONENTES CLAVE (2 min)**

### **🎮 Flujo: Games/Movies**

#### **1. Componente Container** (`GameCatalogClient.tsx`)
```typescript
export default function GameCatalogClient({ initialGames }: Props) {
  return (
    <SharedCatalogClient
      catalogKey="games"              // ← Clave para Zustand
      apiPath="/api/games"            // ← Endpoint backend
      initialData={initialGames}      // ← SSR data (Astro)
      itemRoutePrefix="/games"        // ← Rutas
      labels={{
        searchPlaceholder: "Buscar un juego...",
        countText: "juegos",
        notFound: "No se encontraron juegos",
      }}
    />
  );
}
```

**¿Por qué es genérico?** El mismo componente sirve para movies, music, TODO.

---

#### **2. Componente Compartido** (`SharedCatalogClient.tsx`)
```typescript
function SharedCatalogContent<T>({ catalogKey, apiPath, initialData, ... }) {
  // 1️⃣ Obtiene filtros de Zustand
  const { searchTerm, selectedGenres, setSearchTerm, ... } = useCatalogFilters(catalogKey);
  
  // 2️⃣ Lanza query con React Query
  const {
    items,
    totalPages,
    isFetching,
    isPlaceholderData,
    genres,  // Dinámicos del servidor
  } = useCatalogQuery<T>(catalogKey, apiPath, initialData);
  
  // 3️⃣ Renderiza UI
  return (
    <section>
      <CatalogFilters         // Búsqueda + géneros
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
      />
      
      <div className="grid grid-cols-5">
        {items.map(item => (
          <a href={`${itemRoutePrefix}/${item.id}`}>
            <CatalogCard3D item={item} />  // ← Tarjeta 3D interactive
          </a>
        ))}
      </div>
      
      <CatalogPagination currentPage={safeCurrentPage} totalPages={totalPages} />
    </section>
  );
}
```

**Flujo de datos:**
1. Usuario escribe en buscador → `setSearchTerm()`
2. Zustand actualiza estado → componente se rerenderiza
3. React Query detecta queryKey cambió → lanza fetch
4. Datos llegan → se renderiza grilla

---

### **🏠 Flujo: Home**

**Donde está:** `apps/web/src/components/home/HomePage.tsx`

```typescript
export default function HomePage({
  trending,           // Del servidor (Astro SSR)
  games,
  movies,
  trendingMovies,
  trendingGames,
}: Props) {
  // 📌 Hook personalizado que mezcla y selecciona datos
  const { spotlights, featureItems, rails, marqueeItems } = useHomeMixer(
    trending,
    games,
    movies,
    trendingMovies,
    trendingGames
  );
  
  return (
    <div className="space-y-10">
      <HeroSection spotlights={spotlights} />          {/* Top 3 items */}
      <HomeMarqueeSection items={marqueeItems} />      {/* Carousel */}
      <HomeShowcaseSection featureItems={featureItems} />  {/* Destacados */}
      <HomeCommunitySection />                         {/* Comunidad */}
      <HomeRailsSection rails={rails} />             {/* Recomendaciones */}
      <PersonalSidebar />                             {/* Perfil */}
    </div>
  );
}
```

**¿Por qué esta arquitectura?**
- **Separación:** Cada sección es un componente pequeño
- **Reutilización:** HomeRailsSection = lista + cards genéricas
- **Data Flow:** Un componente padre distribuye datos sin lógica de negocio

---

## **6️⃣ OPTIMIZACIONES QUE TÚ IMPLEMENTASTE (1-2 min)**

### **✅ 1. Prefetch Proactivo (React Query)**
```typescript
// Cuando usuario está en página 1 de games, ya cargas página 2
useEffect(() => {
  if (currentPage < totalPages) {
    queryClient.prefetchQuery({
      queryKey: [/* página 2 */],
      queryFn: () => queryFn(currentPage + 1),
    });
  }
}, [currentPage]);
```
**Impacto:** Navegación instantánea entre páginas.

---

### **✅ 2. Keep Previous Data (React Query)**
```typescript
placeholderData: (prev) => prev,  // Mantiene datos viejos mientras carga
```
**Impacto:** Sin parpadeos, UX más fluida.

---

### **✅ 3. Selector Optimizado (Zustand)**
```typescript
// Solo renderiza si MI parte del estado cambió (no la de other catalogs)
const searchTerm = useCatalogFilterStore(
  (state) => getCatalogFilters(state.filtersByKey, "games").searchTerm
);
```
**Impacto:** Si usuario filtra movies, no rerenderiza games.

---

### **✅ 4. Stale Time Estratégico**
```typescript
staleTime: 1000 * 60 * 5,  // 5 minutos = menos requests
```
**Impacto:** Menos carga en servidor, más rápido para usuario.

---

### **✅ 5. Tailwind CSS Rápido**
```typescript
// PurgeCSS automático: Astro solo incluye clases usadas
className="grid grid-cols-5 gap-6 md:grid-cols-3 lg:grid-cols-4"
```
**Impacto:** CSS mínimo, bundles pequeños.

---

## **7️⃣ ¿CÓMO HICISTE LAS SOLICITUDES A APIs EXTERNAS? (1 min)**

### **TMDB, IGDB, Deezer**

**El Backend hace las llamadas**, no el Frontend:

```typescript
// Backend (ElysiaJS)
app.get("/api/movies", async (ctx) => {
  const { q, page, limit, genres } = ctx.query;
  
  // 1️⃣ Busca en TMDB
  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?query=${q}&page=${page}`,
    { headers: { Authorization: `Bearer ${TMDB_KEY}` } }
  );
  
  // 2️⃣ Transforma y normaliza
  const normalized = response.results.map(r => ({
    id: r.id,
    title: r.title,
    image: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : null,
    releaseDate: r.release_date,
  }));
  
  // 3️⃣ Filtra por géneros (server-side)
  const filtered = normalized.filter(m => genreMatch(m, genres));
  
  return { items: filtered, total: response.total_results };
});

// Frontend simplemente: api.api.movies.get({ query: { q, page, genres } })
```

**¿Por qué no en Frontend?**
- ❌ Expondría claves API
- ❌ CORS issues
- ✅ Backend como proxy seguro

---

## **COMPONENTES PARA MOSTRAR EN VIVO (si preguntan)**

Si te piden "enseña código", estos son los mejores ejemplos:

1. **`catalogFilterStore.ts`** → Muestra Zustand + patrón keyed
2. **`useCatalogQuery.ts`** → Muestra React Query + 3 estrategias
3. **`SharedCatalogClient.tsx`** → Muestra integración end-to-end
4. **`api.ts`** → Muestra Eden Treaty type-safety

---

## **HILO CONDUCTOR PARA LA PRESENTACIÓN**

```
Introducción (1 min)
  ↓
Stack + Monorepo (2 min)
  ↓
Architektur Frontend (3-4 min)
    → Eden Treaty (API tipado)
    → Zustand (estado global)
    → React Query (caché smart)
    → CatalogQueryProvider (config centralizada)
  ↓
Componentes clave (2 min)
    → GameCatalogClient (container)
    → SharedCatalogClient (composición)
    → HomePage (ejemplo home)
  ↓
Optimizaciones tuyas (1-2 min)
    → Prefetch proactivo
    → Keep previous data
    → Selector optimizado
    → Stale time
    → Tailwind purging
  ↓
APIs externas (1 min)
    → TMDB/IGDB en backend
    → Frontend simplemente consume
```

---

## **PREGUNTAS POSIBLES + RESPUESTAS**

**P: "¿Por qué Astro y no Next.js?"**
A: Astro es Island Architecture = envía cero JS por defecto. Solo React en las partes que lo necesitan. SEO perfecto, carga más rápido.

**P: "¿Por qué Zustand y no Redux/Context?"**
A: Redux = boilerplate masivo. Context = re-renders innecesarios. Zustand = ligero, selections automáticas, sin providers.

**P: "¿Por qué React Query?"**
A: Manejo automático de caché, sincronización, refetches inteligentes. Sin React Query cada fetch sería manual: carga estado, error, loading...

**P: "¿Cómo sincronizas tipos frontend y backend?"**
A: Eden Treaty. El backend exporta su tipo `app`, el frontend lo importa y todo es type-safe.

**P: "¿Cuál fue tu mayor optimización?"**
A: Prefetch proactivo. Cuando usuario ve página 1, ya estoy cargando página 2. Navegación instantánea.

---

## **TIEMPO APROXIMADO**

- Introducción: 1-2 min
- Stack: 1 min
- Arquitectura: 3-4 min ⭐ (lo más importante)
- Componentes: 2 min
- Optimizaciones: 1-2 min
- APIs: 1 min
- **Total: ~10 min**

💡 Si te quedan <5 min, salta componentes y ve directo a optimizaciones.
