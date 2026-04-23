import { useState } from "react";
import RegisterForm from "./RegisterForm";

export default function RegisterBtn() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-amethyst px-4 py-2 text-sm font-medium text-screen shadow-lg hover:bg-orchid dark:bg-sapphire dark:hover:bg-depth transition-colors cursor-pointer"
        aria-label={isOpen ? "Close sign in" : "Sign in or register"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Sign in
      </button>

      {isOpen && <RegisterForm onClose={() => setIsOpen(false)} />}
    </>
  );
}
