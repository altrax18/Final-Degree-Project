import type { RecentPost } from "../types/home";

// Mock centralizado para la home.
// QUE ES: feed inicial, circulos y pulso social del Home.
// QUE FALTA: sustituir por endpoint real de posts/actividad cuando exista backend persistente.
// Los enlaces apuntan a rutas reales del catalogo para navegar desde la home.
const recentPostsMock: RecentPost[] = [
  {
    id: "post-1",
    author: "Alex R.",
    handle: "@alexr",
    time: "18 min",
    headline: "Finalizando el nuevo diseno del estudio",
    summary:
      "Un vistazo al moodboard, la iluminacion y la musica que mantiene la energia alta.",
    tags: ["diseno", "setup", "flujo"],
    href: "/movies",
    cover:
      "https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: "post-2",
    author: "Maya S.",
    handle: "@mayas",
    time: "7 min",
    headline: "Bandas sonoras que definen mundos sci-fi",
    summary:
      "Recolectando momentos sonoros que influyen el tono visual de una escena.",
    tags: ["musica", "cine", "sonido"],
    href: "/music",
  },
  {
    id: "post-3",
    author: "Jon A.",
    handle: "@jona",
    time: "1 h",
    headline: "Construyendo un backlog cozy RPG",
    summary:
      "Lista corta de aventuras relajadas con gran direccion artistica y mods.",
    tags: ["juegos", "rpg", "comunidad"],
    href: "/games",
    cover:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: "post-4",
    author: "Jules K.",
    handle: "@julesk",
    time: "2 h",
    headline: "Lanzamientos indie para mirar este mes",
    summary:
      "Cinco releases con mecanicas experimentales y grandes soundtracks.",
    tags: ["indie", "descubrir", "lanzamientos"],
    href: "/games",
  },
  {
    id: "post-5",
    author: "Kara T.",
    handle: "@karat",
    time: "3 h",
    headline: "Curando una playlist synthwave",
    summary: "Si te gustan los skyline nocturnos, estas pistas son clave.",
    tags: ["playlist", "synth", "noche"],
    href: "/music",
    cover:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: "post-5",
    author: "Kara T.",
    handle: "@karat",
    time: "3 h",
    headline: "Curando una playlist synthwave",
    summary: "Si te gustan los skyline nocturnos, estas pistas son clave.",
    tags: ["playlist", "synth", "noche"],
    href: "/music",
    cover:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=640&q=80",
  },
];

export function getRecentPosts(): RecentPost[] {
  // TODO: Reemplazar con el endpoint real cuando exista.
  return recentPostsMock;
}
