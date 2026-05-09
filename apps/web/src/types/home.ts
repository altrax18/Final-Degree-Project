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
