// CONCEPTO: Data Transfer Object (DTO)
// QUE HACE: Define el contrato de una pelicula que comparte API y UI.
// POR QUE LO USO: Mantiene tipado fuerte y evita inconsistencias entre backend y frontend.
// DOCUMENTACION: https://www.typescriptlang.org/docs/handbook/interfaces.html
export interface Movie {
  id: string;
  title: string;
  type: "movie";
  image: string | null;
  backdrop?: string | null;
  rating: number;
  voteCount?: number;
  firstReleaseDate: number | null;
  originalTitle?: string;
  tagline?: string | null;
  runtime?: number | null;
  status?: string;
  spokenLanguages?: string[];
  budget?: number | null;
  revenue?: number | null;
  homepage?: string | null;
  imdbId?: string | null;
  director?: string;
  productionCompanies?: string[];
  productionCountries?: string[];
  trailer?: {
    key: string;
    title: string;
    site: string;
    type: string;
    official: boolean;
  } | null;
  cast?: Array<{
    name: string;
    character: string;
    profile: string | null;
  }>;
  summary: string;
  genres: string[];
}
