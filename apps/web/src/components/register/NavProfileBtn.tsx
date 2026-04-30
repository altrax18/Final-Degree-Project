import { useState } from "react";
import { Icon } from "@iconify/react";
import RegisterForm from "./RegisterForm";

type Props = {
  mobile?: boolean;
};

export default function NavProfileBtn({ mobile = false }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {mobile ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-[0.6rem] w-full rounded-lg px-3 py-[0.65rem] text-[0.9rem] font-medium text-slate dark:text-mist transition-[color,background] duration-150 hover:bg-sand dark:hover:bg-coal hover:text-ink dark:hover:text-screen cursor-pointer border-none bg-transparent text-left"
        >
          <Icon icon="tabler:user-circle" width={18} height={18} aria-hidden="true" />
          Sign in / Register
        </button>
      ) : (
        <div className="relative">
          <button
            aria-label="Sign in or register"
            onClick={() => setIsOpen((v) => !v)}
            className="flex shrink-0 items-center justify-center w-[38px] h-[38px] rounded-full border border-bone dark:border-night-edge bg-sand dark:bg-coal text-slate dark:text-mist cursor-pointer transition-[color,background,border-color,transform] duration-[180ms] hover:border-amethyst dark:hover:border-electric-sky hover:bg-lilac-mist dark:hover:bg-depth hover:text-ink dark:hover:text-screen hover:scale-[1.08]"
          >
            <Icon icon="tabler:user-circle" width={22} height={22} aria-hidden="true" />
          </button>

          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute top-full right-0 mt-2 z-50 w-80">
                <RegisterForm dropdown onClose={() => setIsOpen(false)} />
              </div>
            </>
          )}
        </div>
      )}

      {/* Mobile: full-screen modal */}
      {mobile && isOpen && <RegisterForm onClose={() => setIsOpen(false)} />}
    </>
  );
}
