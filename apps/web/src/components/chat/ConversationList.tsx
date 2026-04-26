import type { ChatConversation } from "../../hooks/useChat";

type Props = {
  userId: number;
  conversations: ChatConversation[];
  onSelect: (conversationId: number) => void;
};

export default function ConversationList({ userId, conversations, onSelect }: Props) {
  return (
    <ul className="divide-y divide-bone overflow-y-auto h-full dark:divide-night-edge">
      {conversations.map((conv) => {
        const displayName =
          conv.type === "direct"
            ? conv.members.find((m) => m.id !== userId)?.username ?? "Unknown"
            : conv.name ?? "Group";

        return (
          <li key={conv.id}>
            <button
              onClick={() => onSelect(conv.id)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-sand dark:hover:bg-coal transition-colors cursor-pointer"
            >
              {/* Avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lilac-mist text-amethyst font-semibold text-sm dark:bg-depth dark:text-electric-sky">
                {conv.type === "group" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink dark:text-screen">{displayName}</p>
                {conv.type === "group" && (
                  <p className="truncate text-xs text-slate dark:text-mist">
                    {conv.members.map((m) => m.username).join(", ")}
                  </p>
                )}
              </div>

              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate dark:text-mist" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
