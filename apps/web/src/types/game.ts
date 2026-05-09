// apps/web/src/types/game.ts
// CONCEPTO: Data Transfer Object (DTO)
// QUE HACE: Describe el contrato de datos de Game compartido por la UI.
// POR QUE LO USO: Si backend y frontend respetan este tipo, evitamos errores de integracion.
// DOCUMENTACION: https://www.typescriptlang.org/docs/handbook/interfaces.html
export interface Game {
  id: string;
  title: string;
  type: "game";
  image: string | null;
  rating: number;
  firstReleaseDate: number | null;
  summary: string;
  storyline?: string | null;
  genres: string[];
  platforms: string[];
  screenshots?: string[];
  developer?: string;
}
