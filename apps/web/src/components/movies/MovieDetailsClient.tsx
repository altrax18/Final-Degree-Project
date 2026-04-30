// apps/web/src/components/movies/MovieDetailsClient.tsx
import type { Movie } from "../../types/movie";

interface Props {
  movie: Movie;
}

export default function MovieDetailsClient({ movie }: Props) {
  // CONCEPTO: Formateo Localizado de Fechas
  // QUE HACE: Convierte timestamp UNIX en fecha legible para interfaz en espanol.
  // POR QUE LO USO: Mejora la lectura de metadatos sin agregar librerias extra.
  // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
  const releaseDate = movie.firstReleaseDate
    ? new Intl.DateTimeFormat("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(movie.firstReleaseDate))
    : "Fecha desconocida";

  const heroBackground = movie.backdrop || movie.image;

  // CONCEPTO: Formateo de Moneda Internacional
  // QUE HACE: Convierte presupuesto/recaudacion a formato USD legible.
  // POR QUE LO USO: Evita mostrar numeros crudos largos y mejora comparacion visual.
  // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
  const moneyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const formattedBudget =
    movie.budget && movie.budget > 0
      ? moneyFormatter.format(movie.budget)
      : "No disponible";
  const formattedRevenue =
    movie.revenue && movie.revenue > 0
      ? moneyFormatter.format(movie.revenue)
      : "No disponible";

  // CONCEPTO: Integracion de Video Embebido
  // QUE HACE: Construye URL segura de embed para YouTube cuando TMDB devuelve trailer.
  // POR QUE LO USO: Permite reproducir trailer dentro del detalle sin sacar al usuario del sitio.
  // DOCUMENTACION: https://developers.google.com/youtube/player_parameters
  const trailerEmbedUrl =
    movie.trailer && movie.trailer.site === "YouTube"
      ? `https://www.youtube.com/embed/${movie.trailer.key}`
      : null;

  return (
    <article className="min-h-screen bg-parchment dark:bg-obsidian text-ink dark:text-screen w-full">
      
      {/* 1. HERO SECTION */}
      <div className="relative w-full h-[50vh] md:h-[60vh] flex items-end justify-center">
        <div
          className="absolute inset-0 bg-cover bg-top opacity-30 mask-image-gradient"
          style={{ backgroundImage: heroBackground ? `url(${heroBackground})` : "none" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-parchment dark:from-obsidian via-parchment/60 dark:via-obsidian/60 to-transparent" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pb-10 flex flex-col md:flex-row items-end gap-8">
          <div className="w-48 md:w-64 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border-2 border-bone dark:border-night-edge shadow-black/50 transform md:translate-y-16">
            <img
              src={movie.image || "https://placehold.co/600x900/111827/e5e7eb?text=No+Poster"}
              alt={movie.title}
              className="w-full h-auto object-cover aspect-[3/4]"
            />
          </div>

          <div className="flex-1 pb-4">
            <p className="text-blue-400 font-semibold tracking-widest uppercase text-xs mb-2">
              {movie.director || "Direccion desconocida"}
            </p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 drop-shadow-lg">
              {movie.title}
            </h1>
            {movie.tagline && (
              <p className="text-slate dark:text-mist italic mb-4">"{movie.tagline}"</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate dark:text-mist">
              <span className="flex items-center gap-1 bg-ink/10 dark:bg-screen/10 px-3 py-1 rounded-full backdrop-blur-md border border-bone dark:border-night-edge">
                ⭐ <span className="text-ink dark:text-screen font-bold">{movie.rating}</span> / 100
              </span>
              <span className="bg-ink/10 dark:bg-screen/10 px-3 py-1 rounded-full backdrop-blur-md border border-bone dark:border-night-edge">
                📅 {releaseDate}
              </span>
              {movie.runtime && (
                <span className="bg-ink/10 dark:bg-screen/10 px-3 py-1 rounded-full backdrop-blur-md border border-bone dark:border-night-edge">
                  ⏱ {movie.runtime} min
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. CONTENIDO PRINCIPAL */}
      <div className="w-full max-w-7xl mx-auto px-4 py-16 md:py-24 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold mb-4 border-b border-bone dark:border-night-edge pb-2">
                Sinopsis
              </h2>
              <p className="text-slate dark:text-mist leading-relaxed text-lg">{movie.summary}</p>
            </section>

            {trailerEmbedUrl && (
              <section>
                <h2 className="text-2xl font-bold mb-4 border-b border-bone dark:border-night-edge pb-2">
                  Trailer oficial
                </h2>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
                  <div className="aspect-video">
                    <iframe
                      src={trailerEmbedUrl}
                      title={movie.trailer?.title || `Trailer de ${movie.title}`}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>
              </section>
            )}

            {(movie.cast || []).length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4 border-b border-bone dark:border-night-edge pb-2">
                  Reparto principal
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {(movie.cast || []).map((actor) => (
                    <article
                      key={`${actor.name}-${actor.character}`}
                      className="rounded-xl border border-bone dark:border-night-edge bg-sand dark:bg-coal p-3 shadow-lg"
                    >
                      <img
                        src={actor.profile || "https://placehold.co/185x278/111827/e5e7eb?text=No+Photo"}
                        alt={`Foto de ${actor.name}`}
                        className="mb-3 h-44 w-full rounded-lg object-cover"
                      />
                      <p className="text-sm font-semibold text-ink dark:text-screen truncate" title={actor.name}>{actor.name}</p>
                      <p className="text-xs text-slate dark:text-mist truncate" title={actor.character}>{actor.character}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* 3. SECCIÓN DE COMUNIDAD (AÑADIDA) */}
            {/* CONCEPTO: Componente Placeholder (Skeleton de Integración)
                QUÉ HACE: Estructura visual de los comentarios antes de tener la BBDD real.
                POR QUÉ LO USO: Permite maquetar y probar la UX social mientras el backend desarrolla los endpoints de comentarios.
                DOCUMENTACIÓN: https://uxdesign.cc/everything-you-need-to-know-about-skeleton-screens-69f201083e95 */}
            <section className="mt-16 pt-10 border-t border-bone dark:border-night-edge">
              <h2 className="text-3xl font-black mb-2">Reseñas de la Comunidad</h2>
              <p className="text-slate dark:text-mist mb-8">Comparte tu crítica sobre {movie.title}</p>
              
              <div className="bg-sand dark:bg-coal p-6 rounded-2xl border border-bone dark:border-night-edge shadow-2xl">
                {/* Input para comentar */}
                <div className="flex gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    TÚ
                  </div>
                  <div className="flex-1">
                    <textarea 
                      className="w-full bg-linen dark:bg-coal text-ink dark:text-screen p-4 rounded-xl border border-bone dark:border-night-edge focus:border-amethyst dark:focus:border-electric-sky focus:outline-none resize-none"
                      rows={3}
                      placeholder="¿Qué te pareció la película? Deja tu reseña sin spoilers..."
                    ></textarea>
                    <div className="flex justify-between items-center mt-3">
                      <div className="text-sm text-slate dark:text-mist flex items-center gap-2">
                        Valoración: ⭐⭐⭐⭐⭐
                      </div>
                      <button className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition">Publicar Reseña</button>
                    </div>
                  </div>
                </div>

                {/* Mock de Comentario de un usuario */}
                <div className="space-y-6">
                    <div className="flex gap-4 border-t border-bone dark:border-night-edge pt-6">
                    <img src="https://placehold.co/50x50/222/fff?text=CR" alt="Avatar" className="w-12 h-12 rounded-full" />
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-red-400">@cinefilo_pro</span>
                          <span className="text-xs bg-linen dark:bg-night-edge px-2 py-0.5 rounded text-ink dark:text-screen border border-bone dark:border-night-edge">⭐ 90/100</span>
                          <span className="text-xs text-slate dark:text-mist">Hace 5 horas</span>
                        </div>
                        <p className="text-slate dark:text-mist">La cinematografía y la banda sonora están a otro nivel. El director supo exactamente cómo mantener la tensión de principio a fin. Directo a mi top del año.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* COLUMNA LATERAL: METADATOS */}
          <aside className="space-y-8 bg-sand dark:bg-coal p-6 rounded-2xl border border-bone dark:border-night-edge h-fit shadow-2xl">
            <div>
              <h3 className="text-sm uppercase tracking-widest text-slate dark:text-mist mb-3 font-bold">
                Géneros
              </h3>
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-red-500/20 text-red-300 text-sm rounded-md border border-red-500/30"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm uppercase tracking-widest text-slate dark:text-mist mb-3 font-bold">
                Datos técnicos
              </h3>
              <ul className="space-y-2 text-sm text-slate dark:text-mist">
                <li>
                  <span className="text-slate dark:text-mist block mb-1">Título original:</span>
                  <span className="font-semibold text-ink dark:text-screen">{movie.originalTitle || movie.title}</span>
                </li>
                <li>
                  <span className="text-slate dark:text-mist block mb-1">Estado:</span>
                  {movie.status || "No disponible"}
                </li>
                <li>
                  <span className="text-slate dark:text-mist block mb-1">Presupuesto:</span>
                  {formattedBudget}
                </li>
                <li>
                  <span className="text-slate dark:text-mist block mb-1">Recaudación:</span>
                  {formattedRevenue}
                </li>
              </ul>
            </div>

            {/* Enlaces Externos */}
            <div className="space-y-3 pt-4 border-t border-bone dark:border-night-edge">
              {movie.homepage && (
                <a
                  href={movie.homepage}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-center font-semibold text-blue-300 hover:bg-blue-500/20 transition"
                >
                  Sitio web oficial
                </a>
              )}
              {movie.imdbId && (
                <a
                  href={`https://www.imdb.com/title/${movie.imdbId}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-center font-semibold text-yellow-300 hover:bg-yellow-500/20 transition"
                >
                  Ver en IMDb
                </a>
              )}
            </div>
            
            <button className="w-full py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 transition-transform active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
              + Añadir a mi Watchlist
            </button>
          </aside>
        </div>
      </div>
    </article>
  );
}