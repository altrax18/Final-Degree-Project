import { memo, useState, useRef, useEffect } from "react";
import type { MouseEvent } from "react";
import { useCollections } from "../../../hooks/useCollections";
import { Icon } from "@iconify/react";

export interface CatalogCardItem {
  id: string;
  title: string;
  type: "movie" | "game";
  image: string | null;
  rating: number;
  genres: string[];
}

interface CatalogCard3DProps {
  item: CatalogCardItem;
  priority?: boolean;
}

function CatalogCard3D({ item, priority }: CatalogCard3DProps) {
  const [transform, setTransform] = useState("");
  const [isHovered, setIsHovered] = useState(false);
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

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
    );
  };

  const handleMouseLeave = () => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setIsHovered(false);
  };

  const handleAddToCollection = async (e: any, collectionId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    await addItem(collectionId, {
      apiId: item.id,
      title: item.title,
      type: item.type,
      metadata: {
        image: item.image,
        rating: item.rating,
        genres: item.genres
      }
    });
    
    setShowCollections(false);
    
    setToastMessage(`¡${item.type === "movie" ? "Película" : "Juego"} añadido a tu lista!`);
    
    // CONCEPTO: Feedback Auditivo
    // QUE HACE: Reproduce un pequeño sonido de "pop" al añadir la tarjeta.
    const popSound = new Audio('/popList.mp3');
    popSound.volume = 0.3; // Volumen al 30% para que sea sutil y elegante
    popSound.play().catch(() => {}); // El catch evita errores si el navegador tiene bloqueado el auto-play

    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const relevantCollections = collections.filter(c => c.type === item.type);

  return (
    <div
      className="relative group cursor-pointer w-full aspect-[3/4] rounded-xl transition-all duration-200 ease-out shadow-lg"
      style={{ transform, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="absolute inset-0 rounded-xl bg-cover bg-center blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 z-0"
        style={{ backgroundImage: item.image ? `url(${item.image})` : "none" }}
      />

      <div className="absolute inset-0 rounded-xl overflow-hidden border border-bone dark:border-night-edge bg-sand dark:bg-coal z-10">
        <img
          src={item.image || "https://placehold.co/300x400/1a1a1a/ffffff?text=No+Cover"}
          alt={`Portada de ${item.title}`}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80" />

        <div
          className={`absolute inset-x-0 bottom-0 p-4 transform transition-transform duration-300 ${
            isHovered ? "translate-y-0" : "translate-y-4"
          }`}
        >
          <h3 className="text-white font-bold text-lg leading-tight mb-1 drop-shadow-md">
            {item.title}
          </h3>

          <div className="flex flex-wrap gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
            {item.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="text-[10px] uppercase font-bold tracking-wider text-white bg-black/60 backdrop-blur-md border border-white/20 px-2 py-1 rounded-md shadow-sm"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Acciones y Rating fuera del overflow-hidden para evitar clipping */}
      {/* CONCEPTO: Escudo Anti-Navegación y Congelación 3D
          QUE HACE: Evita navegar por error y detiene el movimiento 3D de la tarjeta para poder hacer clic con precisión. */}
      <div 
        className="absolute top-3 right-3 flex flex-col items-end gap-2 z-30"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onMouseMove={(e) => e.stopPropagation()}
      >
        <div className="bg-blue-600 text-white font-bold text-xs px-2 py-1 rounded-md shadow-md backdrop-blur-md text-center">
          {item.rating}
        </div>
        
        <div className="relative" ref={menuRef}>
          {/* El pseudoelemento 'before' expande el área interactiva del botón sin hacerlo visualmente gigante */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowCollections(!showCollections); }}
            className={`relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 before:absolute before:-inset-2 before:content-[''] ${
              showCollections
                ? "border-amethyst bg-amethyst text-white opacity-100 dark:border-electric-sky dark:bg-electric-sky dark:text-obsidian"
                : "border-white/20 bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:border-amethyst hover:bg-amethyst dark:hover:border-electric-sky dark:hover:bg-electric-sky dark:hover:text-obsidian"
            }`}
            title="Añadir a lista"
            aria-label="Añadir a lista"
            aria-expanded={showCollections}
          >
            <Icon icon={showCollections ? "tabler:x" : "tabler:plus"} className="w-5 h-5 transition-transform" />
          </button>

          {showCollections && (
            <div className="absolute top-0 right-full mr-2 w-48 bg-white dark:bg-night-edge border border-bone dark:border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-right-2 duration-200">
              <div className="p-2 border-b border-bone dark:border-white/5">
                <p className="text-[10px] font-bold text-slate dark:text-white/40 uppercase tracking-widest px-2 text-left">Mis Listas</p>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {relevantCollections.length === 0 ? (
                  <p className="text-xs text-slate dark:text-white/30 p-3 italic text-center">No tienes listas de este tipo</p>
                ) : (
                  relevantCollections.map(col => {
                    const isAdded = col.items.some(i => i.apiId === item.id);
                    return (
                      <button
                        key={col.id}
                        onClick={(e) => !isAdded && handleAddToCollection(e, col.id)}
                        disabled={isAdded}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-all ${
                          isAdded 
                            ? "text-blue-500 bg-blue-500/5 cursor-default" 
                            : "cursor-pointer text-ink dark:text-white/70 hover:bg-blue-600/10 hover:text-blue-500 active:scale-[0.98]"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Icon icon="tabler:list" className="w-4 h-4 opacity-40" />
                          <span className="truncate">{col.name}</span>
                        </div>
                        {isAdded && <Icon icon="tabler:check" className="w-4 h-4" />}
                      </button>
                    );
                  })
                )}
              </div>
              <a 
                href="/profile" 
                className="block cursor-pointer text-center p-3 text-[10px] font-bold text-blue-500 hover:bg-blue-500/10 hover:text-blue-400 border-t border-bone dark:border-white/5 uppercase tracking-wider transition-colors"
              >
                + Nueva Lista
              </a>
            </div>
          )}
        </div>
      </div>

      {/* CONCEPTO: Toast Notification (Notificación Flotante)
          QUE HACE: Muestra un mensaje de éxito temporal en la parte inferior sin bloquear la pantalla. */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 rounded-full border border-bone/20 bg-ink px-5 py-3 text-sm font-semibold text-screen shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-300 dark:border-night-edge/20 dark:bg-screen dark:text-ink">
          <Icon icon="tabler:circle-check-filled" className="h-6 w-6 text-emerald-400 dark:text-emerald-500 animate-in zoom-in duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default memo(CatalogCard3D);
