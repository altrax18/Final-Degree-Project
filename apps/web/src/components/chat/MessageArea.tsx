import { useState, useEffect, useRef } from "react";
import type { ChatMessage } from "../../hooks/useChat";

type Props = {
  userId: number;
  conversationName: string;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
};

export default function MessageArea({ userId, conversationName, messages, onSendMessage }: Props) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    onSendMessage(text);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-slate dark:text-mist mt-8">
            No messages yet. Say hi to {conversationName}!
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === userId ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                msg.senderId === userId
                  ? "bg-amethyst text-screen dark:bg-sapphire"
                  : "bg-sand text-ink dark:bg-coal dark:text-screen"
              }`}
            >
              {msg.senderId !== userId && (
                <p className="text-xs font-medium text-amethyst dark:text-electric-sky mb-1">
                  {msg.senderUsername}
                </p>
              )}
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-bone p-3 dark:border-night-edge">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-bone bg-linen px-4 py-2 text-sm text-ink outline-none placeholder:text-slate focus:border-amethyst focus:ring-1 focus:ring-amethyst dark:border-night-edge dark:bg-abyss dark:text-screen dark:placeholder:text-mist dark:focus:border-electric-sky dark:focus:ring-electric-sky"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-amethyst text-screen hover:bg-orchid disabled:opacity-40 transition-colors cursor-pointer dark:bg-sapphire dark:hover:bg-depth"
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
