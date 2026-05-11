export interface Track {
  id: string;
  title: string;
  artist: string;
  cover?: string;
  previewUrl?: string;
  genre?: string;
  album?: string;
  albumId?: string;
  duration?: number;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  cover?: string;
  genre?: string;
  releaseDate?: string;
  tracks?: Track[];
}
