import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

export type ChatMember = {
  id: number;
  username: string;
  profileImageUrl: string;
};

export type ChatConversation = {
  id: number;
  type: "direct" | "group";
  name: string | null;
  updatedAt: string | null;
  unreadCount: number;
  members: ChatMember[];
};

export type ChatMessage = {
  id: number;
  conversationId: number;
  senderId: number;
  senderUsername: string;
  content: string;
  type: string;
  createdAt: string;
};

const API_URL = ((import.meta.env.PUBLIC_API_URL as string | undefined) ?? "").replace(/\/api\/?$/, "");

export function useChat(userId: number) {
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<Record<number, ChatMessage[]>>({});

  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await api.api.chat.conversations({ userId: String(userId) }).get();
      if (data) setConversations(data as ChatConversation[]);
    } catch (err) {
      // silent fail
    }
  }, [userId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    const lastIdKey = `chat_last_id_${userId}`;
    const storedLastId = sessionStorage.getItem(lastIdKey) ?? "0";
    const es = new EventSource(
      `${API_URL}/api/chat/sse?userId=${userId}&lastId=${storedLastId}`,
    );

    es.onopen = () => setIsConnected(true);

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "new_message") {
        const msg = data.message as ChatMessage;

        // Persist the highest seen ID so reconnects don't re-deliver old messages
        const current = Number(sessionStorage.getItem(lastIdKey) ?? "0");
        if (msg.id > current) sessionStorage.setItem(lastIdKey, String(msg.id));

        // Deduplicate: skip if already present (guards against fetchMessages race)
        setMessages((prev) => {
          const existing = prev[msg.conversationId] || [];
          if (existing.some((m) => m.id === msg.id)) return prev;
          return { ...prev, [msg.conversationId]: [...existing, msg] };
        });

        if (msg.senderId !== userId) {
          setConversations((prev) =>
            prev.map((c) =>
              c.id === msg.conversationId ? { ...c, unreadCount: c.unreadCount + 1 } : c
            )
          );
        }
      }
    };

    es.onerror = () => setIsConnected(false);

    return () => es.close();
  }, [userId]);

  // No-op: SSE streams all conversations for the user automatically
  const subscribe = useCallback((_conversationId: number) => {}, []);

  const sendMessage = useCallback(async (conversationId: number, content: string) => {
    const optimistic: ChatMessage = {
      id: Date.now(),
      conversationId,
      senderId: userId,
      senderUsername: "",
      content,
      type: "text",
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), optimistic],
    }));

    try {
      await api.api.chat.messages.post({ conversationId, senderId: userId, content });
    } catch (err) {
      // Error silenciado
    }
  }, [userId]);

  const fetchMessages = useCallback(async (conversationId: number) => {
    try {
      const { data } = await api.api.chat.messages({ conversationId: String(conversationId) }).get();
      const msgs = (data as ChatMessage[]) || [];

      // Advance lastId so SSE won't re-deliver these on next reconnect
      if (msgs.length > 0) {
        const lastIdKey = `chat_last_id_${userId}`;
        const maxId = Math.max(...msgs.map((m) => m.id));
        const current = Number(sessionStorage.getItem(lastIdKey) ?? "0");
        if (maxId > current) sessionStorage.setItem(lastIdKey, String(maxId));
      }

      setMessages((prev) => ({ ...prev, [conversationId]: msgs }));
    } catch (err) {
      // silent fail
    }
  }, [userId]);

  const markRead = useCallback(async (conversationId: number) => {
    try {
      await api.api.chat["mark-read"].post({ conversationId, userId });
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
      );
    } catch (err) {
      // silent
    }
  }, [userId]);

  const startConversation = useCallback(async (targetUserId: number): Promise<number> => {
    const existing = conversations.find(
      (c) => c.type === "direct" && c.members.some((m) => m.id === targetUserId)
    );
    if (existing) return existing.id;

    try {
      const { data } = await api.api.chat.conversations.post({
        type: "direct",
        memberIds: [userId, targetUserId]
      });
      const conv = data as any;

      await fetchConversations();

      return conv.id;
    } catch (err) {
      return -1;
    }
  }, [conversations, userId, fetchConversations]);

  return { conversations, messages, sendMessage, subscribe, fetchMessages, markRead, startConversation, isConnected };
}
