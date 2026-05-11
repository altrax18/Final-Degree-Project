import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useCollections } from "../../../hooks/useCollections";
import type { UserCollection } from "../../../types/collection";

type AddToCollectionDropdownProps = {
  itemId: string;
  itemType: "movie" | "music" | "game";
  onAdd: (collectionId: number) => Promise<void>;
  accentColor?: "purple" | "emerald" | "rose" | "blue" | "red";
  position?: "top" | "bottom" | "left";
  customTrigger?: React.ReactNode;
  triggerClassName?: string;
  onToggle?: (isOpen: boolean) => void;
};

const COLOR_MAP = {
  purple: {
    text: "text-amethyst dark:text-orchid",
    bg: "bg-amethyst",
    activeBg: "bg-amethyst/5 dark:bg-orchid/10",
    hoverBg: "hover:bg-amethyst/10 dark:hover:bg-orchid/10",
    hoverText: "hover:text-amethyst dark:hover:text-orchid",
    btnHoverBg: "hover:bg-amethyst/5",
  },
  emerald: {
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-600",
    activeBg: "bg-emerald-50 dark:bg-emerald-900/20",
    hoverBg: "hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
    hoverText: "hover:text-emerald-600 dark:hover:text-emerald-400",
    btnHoverBg: "hover:bg-emerald-50",
  },
  rose: {
    text: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-600",
    activeBg: "bg-rose-50 dark:bg-rose-900/20",
    hoverBg: "hover:bg-rose-50 dark:hover:bg-rose-900/20",
    hoverText: "hover:text-rose-600 dark:hover:text-rose-400",
    btnHoverBg: "hover:bg-rose-50",
  },
  blue: {
    text: "text-blue-500",
    bg: "bg-blue-500",
    activeBg: "bg-blue-500/5",
    hoverBg: "hover:bg-blue-600/10",
    hoverText: "hover:text-blue-500",
    btnHoverBg: "hover:bg-blue-500/10",
  },
  red: {
    text: "text-red-500",
    bg: "bg-red-500",
    activeBg: "bg-red-500/5",
    hoverBg: "hover:bg-red-600/10",
    hoverText: "hover:text-red-500",
    btnHoverBg: "hover:bg-red-500/10",
  },
};

export default function AddToCollectionDropdown({
  itemId,
  itemType,
  onAdd,
  accentColor = "purple",
  position = "bottom",
  customTrigger,
  triggerClassName = "",
  onToggle,
}: AddToCollectionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { collections } = useCollections();

  const colors = COLOR_MAP[accentColor];

  useEffect(() => {
    onToggle?.(isOpen);
  }, [isOpen, onToggle]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const relevantCollections = collections.filter((c) => c.type === itemType);

  const handleItemClick = async (collectionId: number) => {
    await onAdd(collectionId);
    setIsOpen(false);
  };

  const positionClasses = 
    position === "top" ? "bottom-full mb-3 slide-in-from-bottom-2" :
    position === "left" ? "right-full top-0 mr-2 slide-in-from-right-2" :
    "top-full mt-3 slide-in-from-top-2";

  return (
    <div className="relative" ref={menuRef}>
      {customTrigger ? (
        <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
          {customTrigger}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${triggerClassName}`}
        >
          <Icon icon="tabler:plus" className="w-5 h-5" />
          Añadir a lista
        </button>
      )}

      {isOpen && (
        <div className={`absolute left-0 w-full min-w-[220px] bg-white dark:bg-night-edge border border-bone dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in duration-200 ${positionClasses}`}>
          <div className="p-3 border-b border-bone dark:border-white/5">
            <p className="text-[10px] font-bold text-slate dark:text-white/40 uppercase tracking-widest px-2 text-left">
              Mis Listas {itemType === "music" ? "de Música" : ""}
            </p>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {relevantCollections.length === 0 ? (
              <p className="text-xs text-slate dark:text-white/30 p-4 italic text-center">No tienes listas</p>
            ) : (
              relevantCollections.map((col: UserCollection) => {
                const isAdded = col.items.some((i: any) => String(i.apiId) === String(itemId));
                return (
                  <button
                    key={col.id}
                    onClick={() => !isAdded && handleItemClick(col.id)}
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
            className={`block cursor-pointer text-center p-3 text-[10px] font-bold ${colors.text} ${colors.btnHoverBg} border-t border-bone dark:border-white/5 uppercase tracking-wider transition-colors`}
          >
            + Nueva Lista
          </a>
        </div>
      )}
    </div>
  );
}
