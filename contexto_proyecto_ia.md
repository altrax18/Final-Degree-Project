# CONTEXTO DEL PROYECTO: Plataforma Social de Catalogación Cross-Media

Este documento proporciona un desglose exhaustivo y técnico del proyecto "Final-Degree-Project" para su análisis e interpretación por una IA, con el objetivo de generar la memoria técnica detallada (TFG).

---

## 1. RESUMEN DEL PROYECTO
**Nombre del Proyecto:** Final-Degree-Project
**Descripción:** Aplicación web moderna de catalogación social cross-media que permite a los usuarios gestionar sus consumos culturales (Películas, Videojuegos y Música) en un solo lugar. Incluye funcionalidades sociales (seguidores, chat), motores de recomendación impulsados por Inteligencia Artificial (Embeddings), y gestión dinámica de colecciones.
**Arquitectura:** Monorepo estructurado en dos aplicaciones principales (`apps/api` y `apps/web`), orquestado utilizando el gestor de paquetes y runtime **Bun**.

---

## 2. STACK TECNOLÓGICO (TECH STACK)

### ⚙️ Backend (apps/api)
*   **Runtime:** Bun (Motor JavaScript/TypeScript extremadamente rápido con herramientas integradas).
*   **Framework Web:** [ElysiaJS](https://elysiajs.com/) (Framework de alta velocidad optimizado para Bun).
*   **Base de Datos:** [Neon DB](https://neon.tech/) (PostgreSQL serverless nativo en la nube).
*   **Extensión de Base de Datos:** `pgvector` (Habilitada en Neon para búsqueda y almacenamiento de vectores AI).
*   **ORM:** [Drizzle ORM](https://orm.drizzle.team/) (Type-safe, headless y ligero para consultas seguras).
*   **Gestión de Archivos/Media:** Vercel Blob (Almacenamiento distribuido para avatares de usuarios).
*   **Autenticación y Seguridad:** `bcryptjs` (Hashing de contraseñas) y políticas de seguridad nativas.

### 🎨 Frontend (apps/web)
*   **Framework Principal:** [Astro](https://astro.build/) (Enfoque "Islands Architecture" para rendimiento crítico, renderizado en servidor SSR).
*   **Librería de Componentes Reactivos:** [React 19](https://react.dev/).
*   **Estilos (Styling):** [Tailwind CSS v4](https://tailwindcss.com/) (Framework utilitario altamente eficiente y moderno).
*   **Gestión de Estado:** [Zustand](https://github.com/pmndrs/zustand) (Estado global ligero para cliente).
*   **Fetching de Datos y Cache:** [TanStack React Query v5](https://tanstack.com/query/latest) para la cache de cliente sincronizada con el servidor.
*   **Comunicación API End-to-End:** [@elysiajs/eden](https://elysiajs.com/concept/eden.html) (Genera un cliente RPC tipado que comparte tipos de TypeScript entre Backend y Frontend automáticamente).
*   **Animaciones:** Framer Motion.
*   **Tipografía e Iconografía:** Iconify, Tabler Icons y fuentes dinámicas.
*   **Hosting/Adaptador:** `@astrojs/vercel` (Despliegue optimizado en Vercel).

---

## 3. ESTRUCTURA Y MODELO DE DATOS (DATABASE SCHEMA)

La base de datos utiliza PostgreSQL a través de Drizzle ORM. El esquema incluye:

### Tablas Nucleares
1.  **`users`**: Almacena credenciales (`username`, `email`, hash de `password`), metadatos (`gender`, `birth_year`, `newsletter`) y la URL de imagen de perfil alojada en Vercel Blob.
2.  **`items`**: Tabla caché/referencia de medios. Contiene `title`, `type` ("movie", "music", "game"), `metadata` (en formato JSONB), `api_id` (ID externo) y la columna `embedding` del tipo `vector` (384 dimensiones) para IA.
3.  **`user_collections`**: Listas personalizadas creadas por usuarios con nombre y tipo.
4.  **`collection_items`**: Relación 1:N con colecciones, almacena el ID externo y título de los ítems añadidos por el usuario.

### Tablas de Interacción y Social
5.  **`interactions`**: Historial de acciones de usuarios sobre ítems. Acciones soportadas: `like`, `dislike`, `rating`, `watchlist`, `played`, `listened`.
6.  **`reviews`**: Almacena opiniones de texto y puntuaciones numéricas (1-5) creadas por los usuarios para cualquier tipo de ítem.
7.  **`follows`**: Mapeo bidireccional de usuarios para funciones de seguidor/seguido.

### Motor de Chat
8.  **`conversations`**: Cabecera del chat, soporta tipos `direct` y `group`.
9.  **`messages`**: Historial de mensajes. Soporta tipos `text`, `image`, `file`, con soporte para eliminación lógica (`deletedAt`).
10. **`chat_members`**: Tabla intermedia para rastrear participantes del chat y marcas de "última lectura".

### Componente de Inteligencia Artificial
11. **`user_embeddings`**: Tabla crucial vinculada a `users`. Almacena un vector generado de 384 dimensiones que resume los gustos del usuario basándose en los títulos acumulados en sus colecciones.

---

## 4. INTEGRACIONES DE APIs EXTERNAS (DATA SOURCES)

El backend agrega datos de terceros en tiempo real para construir el catálogo:

1.  **Películas (Cine):** **TMDB (The Movie Database)**. Utilizado para búsquedas, detalles, trending y metadatos ricos (carteles, descripciones, directores).
2.  **Videojuegos:** **Twitch API / IGDB (Internet Game Database)**. Utilizado para toda la base de datos de juegos interactivos, portadas y clasificaciones.
3.  **Música:**
    *   **iTunes Search & Lookup API:** Proveedor principal para búsqueda de canciones, álbumes y detalles de artistas.
    *   **Apple Music RSS:** Utilizado para listar canciones de mayor tendencia actual.
    *   **LrcLib (https://lrclib.net/api/get):** Usado específicamente para extraer y mostrar las letras (lyrics) de las canciones en tiempo real.

---

## 5. SISTEMA DE INTELIGENCIA ARTIFICIAL (AI ENGINE)

El proyecto implementa un sistema de recomendaciones basado en **Vectores de Semántica Multilingüe**.

*   **Servicio Utilizado:** API de [Cohere](https://cohere.com/).
*   **Modelo de Lenguaje:** `embed-multilingual-light-v3.0` (Produce vectores de 384 floats).
*   **Mecánica:**
    1.  **Generación:** Cuando un usuario agrega contenido a sus colecciones, el backend concatena los títulos y genera un "embedding textual" que representa el perfil latente de interés del usuario a través de Cohere.
    2.  **Persistencia:** Se guarda el vector en la tabla `user_embeddings` mediante `pgvector`.
    3.  **Consulta de Similitud:** El sistema calcula la **Distancia del Coseno** en SQL directamente en la base de datos (`1 - (embedding1 <=> embedding2)`) para encontrar los usuarios más afines y proponer recomendaciones personalizadas basadas en gustos compartidos.

---

## 6. ARQUITECTURA DE LA API (ENDPOINTS)

La API de ElysiaJS está modularizada en los siguientes dominios:

*   `/users`: Autenticación (login, register), perfiles, subida de avatares (integrado con Vercel Blob) y borrado de perfiles.
*   `/catalog`: El router principal que unifica la lógica de búsqueda y obtención de detalles de Películas, Juegos y Música.
*   `/collections`: Gestión CRUD de bibliotecas de usuario.
*   `/interactions`: Lógica para "likes", guardado en listas de "por ver/jugar/escuchar".
*   `/reviews`: Sistema de reseñas persistentes y calificaciones compartidas por la comunidad.
*   `/chat`: Manejo de hilos de mensajería directa.
*   `/recommendations`: Endpoint de motor de IA que consume el servicio de similitud vectorial.
*   `/admin`: Rutas administrativas (como la reconstrucción masiva de embeddings).

---

## 7. FLUJOS DE USUARIO CLAVE (USER EXPERIENCE)

1.  **Navegación Unificada:** Desde un único buscador en Astro, el usuario puede descubrir una canción, una película y un juego.
2.  **Gestión de Perfil:** Los usuarios personalizan su identidad visual. Las imágenes se transmiten en formato `multipart/form-data` al servidor Elysia, que las sube a Vercel Blob de manera segura.
3.  **Sistema de Reseñas:** Capacidad de dejar una puntuación y texto sobre un medio específico, visible en el feed global o perfil del medio.
4.  **Interacción Social Dinámica:** Conexión con otros usuarios a través de follows y comunicación asíncrona mediante el chat implementado en base de datos.

---

## 8. NOTAS DE IMPLEMENTACIÓN TÉCNICA PARA LA MEMORIA

*   **Estrategia de Caching:** La API implementa un sistema de Cache TTL en memoria (`CACHE_TTL = 60 * 60 * 1000`) para evitar saturar límites de API en búsquedas populares de música y tendencias.
*   **Type Safety Completo:** La ventaja arquitectónica central es el uso compartido de tipos TypeScript. Los modelos de Drizzle se usan en Elysia, y gracias a Eden Treaty, el frontend de Astro/React sabe exactamente la forma del JSON que devuelve el backend sin escribir tipos duplicados.
*   **Vectorización Eficiente:** El proceso de generación de embeddings incluye el procesamiento por lotes (`COHERE_BATCH_SIZE = 96`) para minimizar las llamadas HTTP externas y optimizar la latencia.
