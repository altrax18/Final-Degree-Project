import { useState, useEffect, useRef, type ReactNode } from "react";
import { useCollections } from "../../../hooks/useCollections";
import { Icon } from "@iconify/react";
import ReviewSection from "../ReviewSection";
import type { UserCollection } from "../../../types/collection";

interface Props {
  id: string;
  title: string;
  type: "movie" | "game";
  image: string | null;
  heroBackground: string | null;
  heroSubtitle: string | null;
  tagline?: string | null;
  rating: number;
  releaseDate: string;
  extraHeroTags?: ReactNode;
  collectionMetadata: any;
  leftColumn: ReactNode;
  rightColumn: ReactNode;
  accentColor: "blue" | "red";
}

export default function SharedDetailsLayout({
  id, title, type, image, heroBackground, heroSubtitle, tagline, rating, releaseDate, 
  extraHeroTags, collectionMetadata, leftColumn, rightColumn, accentColor
}: Props) {
  const [showCollections, setShowCollections] = useState(false);
  const { collections, addItem } = useCollections();
  const menuRef = useRef<HTMLDivElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowCollections(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddToCollection = async (collectionId: number) => {
    await addItem(collectionId, {
      apiId: id,
      title,
      type,
      metadata: collectionMetadata
    });
    setShowCollections(false);

    setToastMessage(`¡${type === "movie" ? "Película añadida" : "Juego añadido"} a tu lista!`);

    const popSound = new Audio('/popList.mp3');
    popSound.volume = 0.3;
    popSound.play().catch(() => {});

    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 3000);
  };

  const relevantCollections = collections.filter((c: UserCollection) => c.type === type);

  const colorMap = {
    blue: {
      text: "text-blue-500", hoverText: "hover:text-blue-500", hoverBg: "hover:bg-blue-600/10",
      activeBg: "bg-blue-500/5", btnHover: "hover:text-blue-400", btnHoverBg: "hover:bg-blue-500/10",
    },
    red: {
      text: "text-red-500", hoverText: "hover:text-red-500", hoverBg: "hover:bg-red-600/10",
      activeBg: "bg-red-500/5", btnHover: "hover:text-red-400", btnHoverBg: "hover:bg-red-500/10",
    }
  };
  const colors = colorMap[accentColor];

  return (
    <article className="min-h-screen bg-parchment dark:bg-obsidian text-ink dark:text-screen w-full">
      {/* 1. HERO SECTION */}
      <div className="relative w-full min-h-[50vh] md:h-[60vh] pt-24 md:pt-0 flex items-end justify-center">
        <div
          className="absolute inset-0 bg-cover bg-top opacity-30 mask-image-gradient"
          style={{ backgroundImage: heroBackground ? `url(${heroBackground})` : "none" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-parchment dark:from-obsidian via-parchment/60 dark:via-obsidian/60 to-transparent" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pb-10 flex flex-col items-center text-center md:flex-row md:items-end md:text-left gap-8">
          <div className="w-48 md:w-64 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border-2 border-bone dark:border-night-edge shadow-black/50 transform md:translate-y-16">
            <img
              src={image || "https://placehold.co/600x900/111827/e5e7eb?text=No+Poster"}
              alt={title}
              className="w-full h-auto object-cover aspect-[3/4]"
            />
          </div>

          <div className="w-full md:flex-1 pb-4">
            <p className="text-blue-400 font-semibold tracking-widest uppercase text-xs mb-2">
              {heroSubtitle || "Desconocido"}
            </p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 drop-shadow-lg">
              {title}
            </h1>
            {tagline && <p className="text-slate dark:text-mist italic mb-4">"{tagline}"</p>}

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-slate dark:text-mist">
              <span className="flex items-center gap-1 bg-ink/10 dark:bg-screen/10 px-3 py-1 rounded-full backdrop-blur-md border border-bone dark:border-night-edge">
                ⭐ <span className="text-ink dark:text-screen font-bold">{rating}</span> / 100
              </span>
              <span className="bg-ink/10 dark:bg-screen/10 px-3 py-1 rounded-full backdrop-blur-md border border-bone dark:border-night-edge">
                📅 {releaseDate}
              </span>
              {extraHeroTags}
            </div>
          </div>
        </div>
      </div>

      {/* 2. CONTENIDO PRINCIPAL */}
      <div className="w-full max-w-7xl mx-auto px-4 py-16 md:py-24 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {leftColumn}
            <ReviewSection itemType={type} itemApiId={id} accentColor={accentColor} />
          </div>

          <aside className="space-y-8 bg-sand dark:bg-coal p-6 rounded-2xl border border-bone dark:border-night-edge h-fit shadow-2xl">
            {rightColumn}

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowCollections(!showCollections)}
                className="w-full py-4 bg-ink dark:bg-screen text-screen dark:text-ink font-bold rounded-xl hover:bg-ink/80 dark:hover:bg-screen/80 transition-transform active:scale-95 shadow-[0_0_20px_rgba(0,0,0,0.2)] dark:shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2"
              >
                <Icon icon="tabler:plus" className="w-5 h-5" />
                Añadir a mi Colección
              </button>

              {showCollections && (
                <div className="absolute bottom-full left-0 mb-3 w-full bg-white dark:bg-night-edge border border-bone dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="p-3 border-b border-bone dark:border-white/5">
                    <p className="text-[10px] font-bold text-slate dark:text-white/40 uppercase tracking-widest px-2 text-left">Mis Listas</p>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {relevantCollections.length === 0 ? (
                      <p className="text-xs text-slate dark:text-white/30 p-4 italic text-center">No tienes listas</p>
                    ) : (
                      relevantCollections.map((col: UserCollection) => {
                        const isAdded = col.items.some((i: any) => String(i.apiId) === String(id));
                        return (
                          <button
                            key={col.id}
                            onClick={() => !isAdded && handleAddToCollection(col.id)}
                            disabled={isAdded}
                            className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-all ${
                              isAdded
                                ? `${colors.text} ${colors.activeBg} cursor-default`
                                : `cursor-pointer text-ink dark:text-white/70 ${colors.hoverBg} ${colors.hoverText} active:scale-[0.98]`
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
                    className={`block cursor-pointer text-center p-3 text-[10px] font-bold ${colors.text} ${colors.btnHoverBg} ${colors.btnHover} border-t border-bone dark:border-white/5 uppercase tracking-wider transition-colors`}
                  >
                    + Nueva Lista
                  </a>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 rounded-full border border-bone/20 bg-ink px-5 py-3 text-sm font-semibold text-screen shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-300 dark:border-night-edge/20 dark:bg-screen dark:text-ink">
          <Icon icon="tabler:circle-check-filled" className="h-6 w-6 text-emerald-400 dark:text-emerald-500 animate-in zoom-in duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </article>
  );
}