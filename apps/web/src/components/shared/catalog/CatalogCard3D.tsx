import { memo, useState } from "react";
import type { MouseEvent } from "react";

export interface CatalogCardItem {
  id: string;
  title: string;
  image: string | null;
  rating: number;
  genres: string[];
}

interface CatalogCard3DProps {
  item: CatalogCardItem;
}

function CatalogCard3D({ item }: CatalogCard3DProps) {
  // CONCEPTO: Estado Local de Interacción
  // QUE HACE: Guarda la transformación 3D y el estado hover de la tarjeta.
  // POR QUE LO USO: El efecto visual es propio de la card y no necesita vivir en Zustand.
  // DOCUMENTACION: https://react.dev/reference/react/useState
  const [transform, setTransform] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  // CONCEPTO: Lectura de Coordenadas del Mouse
  // QUE HACE: Convierte la posición del puntero en valores de rotación X/Y.
  // POR QUE LO USO: Genera un efecto tilt más natural y reutilizable.
  // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
    );
  };

  // CONCEPTO: Reset de Interacción
  // QUE HACE: Vuelve a la transformación base cuando el cursor sale.
  // POR QUE LO USO: Evita que la tarjeta quede “girada” después del hover.
  // DOCUMENTACION: https://react.dev/learn/responding-to-events
  const handleMouseLeave = () => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setIsHovered(false);
  };

  return (
    // CONCEPTO: Contenedor Interactivo 3D
    // QUE HACE: Pinta la tarjeta con perspectiva y sombras para destacar el hover.
    // POR QUE LO USO: Centraliza el patrón visual compartido por juegos y películas.
    // DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/perspective
    <div
      className="relative group cursor-pointer w-full aspect-[3/4] rounded-xl transition-all duration-200 ease-out shadow-lg"
      style={{ transform, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* CONCEPTO: Capa de Resplandor
          QUE HACE: Usa la portada como fondo difuminado para dar profundidad.
          POR QUE LO USO: Añade jerarquía visual sin cambiar la estructura del contenido.
          DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/CSS/filter */}
      <div
        className="absolute inset-0 rounded-xl bg-cover bg-center blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 z-0"
        style={{ backgroundImage: item.image ? `url(${item.image})` : "none" }}
      />

      {/* CONCEPTO: Superposición de Poster
          QUE HACE: Encierra la imagen principal, el degradado y la información de la card.
          POR QUE LO USO: Separa la parte visual compartida del comportamiento interactivo.
          DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/CSS/position */}
      <div className="absolute inset-0 rounded-xl overflow-hidden border border-bone dark:border-night-edge bg-sand dark:bg-coal z-10">
        {/* CONCEPTO: Fallback de Imagen
            QUE HACE: Usa una imagen genérica si el catálogo no trae portada.
            POR QUE LO USO: Mantiene consistencia visual incluso con datos incompletos.
            DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR */}
        <img
          src={item.image || "https://placehold.co/300x400/1a1a1a/ffffff?text=No+Cover"}
          alt={`Portada de ${item.title}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* CONCEPTO: Degradado de Legibilidad
            QUE HACE: Oscurece la parte inferior para que el título y los géneros se lean mejor.
            POR QUE LO USO: Evita perder contraste sobre imágenes brillantes.
            DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/CSS/gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80" />

        {/* CONCEPTO: Badge de Rating
            QUE HACE: Muestra la valoración del item en una esquina fija.
            POR QUE LO USO: Da una señal rápida de relevancia sin ocupar espacio grande.
            DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/span */}
        <div className="absolute top-3 right-3 bg-blue-600 text-white font-bold text-xs px-2 py-1 rounded-md shadow-md backdrop-blur-md">
          {item.rating}
        </div>

        {/* CONCEPTO: Animación de Contenido Contextual
            QUE HACE: Desplaza el bloque inferior según el hover para revelar más información.
            POR QUE LO USO: Mantiene la card compacta en reposo y rica en detalle al interactuar.
            DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/CSS/transition */}
        <div
          className={`absolute inset-x-0 bottom-0 p-4 transform transition-transform duration-300 ${
            isHovered ? "translate-y-0" : "translate-y-4"
          }`}
        >
          {/* CONCEPTO: Jerarquía Tipográfica
              QUE HACE: Presenta el título como información primaria del item.
              POR QUE LO USO: Ayuda a identificar la tarjeta de un vistazo.
              DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements */}
          <h3 className="text-white font-bold text-lg leading-tight mb-1 drop-shadow-md">
            {item.title}
          </h3>

          {/* CONCEPTO: Renderizado Limitado de Géneros
              QUE HACE: Muestra solo los dos primeros géneros para no saturar la tarjeta.
              POR QUE LO USO: El patrón compartido debe seguir siendo legible en grillas densas.
              DOCUMENTACION: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice */}
          <div className="flex flex-wrap gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
            {item.genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="text-[10px] uppercase font-semibold text-gray-300 bg-white/10 px-2 py-0.5 rounded-sm"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(CatalogCard3D);