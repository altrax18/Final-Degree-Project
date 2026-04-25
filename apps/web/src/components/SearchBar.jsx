import { useState, useEffect, useRef } from "react";

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Atajo Ctrl+K para enfocar la búsqueda
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Antirrebote
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Obtener resultados
  useEffect(() => {
    if (debouncedTerm.trim().length >= 2) {
      fetch(`http://localhost:3000/api/music/search?term=${encodeURIComponent(debouncedTerm)}&limit=12`)
        .then((res) => res.json())
        .then((data) => {
          if (data.results) {
            setResults(data.results.slice(0, 12));
            setShowDropdown(data.results.length > 0);
            setHighlightedIndex(data.results.length > 0 ? 0 : -1);
          } else {
            setResults([]);
            setShowDropdown(true);
          }
        })
        .catch((err) => {
          console.error("Search error:", err);
          setResults([]);
        });
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  }, [debouncedTerm]);

  // Clic fuera para cerrar
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < results.length) {
        handleSelect(results[highlightedIndex]);
      } else if (searchTerm.trim().length > 0 && results.length > 0) {
        handleSelect(results[0]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (track) => {
    setSearchTerm(track.title);
    setShowDropdown(false);
    window.location.href = `/music/${track.id}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-1 max-w-[380px] items-center lg:max-w-[240px] xl:max-w-[380px]"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-3 flex items-center text-gray-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.3-4.3"></path>
        </svg>
      </span>
      
      <input
        ref={inputRef}
        id="global-search"
        type="search"
        value={searchTerm}
        onChange={(e) => {
           setSearchTerm(e.target.value);
           if (!showDropdown && e.target.value.trim().length >= 2) setShowDropdown(true);
        }}
        onFocus={() => {
          if (results.length > 0 || (searchTerm.trim().length >= 2 && !results.length)) {
            setShowDropdown(true);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search music..."
        autoComplete="off"
        aria-label="Global search"
        className="w-full rounded-[0.6rem] border border-white/[0.08] bg-white/[0.05] py-2 pl-10 pr-10 text-sm text-gray-100 outline-none placeholder:text-gray-600 transition-[border-color,background,box-shadow] duration-200 focus:border-indigo-500/55 focus:bg-indigo-500/[0.06] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] [&::-webkit-search-cancel-button]:hidden"
      />
      
      <kbd className="pointer-events-none absolute right-[0.65rem] rounded-[0.3rem] border border-white/[0.08] bg-white/[0.05] px-[0.35rem] py-[0.1rem] font-[inherit] text-[0.65rem] text-gray-600">
        Ctrl+K
      </kbd>

      {/* Desplegable */}
      {showDropdown && searchTerm.trim().length >= 2 && (
        <div className="absolute top-[calc(100%+0.5rem)] left-0 w-full rounded-xl border border-white/[0.08] bg-[#12121a]/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col z-[100] max-h-[400px] overflow-y-auto">
          {results.length > 0 ? (
            <div className="flex flex-col py-2">
              {results.map((result, idx) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors text-left border-none outline-none ${
                    idx === highlightedIndex ? "bg-indigo-500/20" : "bg-transparent hover:bg-white/[0.04]"
                  }`}
                >
                  <img src={result.cover} alt={result.title} className="w-10 h-10 rounded object-cover shadow-[0_2px_8px_rgba(0,0,0,0.3)] shrink-0" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[13px] font-semibold text-white truncate">{result.title}</span>
                    <span className="text-[11px] text-zinc-400 truncate">{result.artist}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
             <div className="px-4 py-6 text-center text-sm text-zinc-500">
                No results found for "{searchTerm}"
             </div>
          )}
        </div>
      )}
    </div>
  );
}
