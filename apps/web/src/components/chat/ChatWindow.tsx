import { useState, useEffect } from "react";
import { useChat } from "../../hooks/useChat";
import type { ChatConversation } from "../../hooks/useChat";
import ConversationList from "./ConversationList";
import MessageArea from "./MessageArea";

type Props = {
  userId: number;
  playerVisible?: boolean;
  initialTargetUserId?: number | null;
  onClose: () => void;
};

function getDisplayName(conv: ChatConversation, userId: number): string {
  if (conv.type === "direct") {
    return conv.members.find((m) => m.id !== userId)?.username ?? "Chat";
  }
  return conv.name ?? "Group";
}

function getInterlocutorImage(conv: ChatConversation, userId: number): string | null {
  if (conv.type === "direct") {
    return conv.members.find((m) => m.id !== userId)?.profileImageUrl ?? null;
  }
  return null;
}

function getInterlocutorId(conv: ChatConversation, userId: number): number | null {
  if (conv.type === "direct") {
    return conv.members.find((m) => m.id !== userId)?.id ?? null;
  }
  return null;
}

export default function ChatWindow({ userId, playerVisible = false, initialTargetUserId, onClose }: Props) {
  const { conversations, messages, sendMessage, subscribe, fetchMessages, markRead, startConversation } = useChat(userId);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);

  // Check if we need to start a conversation with the initial target user
  useEffect(() => {
    if (initialTargetUserId) {
      handleStartConversation(initialTargetUserId);
    }
  }, [initialTargetUserId]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? null;

  const handleSelect = (conversationId: number) => {
    setActiveConversationId(conversationId);
    subscribe(conversationId);
    fetchMessages(conversationId);
    markRead(conversationId);
  };

  const handleStartConversation = async (targetUserId: number) => {
    const convId = await startConversation(targetUserId);
    handleSelect(convId);
  };

  return (
    <div className={`animate-chat-enter fixed ${playerVisible ? "bottom-[176px]" : "bottom-24"} right-6 z-50 flex h-[480px] w-[360px] flex-col overflow-hidden rounded-2xl bg-parchment border border-bone shadow-[0_25px_50px_-12px_rgb(0,0,0,0.25),0_0_0_2px_rgba(217,112,50,0.2)] dark:bg-obsidian dark:border-night-edge dark:shadow-[0_25px_50px_-12px_rgb(0,0,0,0.5),0_0_0_2px_rgba(255,255,255,0.1)] transition-[bottom] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]`}>
      {/* Header */}
      <div className="flex items-center justify-between bg-sand text-ink px-4 py-3 dark:bg-coal dark:text-screen">
        <div className="flex items-center gap-2">
          {activeConversation && (
            <button
              onClick={() => setActiveConversationId(null)}
              className="hover:text-amethyst dark:hover:text-electric-sky transition-colors cursor-pointer"
              aria-label="Back to conversations"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {activeConversation ? (() => {
              const targetId = getInterlocutorId(activeConversation, userId);
              const img = getInterlocutorImage(activeConversation, userId);
              const name = getDisplayName(activeConversation, userId);

              if (targetId) {
                return (
                  <a href={`/u/${targetId}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer text-ink dark:text-screen decoration-transparent group">
                    {img && <img src={img} alt={name} className="h-7 w-7 rounded-full object-cover shrink-0" />}
                    <h2 className="text-sm font-semibold group-hover:underline">{name}</h2>
                  </a>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  {img && <img src={img} alt={name} className="h-7 w-7 rounded-full object-cover shrink-0" />}
                  <h2 className="text-sm font-semibold">{name}</h2>
                </div>
              );
            })() : (
              <h2 className="text-sm font-semibold">Messages</h2>
            )}
          {activeConversation?.type === "group" && (
            <span className="rounded-full bg-lilac-mist px-2 py-0.5 text-xs text-amethyst dark:bg-depth dark:text-electric-sky">Group</span>
          )}
        </div>
        <button
          onClick={onClose}
          className="hover:text-amethyst dark:hover:text-electric-sky transition-colors cursor-pointer"
          aria-label="Close chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden">
        {activeConversation ? (
          <MessageArea
            userId={userId}
            conversationName={getDisplayName(activeConversation, userId)}
            messages={messages[activeConversation.id] || []}
            onSendMessage={(content) => sendMessage(activeConversation.id, content)}
          />
        ) : (
          <ConversationList
            userId={userId}
            conversations={conversations}
            onSelect={handleSelect}
            onStartConversation={handleStartConversation}
          />
        )}
      </div>
    </div>
  );
}
