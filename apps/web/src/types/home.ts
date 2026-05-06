// Tipos compartidos para la home (concepto: contratos de datos).
export type TrendingItem = {
  id: string;
  title: string;
  type: "music" | "movie" | "game";
  artist?: string;
  cover?: string | null;
  previewUrl?: string | null;
  genre?: string;
};

// Modelo de publicacion para el feed social (concepto: tipado estructural).
export type RecentPost = {
  id: string;
  author: string;
  handle: string;
  time: string;
  headline: string;
  summary: string;
  tags: string[];
  // Ruta del detalle para navegar desde la home (concepto: enlace de entidad).
  href: string;
  cover?: string | null;
};
