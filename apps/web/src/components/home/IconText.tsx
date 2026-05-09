// COMPONENTE UTILITARIO: IconText
// QUE HACE: Renderiza icono + texto con layout consistente.
// POR QUE: Evita duplicar marcados de icono en todo el Home.
// DOCUMENTACION: https://react.dev/reference/react-dom/components/svg

export type IconName =
  | "tabler:stack-2"
  | "tabler:messages"
  | "tabler:hash"
  | "tabler:vinyl"
  | "tabler:movie"
  | "tabler:device-gamepad-2"
  | "tabler:users-group"
  | "tabler:radio"
  | "tabler:message"
  | "tabler:heart"
  | "tabler:heart-filled"
  | "tabler:bookmark"
  | "tabler:bookmark-filled"
  | "tabler:star-filled";

type Props = {
  icon: IconName;
  text: string;
  className?: string;
  iconClassName?: string;
  iconSize?: number;
};

type IconSvgProps = {
  name: IconName;
  size: number;
  className?: string;
};

function IconSvg({ name, size, className }: IconSvgProps) {
  const sharedProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    fill: "none",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (name) {
    case "tabler:stack-2":
      return (
        <svg {...sharedProps}>
          <rect x="4" y="5" width="14" height="6" rx="1.5" />
          <rect x="6" y="13" width="14" height="6" rx="1.5" />
        </svg>
      );
    case "tabler:messages":
      return (
        <svg {...sharedProps}>
          <path d="M5 7h10a4 4 0 0 1 4 4v3a4 4 0 0 1-4 4H9l-4 3v-3H5a4 4 0 0 1-4-4v-3a4 4 0 0 1 4-4z" />
        </svg>
      );
    case "tabler:hash":
      return (
        <svg {...sharedProps}>
          <path d="M9 4l-2 16" />
          <path d="M17 4l-2 16" />
          <path d="M4 9h16" />
          <path d="M3 15h16" />
        </svg>
      );
    case "tabler:vinyl":
      return (
        <svg {...sharedProps}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    case "tabler:movie":
      return (
        <svg {...sharedProps}>
          <rect x="4" y="6" width="16" height="12" rx="2" />
          <path d="M8 6v12" />
          <path d="M16 6v12" />
          <path d="M4 10h16" />
          <path d="M4 14h16" />
        </svg>
      );
    case "tabler:device-gamepad-2":
      return (
        <svg {...sharedProps}>
          <path d="M7 9h10a4 4 0 0 1 4 4l-1.1 4a2 2 0 0 1-1.9 1.5H16l-2-3h-4l-2 3H6.1a2 2 0 0 1-1.9-1.5L3 13a4 4 0 0 1 4-4z" />
          <path d="M9 12h-2m1-1v2" />
          <path d="M15.5 12h.01" />
          <path d="M17.5 12h.01" />
        </svg>
      );
    case "tabler:users-group":
      return (
        <svg {...sharedProps}>
          <circle cx="9" cy="9" r="3" />
          <circle cx="16.5" cy="10" r="2.5" />
          <path d="M4 19a5 5 0 0 1 10 0" />
          <path d="M13 19a4 4 0 0 1 7 0" />
        </svg>
      );
    case "tabler:radio":
      return (
        <svg {...sharedProps}>
          <path d="M4 7l9-3" />
          <rect x="4" y="7" width="16" height="10" rx="2" />
          <circle cx="16" cy="12" r="2" />
          <path d="M8 12h4" />
        </svg>
      );
    case "tabler:message":
      return (
        <svg {...sharedProps}>
          <path d="M5 7h14a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H9l-4 3v-3H5a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3z" />
        </svg>
      );
    case "tabler:heart":
      return (
        <svg {...sharedProps}>
          <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2a4 4 0 0 1 7 2c0 5.5-7 10-7 10z" />
        </svg>
      );
    case "tabler:heart-filled":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="none"
          className={className}
          aria-hidden="true"
        >
          <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2a4 4 0 0 1 7 2c0 5.5-7 10-7 10z" />
        </svg>
      );
    case "tabler:bookmark":
      return (
        <svg {...sharedProps}>
          <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4l-6 4V5a1 1 0 0 1 1-1z" />
        </svg>
      );
    case "tabler:bookmark-filled":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="none"
          className={className}
          aria-hidden="true"
        >
          <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4l-6 4V5a1 1 0 0 1 1-1z" />
        </svg>
      );
    case "tabler:star-filled":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="none"
          className={className}
          aria-hidden="true"
        >
          <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function IconText({
  icon,
  text,
  className,
  iconClassName,
  iconSize = 14,
}: Props) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`.trim()}>
      <IconSvg name={icon} size={iconSize} className={iconClassName} />
      <span>{text}</span>
    </span>
  );
}
