import { useRef } from "react";
import { DEFAULT_AVATAR } from "../../types/user";
import { Icon } from "@iconify/react";

interface Props {
  src: string;
  username: string;
  isUploading?: boolean;
  isDeleting?: boolean;
  onUpload?: (file: File) => void;
  onDelete?: () => void;
}

export default function ProfileAvatar({ src, username, isUploading, isDeleting, onUpload, onDelete }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpload) {
      fileInputRef.current?.click();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
    // Limpia el valor de la entrada de archivos para que se pueda volver a seleccionar el mismo archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const hasCustomAvatar = src && src !== DEFAULT_AVATAR;
  const isBusy = isUploading || isDeleting;

  return (
    <div className="relative shrink-0 group" style={{ width: 160, height: 160 }}>
      <img
        src={src || DEFAULT_AVATAR}
        alt={`Avatar de ${username}`}
        className="w-full h-full rounded-full object-cover"
        style={{
          boxShadow: "0 4px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      />
      {/* Input oculto para seleccionar archivo */}
      <input
        type="file"
        accept="image/jpeg, image/png, image/webp"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Overlay — acciones de avatar */}
      <div
        className={`absolute inset-0 rounded-full flex items-center justify-center gap-4
                   bg-black/60 transition-opacity duration-300
                   ${isBusy ? "opacity-100 cursor-wait" : "opacity-0 group-hover:opacity-100"}`}
      >
        {isBusy ? (
          <div className="flex flex-col items-center gap-1">
            <Icon icon="tabler:loader" className="w-7 h-7 text-white/70 animate-spin" />
            <span className="text-[0.65rem] font-semibold text-white/60 uppercase tracking-wide">
              {isUploading ? "Subiendo..." : "Borrando..."}
            </span>
          </div>
        ) : (
          <>
            <button
              onClick={handleUploadClick}
              title="Cambiar imagen"
              className="flex flex-col items-center gap-1 p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white cursor-pointer"
            >
              <Icon icon="tabler:upload" className="w-6 h-6" />
              <span className="text-[0.6rem] font-semibold uppercase tracking-wide">
                Cambiar
              </span>
            </button>
            {hasCustomAvatar && (
              <button
                onClick={handleDeleteClick}
                title="Eliminar imagen"
                className="flex flex-col items-center gap-1 p-2 rounded-full hover:bg-red-500/20 transition-colors text-red-400 hover:text-red-300 cursor-pointer"
              >
                <Icon icon="tabler:trash" className="w-6 h-6" />
                <span className="text-[0.6rem] font-semibold uppercase tracking-wide">
                  Borrar
                </span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
