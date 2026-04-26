import { useState } from "react";
import { useChat } from "../../hooks/useChat";
import type { ChatConversation } from "../../hooks/useChat";
import ConversationList from "./ConversationList";
import MessageArea from "./MessageArea";

type Props = {
  userId: number;
  onClose: () => void;
};

function getDisplayName(conv: ChatConversation, userId: number): string {
  if (conv.type === "direct") {
    return conv.members.find((m) => m.id !== userId)?.username ?? "Chat";
  }
  return conv.name ?? "Group";
}

export default function ChatWindow({ userId, onClose }: Props) {
  const { conversations, messages, sendMessage, subscribe, fetchMessages } = useChat(userId);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? null;

  const handleSelect = (conversationId: number) => {
    setActiveConversationId(conversationId);
    subscribe(conversationId);
    fetchMessages(conversationId);
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 flex h-[480px] w-[360px] flex-col overflow-hidden rounded-2xl bg-parchment border border-bone shadow-2xl dark:bg-obsidian dark:border-night-edge">
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
          <h2 className="text-sm font-semibold">
            {activeConversation ? getDisplayName(activeConversation, userId) : "Messages"}
          </h2>
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
          />
        )}
      </div>
    </div>
  );
}
