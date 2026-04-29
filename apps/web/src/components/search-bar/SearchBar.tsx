import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";

type Category = "music" | "movies" | "games";

type SearchResult = {
  id: string;
  title: string;
  subtitle?: string;
  image: string | null;
};

type Props = {
  currentPath: string;
};

const CATEGORY_CONFIG: Record<
  Category,
  { label: string; icon: string; placeholder: string }
> = {
  music: { label: "Music", icon: "tabler:vinyl", placeholder: "Search music..." },
  movies: { label: "Movies", icon: "tabler:movie", placeholder: "Search movies..." },
  games: { label: "Games", icon: "tabler:device-gamepad-2", placeholder: "Search games..." },
};

function inferCategory(path: string): Category | null {
  if (path.startsWith("/music")) return "music";
  if (path.startsWith("/movies")) return "movies";
  if (path.startsWith("/games")) return "games";
  return null;
}

async function fetchResults(
  category: Category,
  term: string,
): Promise<SearchResult[]> {
  if (category === "music") {
    const res = await fetch(
      `/api/music/search?term=${encodeURIComponent(term)}&limit=12`,
    );
    const data = await res.json();
    if (!data.results) return [];
    return (data.results as { id: string; title: string; artist: string; cover: string }[]).map(
      (r) => ({ id: r.id, title: r.title, subtitle: r.artist, image: r.cover }),
    );
  }

  if (category === "movies") {
    const res = await fetch(`/api/movies?q=${encodeURIComponent(term)}`);
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return (data as { id: string; title: string; image: string | null }[])
      .slice(0, 12)
      .map((r) => ({ id: r.id, title: r.title, image: r.image }));
  }

  if (category === "games") {
    const res = await fetch(`/api/games?q=${encodeURIComponent(term)}`);
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return (data as { id: string; title: string; image: string | null }[])
      .slice(0, 12)
      .map((r) => ({ id: r.id, title: r.title, image: r.image }));
  }

  return [];
}

function buildResultHref(category: Category, id: string): string {
  if (category === "music") return `/music/${id}`;
  if (category === "movies") return `/movies/${id}`;
  return `/games/${id}`;
}

