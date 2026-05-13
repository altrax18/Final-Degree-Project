export interface UserCollection {
  id: number;
  userId: number;
  name: string;
  type: "movie" | "music" | "game";
  items: CollectionItem[];
  createdAt: string | Date | null;
}

export interface CollectionItem {
  id: number;
  collectionId: number;
  apiId: string;
  title: string;
  type: "movie" | "music" | "game";
  metadata?: any;
  createdAt: string | Date | null;
}
