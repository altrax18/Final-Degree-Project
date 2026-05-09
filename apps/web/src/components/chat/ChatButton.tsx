import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import ChatWindow from "./ChatWindow";
import { readSession } from "../../types/user";

// Squircle shape via CSS corner-shape with circular fallback
const squircleStyle: React.CSSProperties = {
  borderRadius: "50%",
  // @ts-expect-error — corner-shape is a newer CSS property not yet in TS types
  "cornerShape": "squircle",
};

export default function ChatButton() {
  // client:only="react" garantiza que esto sólo corre en el navegador,
  // por lo que localStorage está disponible en el inicializador del estado.
  const [userId] = useState<number | null>(() => readSession()?.id ?? null);
  const [isOpen, setIsOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState<number | null>(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(
    () => !!document.getElementById("footer-player"),
  );

  useEffect(() => {
    const handleOpenChat = (e: Event) => {
      const customEvent = e as CustomEvent<{ targetUserId: number }>;
      setTargetUserId(customEvent.detail.targetUserId);
      setIsOpen(true);
    };
    window.addEventListener("open-chat", handleOpenChat);
    return () => window.removeEventListener("open-chat", handleOpenChat);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ id: string | null }>).detail;
      setIsPlayerVisible(detail.id != null);
    };
    window.addEventListener("player-state", handler);
    return () => window.removeEventListener("player-state", handler);
  }, []);

  if (!userId) return null;

  const btnBottom = isPlayerVisible ? "bottom-[104px]" : "bottom-6";

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={squircleStyle}
        className={`fixed ${btnBottom} right-6 z-[110] flex h-14 w-14 items-center justify-center bg-amethyst text-screen shadow-lg hover:bg-orchid dark:bg-sapphire dark:hover:bg-depth transition-[bottom] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer`}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <Icon
          icon={isOpen ? "tabler:x" : "tabler:message-circle"}
          className="h-6 w-6 transition-transform duration-300"
        />
      </button>

      {isOpen && (
        <ChatWindow
          userId={userId}
          playerVisible={isPlayerVisible}
          initialTargetUserId={targetUserId}
          onClose={() => {
            setIsOpen(false);
            setTargetUserId(null);
          }}
        />
      )}
    </>
  );
}
