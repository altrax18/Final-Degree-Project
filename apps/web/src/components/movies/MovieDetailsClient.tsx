import { useState, useEffect, useRef } from "react";
import type { Movie } from "../../types/movie";
import { useCollections } from "../../hooks/useCollections";
import { Icon } from "@iconify/react";
import ReviewSection from "../shared/ReviewSection";

interface Props {
  movie: Movie;
}

export default function MovieDetailsClient({ movie }: Props) {
  const [showCollections, setShowCollections] = useState(false);
  const { collections, addItem } = useCollections();
  const menuRef = useRef<HTMLDivElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowCollections(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddToCollection = async (collectionId: number) => {
    await addItem(collectionId, {
      apiId: movie.id,
      title: movie.title,
      type: "movie",
      metadata: {
        image: movie.image,
        rating: movie.rating,
        genres: movie.genres,
        director: movie.director
      }
    });
    setShowCollections(false);

    setToastMessage("¡Película añadida a tu lista!");

    // CONCEPTO: Feedback Auditivo
    const popSound = new Audio('/popList.mp3');
    popSound.volume = 0.3;
    popSound.play().catch(() => {});

    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const relevantCollections = collections.filter(c => c.type === "movie");
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
            <ReviewSection itemType="movie" itemApiId={movie.id} accentColor="red" />
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
            
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setShowCollections(!showCollections)}
                className="w-full py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 transition-transform active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.2)] flex items-center justify-center gap-2"
              >
                <Icon icon="tabler:plus" className="w-5 h-5" />
                Añadir a mi Watchlist
              </button>

              {showCollections && (
                <div className="absolute bottom-full left-0 mb-3 w-full bg-white dark:bg-night-edge border border-bone dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="p-3 border-b border-bone dark:border-white/5">
                    <p className="text-[10px] font-bold text-slate dark:text-white/40 uppercase tracking-widest px-2 text-left">Mis Listas de Películas</p>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {relevantCollections.length === 0 ? (
                      <p className="text-xs text-slate dark:text-white/30 p-4 italic text-center">No tienes listas de películas</p>
                    ) : (
                      relevantCollections.map(col => {
                        const isAdded = col.items.some(i => i.apiId === movie.id);
                        return (
                          <button
                            key={col.id}
                            onClick={() => !isAdded && handleAddToCollection(col.id)}
                            disabled={isAdded}
                            className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-all ${
                              isAdded 
                                ? "text-red-500 bg-red-500/5 cursor-default" 
                                : "cursor-pointer text-ink dark:text-white/70 hover:bg-red-600/10 hover:text-red-500 active:scale-[0.98]"
                            }`}
                          >
                            <div className="flex items-center gap-3 truncate">
                              <Icon icon="tabler:list" className="w-5 h-5 opacity-40" />
                              <span className="truncate">{col.name}</span>
                            </div>
                            {isAdded && <Icon icon="tabler:check" className="w-5 h-5" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                  <a 
                    href="/profile" 
                    className="block cursor-pointer text-center p-3 text-[10px] font-bold text-red-500 hover:bg-red-500/10 hover:text-red-400 border-t border-bone dark:border-white/5 uppercase tracking-wider transition-colors"
                  >
                    + Nueva Lista
                  </a>
                </div>
              )}
            </div>

          </aside>
        </div>
      </div>

      {/* CONCEPTO: Toast Notification (Notificación Flotante) */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 rounded-full border border-bone/20 bg-ink px-5 py-3 text-sm font-semibold text-screen shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-300 dark:border-night-edge/20 dark:bg-screen dark:text-ink">
          <Icon icon="tabler:circle-check-filled" className="h-6 w-6 text-emerald-400 dark:text-emerald-500 animate-in zoom-in duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </article>
  );
}