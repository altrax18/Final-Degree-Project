import type { TrendingItem } from "../../../types/home";

export type CatalogPayload<T> = T[] | { items?: T[] } | null | undefined;

export type PlayerTrackInput = TrendingItem;

export type HomeFeatureItem = {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  image: string;
  href: string;
  meta: string;
  onClick?: () => void;
};

export type HomeRailItem = {
  id: string;
  title: string;
  image: string;
  meta: string;
  href: string;
};

export type HomeRail = {
  title: string;
  href: string;
  items: HomeRailItem[];
};

export const fallbackCover =
  "https://placehold.co/720x920/0A0A0A/FFFFFF?text=Alexandria";

export const fallbackBackdrop =
  "https://placehold.co/1440x900/0A0A0A/FFFFFF?text=Alexandria";

export const formatRating = (value: number) =>
  Number.isFinite(value) ? value.toFixed(1) : "0.0";

export const normalizeCatalog = <T>(payload: CatalogPayload<T>): T[] => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.items)) return payload.items;
  return [];
};

export const toPlayerTrack = (track: PlayerTrackInput) => ({
  id: track.id,
  title: track.title,
  artist: track.artist,
  cover: track.cover ?? null,
  previewUrl: track.previewUrl ?? null,
  genre: track.genre,
});

export const createTrackPlayback = (track: PlayerTrackInput) => {
  if (!track.previewUrl) return null;

  const playerTrack = toPlayerTrack(track);

  return {
    track: playerTrack,
    queue: [playerTrack],
  };
};

export const getReleaseYear = (value: number | null) => {
  if (!value) return null;

  const date = new Date(value * 1000);
  const year = date.getUTCFullYear();

  return Number.isFinite(year) ? String(year) : null;
};
