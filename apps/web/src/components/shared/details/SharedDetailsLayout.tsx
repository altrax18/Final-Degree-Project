import { useState, useEffect, useRef, type ReactNode } from "react";
import { useCollections } from "../../../hooks/useCollections";
import { Icon } from "@iconify/react";
import ReviewSection from "../ReviewSection";
import AddToCollectionDropdown from "./AddToCollectionDropdown";

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
  const { addItem } = useCollections();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleAddToCollection = async (collectionId: number) => {
    await addItem(collectionId, {
      apiId: id,
      title,
      type,
      metadata: collectionMetadata
    });

    setToastMessage(`¡${type === "movie" ? "Película añadida" : "Juego añadido"} a tu lista!`);

    const popSound = new Audio('/popList.mp3');
    popSound.volume = 0.3;
    popSound.play().catch(() => {});

    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 3000);
  };

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

            <AddToCollectionDropdown
              itemId={String(id)}
              itemType={type}
              onAdd={handleAddToCollection}
              accentColor={accentColor}
              position="top"
              triggerClassName="w-full py-4 bg-ink dark:bg-screen text-screen dark:text-ink font-bold rounded-xl hover:bg-ink/80 dark:hover:bg-screen/80 transition-transform active:scale-95 shadow-[0_0_20px_rgba(0,0,0,0.2)] dark:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            />
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