export default function SearchBar({ currentPath }: Props) {
  const inferredCategory = inferCategory(currentPath);
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    inferredCategory ?? "music",
  );
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeCategory = inferredCategory ?? selectedCategory;

  // Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch results
  useEffect(() => {
    if (debouncedTerm.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    fetchResults(activeCategory, debouncedTerm)
      .then((data) => {
        setResults(data);
        setShowDropdown(true);
        setHighlightedIndex(data.length > 0 ? 0 : -1);
      })
      .catch(() => {
        setResults([]);
      });
  }, [debouncedTerm, activeCategory]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
        setShowCategoryMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(
        (prev) => (prev - 1 + results.length) % results.length,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target =
        highlightedIndex >= 0 ? results[highlightedIndex] : results[0];
      if (target) handleSelect(target);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (result: SearchResult) => {
    setSearchTerm(result.title);
    setShowDropdown(false);
    window.location.href = buildResultHref(activeCategory, result.id);
  };

  const handleCategoryChange = (cat: Category) => {
    setSelectedCategory(cat);
    setShowCategoryMenu(false);
    setResults([]);
    setDebouncedTerm("");
    setSearchTerm("");
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const config = CATEGORY_CONFIG[activeCategory];

  return (
    <div
      ref={containerRef}
      className="relative flex flex-1 max-w-[380px] items-center lg:max-w-[240px] xl:max-w-[380px]"
    >
      {/* Category selector (only when not on a specific catalog route) */}
      {inferredCategory === null && (
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowCategoryMenu((v) => !v)}
            aria-label="Select search category"
            className="flex items-center gap-1 rounded-l-[0.6rem] border border-r-0 border-bone dark:border-night-edge bg-linen dark:bg-coal px-2 py-2 text-xs text-slate dark:text-mist transition-colors duration-150 hover:bg-sand dark:hover:bg-coal hover:text-ink dark:hover:text-screen h-full"
          >
            <Icon icon={config.icon} width={14} height={14} aria-hidden="true" />
            <Icon icon="tabler:chevron-down" width={10} height={10} aria-hidden="true" />
          </button>

          {showCategoryMenu && (
            <div className="absolute top-[calc(100%+0.4rem)] left-0 w-32 rounded-xl border border-bone dark:border-night-edge bg-parchment/95 dark:bg-obsidian/95 backdrop-blur-xl shadow-2xl overflow-hidden z-[110] py-1">
              {(Object.keys(CATEGORY_CONFIG) as Category[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`flex w-full items-center gap-2 px-3 py-[0.4rem] text-xs transition-colors text-left ${
                    cat === activeCategory
                      ? "text-amethyst dark:text-electric-sky bg-lilac-mist dark:bg-depth"
                      : "text-slate dark:text-mist hover:bg-sand dark:hover:bg-coal hover:text-ink dark:hover:text-screen"
                  }`}
                >
                  <Icon icon={CATEGORY_CONFIG[cat].icon} width={14} height={14} aria-hidden="true" />
                  <span>{CATEGORY_CONFIG[cat].label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search icon */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute flex items-center text-slate dark:text-mist"
        style={{ left: inferredCategory === null ? "5.5rem" : "0.75rem" }}
      >
        <Icon icon="tabler:search" width={16} height={16} />
      </span>

      <input
        ref={inputRef}
        id="global-search"
        type="search"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          if (!showDropdown && e.target.value.trim().length >= 2)
            setShowDropdown(true);
        }}
        onFocus={() => {
          if (results.length > 0) setShowDropdown(true);
        }}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        aria-label="Global search"
        className={`w-full border border-bone dark:border-night-edge bg-linen dark:bg-coal py-2 pr-10 text-sm text-ink dark:text-screen outline-none placeholder:text-slate dark:placeholder:text-mist transition-[border-color,background,box-shadow] duration-200 focus:border-amethyst dark:focus:border-electric-sky focus:bg-lilac-mist/30 dark:focus:bg-depth/30 focus:shadow-[0_0_0_3px_rgba(139,111,189,0.15)] dark:focus:shadow-[0_0_0_3px_rgba(91,181,245,0.15)] [&::-webkit-search-cancel-button]:hidden ${
          inferredCategory === null
            ? "rounded-r-[0.6rem] pl-9"
            : "rounded-[0.6rem] pl-10"
        }`}
      />

      <kbd className="pointer-events-none absolute right-[0.65rem] rounded-[0.3rem] border border-bone dark:border-night-edge bg-linen dark:bg-coal px-[0.35rem] py-[0.1rem] font-[inherit] text-[0.65rem] text-slate dark:text-mist">
        Ctrl+K
      </kbd>

      {/* Dropdown results */}
      {showDropdown && searchTerm.trim().length >= 2 && (
        <div className="absolute top-[calc(100%+0.5rem)] left-0 w-full rounded-xl border border-bone dark:border-night-edge bg-parchment/95 dark:bg-obsidian/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col z-[100] max-h-[400px] overflow-y-auto">
          {results.length > 0 ? (
            <div className="flex flex-col py-2">
              {results.map((result, idx) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => handleSelect(result)}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors text-left border-none outline-none ${
                    idx === highlightedIndex
                      ? "bg-lilac-mist dark:bg-depth"
                      : "bg-transparent hover:bg-sand dark:hover:bg-coal"
                  }`}
                >
                  {result.image ? (
                    <img
                      src={result.image}
                      alt={result.title}
                      className="w-10 h-10 rounded object-cover shadow-[0_2px_8px_rgba(0,0,0,0.3)] shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-sand dark:bg-coal shrink-0 flex items-center justify-center text-lg">
                      {config.icon}
                    </div>
                  )}
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[13px] font-semibold text-ink dark:text-screen truncate">
                      {result.title}
                    </span>
                    {result.subtitle && (
                      <span className="text-[11px] text-slate dark:text-mist truncate">
                        {result.subtitle}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-slate dark:text-mist">
              No results found for &ldquo;{searchTerm}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
