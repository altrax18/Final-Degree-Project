import { useState, useEffect, useCallback } from "react";

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

const API_URL =
  (import.meta.env.PUBLIC_API_URL as string | undefined) ?? "";

export function useChat(userId: number) {
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<Record<number, ChatMessage[]>>({});

  useEffect(() => {
    fetch(`${API_URL}/api/chat/conversations/${userId}`)
      .then((res) => res.json())
      .then((data) => setConversations(data));
  }, [userId]);

  useEffect(() => {
    const es = new EventSource(`${API_URL}/api/chat/sse?userId=${userId}`);

    es.onopen = () => setIsConnected(true);

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "new_message") {
        const msg = data.message as ChatMessage;
        setMessages((prev) => ({
          ...prev,
          [msg.conversationId]: [...(prev[msg.conversationId] || []), msg],
        }));
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

    await fetch(`${API_URL}/api/chat/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, senderId: userId, content }),
    });
  }, [userId]);

  const fetchMessages = useCallback(async (conversationId: number) => {
    const res = await fetch(`${API_URL}/api/chat/messages/${conversationId}`);
    const msgs = await res.json();
    setMessages((prev) => ({ ...prev, [conversationId]: msgs }));
  }, []);

  const markRead = useCallback((conversationId: number) => {
    fetch(`${API_URL}/api/chat/mark-read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, userId }),
    });
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  }, [userId]);

  const startConversation = useCallback(async (targetUserId: number): Promise<number> => {
    const existing = conversations.find(
      (c) => c.type === "direct" && c.members.some((m) => m.id === targetUserId)
    );
    if (existing) return existing.id;

    const res = await fetch(`${API_URL}/api/chat/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "direct", memberIds: [userId, targetUserId] }),
    });
    const conv = await res.json();

    const convsRes = await fetch(`${API_URL}/api/chat/conversations/${userId}`);
    const convs = await convsRes.json();
    setConversations(convs);

    return conv.id;
  }, [conversations, userId]);

  return { conversations, messages, sendMessage, subscribe, fetchMessages, markRead, startConversation, isConnected };
}
