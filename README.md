# 🚀 Final Degree Project - Social Media Catalog 

Bienvenido al repositorio oficial de mi **Trabajo de Fin de Grado (TFG)**. 

Este proyecto es una plataforma social hiper-optimizada de "Cross-Media Cataloging" diseñada para que los usuarios descubran, coleccionen y debatan sobre **Películas, Videojuegos y Música** en un único ecosistema interconectado.

---

## ✨ Características Principales

*   **🎬 Catálogos Masivos (APIs Externas):** 
    *   **Cine:** Integración en tiempo real con TMDB.
    *   **Videojuegos:** Integración con IGDB (Twitch).
    *   **Música:** Integración con Deezer API y Genius para letras de canciones en vivo.
*   **👥 Red Social Completa:**
    *   Perfiles de usuario hiper-personalizables.
    *   Subida de avatares en la nube (Vercel Blob).
    *   Sistema de Seguidores / Siguiendo.
    *   Motor de recomendaciones algorítmicas de "Usuarios sugeridos" basado en grafos sociales de amigos en común.
*   **💬 Chat en Tiempo Real:**
    *   Mensajería instantánea mediante WebSockets.
    *   Chats directos con confirmaciones de lectura (*Mark as read*).
    *   Actualización dinámica en vivo sin recarga de página.
*   **📚 Colecciones y Listas:**
    *   Los usuarios pueden crear listas infinitas separadas por categoría (Cine, Música, Juegos).
    *   Interfaz fluida (*inline*) para añadir contenido rápidamente desde cualquier parte de la web.
*   **⭐ Sistema de Reseñas:**
    *   Valoraciones de 1 a 5 estrellas con comentarios.
    *   Calculador de tiempo relativo ("Hace 2 días", "Hoy").
    *   Borrado en cascada (Si un usuario elimina su cuenta, sus mensajes y reseñas desaparecen del sistema para proteger la privacidad).

---

## 🛠️ Stack Tecnológico

El proyecto está diseñado bajo una **arquitectura Full-Stack Serverless** orientada al rendimiento extremo y al tipado fuerte (End-to-End Type Safety):

### Frontend (Web)
*   **Framework:** [Astro](https://astro.build/) (Island Architecture para un SEO perfecto y cero JS en páginas estáticas).
*   **UI / Componentes:** [React 18](https://react.dev/) para islas interactivas complejas (Chats, Reproductores de audio, Listas desplegables).
*   **Estilos:** [Tailwind CSS](https://tailwindcss.com/) con tokens de diseño personalizados, modo oscuro nativo y Glassmorfismo.
*   **Animaciones:** [Framer Motion](https://www.framer.com/motion/).
*   **Iconografía:** [Iconify](https://iconify.design/) (Tabler Icons).

### Backend (API)
*   **Runtime:** [Bun](https://bun.sh/) (Extremadamente rápido).
*   **Framework API:** [ElysiaJS](https://elysiajs.com/) (REST & WebSockets).
*   **RPC Client:** Eden Treaty (Sincroniza los tipos de TypeScript entre Backend y Frontend automáticamente sin necesidad de GraphQL o Swagger).
*   **ORM:** [Drizzle ORM](https://orm.drizzle.team/).
*   **Base de Datos:** [Neon PostgreSQL](https://neon.tech/) (Serverless Postgres).
*   **Almacenamiento de Archivos:** [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) (para avatares e imágenes).
*   **Seguridad:** Encriptación bcryptjs para contraseñas.

---

## 🏗️ Arquitectura del Monorepo

El repositorio utiliza *Workspaces* de Bun para gestionar el frontend y backend simultáneamente:

```text
/
├── apps/
│   ├── api/        # Backend ElysiaJS (Puerto 3000)
│   │   ├── src/db/          # Esquemas Drizzle y conexión Neon
│   │   ├── src/routes/      # Endpoints (Chat, Catálogo, Usuarios)
│   │   └── src/services/    # Lógica de negocio (Búsqueda, CRUD)
│   │
│   └── web/        # Frontend Astro + React (Puerto 4321)
│       ├── src/components/  # Islas interactivas React (Desacopladas)
│       ├── src/layouts/     # Estructura global Astro
│       ├── src/lib/         # Cliente Eden Treaty (api.ts)
│       └── src/pages/       # Enrutamiento basado en archivos SSR
└── package.json
```

---

## 🚀 Despliegue en Local

Para arrancar todo el entorno (Frontend + Backend) en tu máquina:

1. **Instalar dependencias globales:**
   ```sh
   bun install
   ```

2. **Configurar Variables de Entorno (`.env`):**
   Asegúrate de configurar tu conexión a Neon Database, claves de TMDB, IGDB, y token de Vercel Blob.

3. **Iniciar Servidores en Paralelo:**
   ```sh
   bun run dev
   ```
   *Esto lanzará el Backend en `localhost:3000` y el Frontend en `localhost:4321`.*

4. **Sincronizar Base de Datos (Opcional):**
   ```sh
   cd apps/api
   bun run drizzle-kit push
   ```

---

> **Aviso de Proyecto Académico:**  
> Este repositorio constituye el núcleo de desarrollo del Trabajo de Fin de Grado y está sujeto a iteraciones constantes de refactorización y mejora arquitectónica.
