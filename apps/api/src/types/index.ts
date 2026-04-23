export type ItemType = "movie" | "music" | "game";

export type ActionType = "like" | "dislike" | "rating" | "watchlist" | "played" | "listened";

export type GenderType = "male" | "female" | "other" | "prefer_not_to_say";

export type User = {
  id: number;
  username: string;
  email: string;
  password: string;
  date: Date;
  gender: GenderType | null;
  birthYear: number | null;
  newsletter: boolean | null;
  profileImageUrl: string;
};

export type ItemType = "movie" | "music" | "game";

export type ActionType = "like" | "dislike" | "rating" | "watchlist" | "played" | "listened";

export type GenderType = "male" | "female" | "other" | "prefer_not_to_say";

export type User = {
  id: number;
  username: string;
  email: string;
  password: string;
  date: Date;
  gender: GenderType | null;
  birthYear: number | null;
  newsletter: boolean | null;
  profileImageUrl: string;
};

export type Item = {
  id: number;
  title: string;
  type: ItemType;
  metadata: Record<string, unknown> | null;
  apiId: string | null;
  createdAt: Date;
};

export type Collection = {
  id: number;
  userId: number;
  name: string;
  type: ItemType;
  createdAt: Date | null;
};

export type CollectionItem = {
  id: number;
  collectionId: number;
  apiId: string;
  title: string;
  type: ItemType;
  metadata: Record<string, unknown> | null;
  createdAt: Date | null;
};

export type Interaction = {
  userId: number;
  itemId: number;
  action: ActionType;
  score: number | null;
  createdAt: Date;
};

export type ConversationType = "direct" | "group";

export type MessageType = "text" | "image" | "file";

export type ChatMember = {
  id: number;
  username: string;
  profileImageUrl: string;
};

export type ChatConversation = {
  id: number;
  type: ConversationType;
  name: string | null;
  updatedAt: Date | null;
  members: ChatMember[];
};

export type ChatMessage = {
  id: number;
  conversationId: number;
  senderId: number;
  senderUsername: string;
  content: string;
  type: MessageType;
  createdAt: Date;
};
