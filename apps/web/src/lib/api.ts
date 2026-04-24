import { treaty } from "@elysiajs/eden";
import type { app } from "@final-degree-project/api";
import type { Game } from "../types/game";
import type { Movie } from "../types/movie";

// CONCEPTO: Cliente Tipado de API (Eden Treaty)
// QUE HACE: Crea un cliente HTTP basado en tipos del backend (App).
// POR QUE LO USO: Autocompletado y validacion de rutas/respuestas sin duplicar contratos manualmente.
// DOCUMENTACION: https://elysiajs.com/eden/overview.html

export interface TrendingItem {
  id: string;
  title: string;
  type: "movie" | "game" | "series";
  image: string | null;
}

// CONCEPTO: Alias de Tipo Reutilizable
// QUE HACE: Modela la forma estandar de respuesta de Eden ({ data, error }).
// POR QUE LO USO: Elimina repeticion de tipos inline en cada llamada del cliente.
// DOCUMENTACION: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-aliases
type EdenResponse = {
  data: unknown;
  error: { value: unknown } | null;
};

function getErrorReason(errorValue: unknown): string {
  if (typeof errorValue === "string") {
    return errorValue;
  }

  if (
    typeof errorValue === "object" &&
    errorValue !== null &&
    "message" in errorValue &&
    typeof (errorValue as { message?: unknown }).message === "string"
  ) {
    return (errorValue as { message: string }).message;
  }

  return "API no disponible";
}

// CONCEPTO: Funcion Generica Reutilizable
// QUE HACE: Centraliza llamada API + validacion de error + casteo de respuesta tipada.
// POR QUE LO USO: Evita duplicar logica en getTrending/getGames/getMovies y reduce codigo repetido.
// DOCUMENTACION: https://www.typescriptlang.org/docs/handbook/2/generics.html
async function requestApi<T>(
  request: () => Promise<EdenResponse>,
  errorPrefix: string,
): Promise<T> {
  const { data, error } = await request();

  // CONCEPTO: Fail Fast
  // QUE HACE: Detiene el flujo cuando no hay data valida o existe error reportado por el backend.
  // POR QUE LO USO: Previene estados inconsistentes en UI y simplifica debugging.
  // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw
  if (!data || error) {
    const reason = getErrorReason(error?.value);
    throw new Error(`${errorPrefix}: ${reason}`);
  }

  // CONCEPTO: Type Assertion
  // QUE HACE: Convierte la respuesta generica al tipo de dominio esperado por cada consumidor.
  // POR QUE LO USO: Eden devuelve estructura generica y aqui fijamos contrato final.
  // DOCUMENTACION: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions
  return data as T;
}

export async function getTrending(): Promise<TrendingItem[]> {
  // CONCEPTO: Reutilizacion de Infraestructura
  // QUE HACE: Usa helper comun para eliminar duplicacion de validacion/casteo.
  // POR QUE LO USO: Hace el cliente mas compacto y consistente.
  // DOCUMENTACION: https://refactoring.guru/es/replace-repetitive-code-with-subroutines
  return requestApi<TrendingItem[]>(
    () => api.api.trending.get() as Promise<EdenResponse>,
    "No se pudieron cargar tendencias",
  );
}

export async function getGames(): Promise<Game[]> {
  // CONCEPTO: Llamada Fuertemente Tipada
  // QUE HACE: Ejecuta GET /api/games y delega validacion al helper comun.
  // POR QUE LO USO: Conserva tipado fuerte sin repetir bloques de manejo de error.
  // DOCUMENTACION: https://elysiajs.com/eden/treaty/overview.html
  return requestApi<Game[]>(
    () => api.api.games.get() as Promise<EdenResponse>,
    "No se pudieron cargar los juegos",
  );
}

// CONCEPTO: Endpoint Parametrizado de Detalle
// QUE HACE: Consulta un juego especifico por ID usando la ruta /api/games/:id.
// POR QUE LO USO: Separa la carga de listado y detalle para evitar traer datos pesados en el catalogo.
// DOCUMENTACION: https://elysiajs.com/eden/treaty/overview.html
export async function getGameById(id: string): Promise<Game> {
  return requestApi<Game>(
    () => api.api.games({ id }).get() as Promise<EdenResponse>,
    "No se pudieron cargar los detalles del juego",
  );
}

export async function getMovies(): Promise<Movie[]> {
  // CONCEPTO: Cliente Tipado para endpoint /api/movies
  // QUE HACE: Solicita peliculas al backend con la misma ruta de validacion estandar.
  // POR QUE LO USO: Mantiene consistencia con getGames/getTrending y evita redundancia.
  // DOCUMENTACION: https://elysiajs.com/eden/treaty/overview.html
  return requestApi<Movie[]>(
    () => api.api.movies.get() as Promise<EdenResponse>,
    "No se pudieron cargar las peliculas",
  );
}

// CONCEPTO: Endpoint Parametrizado de Detalle
// QUE HACE: Consulta una pelicula especifica por ID usando la ruta /api/movies/:id.
// POR QUE LO USO: Permite una pantalla de detalle con datos extendidos sin sobrecargar el listado.
// DOCUMENTACION: https://elysiajs.com/eden/treaty/overview.html
export async function getMovieById(id: string): Promise<Movie> {
  return requestApi<Movie>(
    () => api.api.movies({ id }).get() as Promise<EdenResponse>,
    "No se pudieron cargar los detalles de la pelicula",
  );
}
// Cliente Eden Treaty – apunta al servidor API en ejecución.
// En las páginas SSR de Astro, esto se llama en el servidor, por lo que localhost funciona bien.
type App = typeof app;

export const api = treaty<App>("localhost:3000");
