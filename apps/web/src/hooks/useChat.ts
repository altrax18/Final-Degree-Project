import { useState, useEffect, useCallback, useRef } from "react";

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

const API_URL = "http://localhost:3000";
const WS_URL = "ws://localhost:3000";

export function useChat(userId: number) {
  const wsRef = useRef<WebSocket | null>(null);
  const subscribedRef = useRef<Set<number>>(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<Record<number, ChatMessage[]>>({});

  useEffect(() => {
    fetch(`${API_URL}/chat/conversations/${userId}`)
      .then((res) => res.json())
      .then((data) => setConversations(data));
  }, [userId]);

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/chat/ws?userId=${userId}`);

    ws.onopen = () => {
      wsRef.current = ws;
      subscribedRef.current.clear();
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "new_message") {
        const msg = data.message as ChatMessage;
        setMessages((prev) => ({
          ...prev,
          [msg.conversationId]: [...(prev[msg.conversationId] || []), msg],
        }));
        // Increment unread count for messages sent by others
        if (msg.senderId !== userId) {
          setConversations((prev) =>
            prev.map((c) =>
              c.id === msg.conversationId ? { ...c, unreadCount: c.unreadCount + 1 } : c
            )
          );
        }
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
      setIsConnected(false);
    };

    return () => ws.close();
  }, [userId]);

  // Subscribe to all conversations once connected
  useEffect(() => {
    if (!isConnected || conversations.length === 0) return;
    for (const conv of conversations) {
      if (!subscribedRef.current.has(conv.id)) {
        subscribedRef.current.add(conv.id);
        wsRef.current?.send(JSON.stringify({ type: "subscribe", conversationId: conv.id }));
      }
    }
  }, [isConnected, conversations]);

  const subscribe = useCallback((conversationId: number) => {
    if (subscribedRef.current.has(conversationId)) return;
    subscribedRef.current.add(conversationId);
    wsRef.current?.send(JSON.stringify({ type: "subscribe", conversationId }));
  }, []);

  const sendMessage = useCallback((conversationId: number, content: string) => {
    wsRef.current?.send(JSON.stringify({ type: "send_message", conversationId, content }));
  }, []);

  const fetchMessages = useCallback(async (conversationId: number) => {
    const res = await fetch(`${API_URL}/chat/messages/${conversationId}`);
    const msgs = await res.json();
    setMessages((prev) => ({ ...prev, [conversationId]: msgs }));
  }, []);

  const markRead = useCallback((conversationId: number) => {
    wsRef.current?.send(JSON.stringify({ type: "mark_read", conversationId }));
    // Reset unread count locally so the badge disappears immediately
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  }, []);

  const startConversation = useCallback(async (targetUserId: number): Promise<number> => {
    const existing = conversations.find(
      (c) => c.type === "direct" && c.members.some((m) => m.id === targetUserId)
    );
    if (existing) return existing.id;

    const res = await fetch(`${API_URL}/chat/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "direct", memberIds: [userId, targetUserId] }),
    });
    const conv = await res.json();

    // Refrescar la lista de conversaciones
    const convsRes = await fetch(`${API_URL}/chat/conversations/${userId}`);
    const convs = await convsRes.json();
    setConversations(convs);

    return conv.id;
  }, [conversations, userId]);

  return { conversations, messages, sendMessage, subscribe, fetchMessages, markRead, startConversation, isConnected };
}
