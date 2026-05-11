import { memo, useState, useRef, useEffect } from "react";
import type { MouseEvent } from "react";
import { useCollections } from "../../../hooks/useCollections";
import { Icon } from "@iconify/react";
import AddToCollectionDropdown from "../details/AddToCollectionDropdown";

export interface CatalogCardItem {
  id: string;
  title: string;
  type: "movie" | "game" | "music";
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
  const { addItem } = useCollections();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);

  // Sincronizar estado play/pause con el FooterPlayer
  useEffect(() => {
    if (item.type !== "music") return;
    const onTrackChanged = (e: any) => {
      setIsPlaying(e.detail?.id === item.id && e.detail?.playing);
    };
    window.addEventListener("player-state", onTrackChanged);
    return () => window.removeEventListener("player-state", onTrackChanged);
  }, [item.id, item.type]);

  const handlePlay = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (item.type !== "music" || !(item as any).previewUrl) return;

    window.dispatchEvent(
      new CustomEvent("play-track", {
        detail: {
          track: {
            id: item.id,
            title: item.title,
            artist: (item as any).artist,
            cover: item.image,
            previewUrl: (item as any).previewUrl,
            album: (item as any).album,
            albumId: (item as any).albumId,
            genre: item.genres[0],
          },
          queue: [],
        },
      })
    );
  };

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

  const handleAddToCollection = async (collectionId: number) => {
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
    
    setToastMessage(`¡${item.type === "movie" ? "Película" : item.type === "music" ? "Canción" : "Juego"} añadido a tu lista!`);
    
    // CONCEPTO: Feedback Auditivo
    const popSound = new Audio('/popList.mp3');
    popSound.volume = 0.3; 
    popSound.play().catch(() => {}); 

    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div
      className={`relative group cursor-pointer w-full aspect-[3/4] rounded-xl transition-all duration-200 ease-out shadow-lg ${showCollections ? 'z-50' : 'z-0'}`}
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
        className={`absolute top-3 right-3 flex flex-col items-end gap-2 ${showCollections ? "z-50" : "z-40"}`}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onMouseMove={(e) => e.stopPropagation()}
      >
        <div className="bg-blue-600 text-white font-bold text-xs px-2 py-1 rounded-md shadow-md backdrop-blur-md text-center">
          {item.rating}
        </div>
        
        <AddToCollectionDropdown
          itemId={item.id}
          itemType={item.type}
          onAdd={handleAddToCollection}
          accentColor="blue"
          position="left"
          onToggle={setShowCollections}
          customTrigger={
            <button
              className={`relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 before:absolute before:-inset-2 before:content-[''] ${
                showCollections
                  ? "border-electric-sky bg-electric-sky text-obsidian opacity-100"
                  : "border-white/20 bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:border-electric-sky hover:bg-electric-sky hover:text-obsidian"
              }`}
              title="Añadir a lista"
              aria-label="Añadir a lista"
              aria-expanded={showCollections}
            >
              <Icon icon={showCollections ? "tabler:x" : "tabler:plus"} className="w-5 h-5 transition-transform" />
            </button>
          }
        />
      </div>

      {/* CONCEPTO: Toast Notification (Notificación Flotante)
          QUE HACE: Muestra un mensaje de éxito temporal en la parte inferior sin bloquear la pantalla. */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 rounded-full border border-bone/20 bg-ink px-5 py-3 text-sm font-semibold text-screen shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-300 dark:border-night-edge/20 dark:bg-screen dark:text-ink">
          <Icon icon="tabler:circle-check-filled" className="h-6 w-6 text-emerald-400 dark:text-emerald-500 animate-in zoom-in duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
          <span>{toastMessage}</span>
        </div>
      )}
      {/* Botón de reproducción flotante para música */}
      {item.type === "music" && (item as any).previewUrl && (
        <div
          onClick={handlePlay}
          role="button"
          tabIndex={0}
          aria-label={isPlaying ? `Pausar ${item.title}` : `Reproducir ${item.title}`}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-ink/90 dark:bg-screen/90 backdrop-blur-md text-screen dark:text-ink flex items-center justify-center z-30 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95 cursor-pointer border border-white/20 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
        >
          <Icon 
            icon={isPlaying ? "tabler:player-pause-filled" : "tabler:player-play-filled"} 
            className="text-2xl pointer-events-none" 
          />
        </div>
      )}
    </div>
  );
}

export default memo(CatalogCard3D);
