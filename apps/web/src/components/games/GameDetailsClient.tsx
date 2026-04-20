// apps/web/src/components/games/GameDetailsClient.tsx
import { useState } from "react";
import type { Game } from "../../types/game";

interface Props {
  game: Game;
}

export default function GameDetailsClient({ game }: Props) {
  // CONCEPTO: Formateo de Fechas Nativo (Intl.DateTimeFormat)
  // QUÉ HACE: Convierte el Timestamp UNIX de IGDB a una fecha legible (ej. "14 de marzo de 2024").
  // POR QUÉ LO USO: Es una API nativa del navegador, no requiere librerías pesadas como moment.js y se adapta automáticamente al idioma.
  // DOCUMENTACIÓN: https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
  const releaseDate = game.firstReleaseDate
    ? new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(new Date(game.firstReleaseDate * 1000))
    : "Fecha desconocida";

  const heroBackground = game.screenshots && game.screenshots.length > 0 
    ? game.screenshots[0] 
    : game.image;

  return (
    <article className="min-h-screen bg-[#0a0a0a] text-white w-full">
      {/* 1. HERO SECTION (Cabecera Visual) */}
      {/* CONCEPTO: Hero Pattern con Máscaras de Gradiente
          QUÉ HACE: Pone una imagen grande de fondo y usa degradados de negro a transparente para fundirla con el resto de la página.
          POR QUÉ LO USO: Es el estándar de diseño actual (Spotify, Netflix, Steam) para dar inmersión visual sin sacrificar legibilidad del texto.
          DOCUMENTACIÓN: https://tailwindcss.com/docs/background-image#linear-gradients */}
      <div className="relative w-full h-[50vh] md:h-[60vh] flex items-end justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mask-image-gradient"
          style={{ backgroundImage: `url(${heroBackground})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pb-10 flex flex-col md:flex-row items-end gap-8">
          {/* Portada */}
          <div className="w-48 md:w-64 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 shadow-black/50 transform md:translate-y-16">
            <img src={game.image || ""} alt={game.title} className="w-full h-auto object-cover aspect-[3/4]" />
          </div>
          
          {/* Título y Metadatos Rápidos */}
          <div className="flex-1 pb-4">
            <p className="text-blue-400 font-semibold tracking-widest uppercase text-xs mb-2">{game.developer}</p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 drop-shadow-lg">{game.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-300">
              <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                ⭐ <span className="text-white font-bold">{game.rating}</span> / 100
              </span>
              <span className="bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">📅 {releaseDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CONTENIDO PRINCIPAL (Grid 2 Columnas) */}
      <div className="w-full max-w-7xl mx-auto px-4 py-16 md:py-24 mt-8">
        {/* CONCEPTO: CSS Grid para Layout Asimétrico
            QUÉ HACE: Divide la pantalla en 3 fracciones: 2 para el resumen (izquierda) y 1 para la ficha técnica (derecha).
            POR QUÉ LO USO: Es perfecto para artículos o detalles de productos, guiando la lectura hacia el texto principal y dejando los metadatos como barra lateral.
            DOCUMENTACIÓN: https://tailwindcss.com/docs/grid-template-columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Columna Izquierda: Historia y Detalles */}
          <div className="lg:col-span-2 space-y-10">
            <section>
              <h2 className="text-2xl font-bold mb-4 border-b border-white/10 pb-2">Acerca del juego</h2>
              <p className="text-gray-300 leading-relaxed text-lg">{game.summary}</p>
              {game.storyline && (
                <div className="mt-6 p-6 bg-white/5 rounded-xl border border-white/10 italic text-gray-400">
                  "{game.storyline}"
                </div>
              )}
            </section>

            {/* Capturas de Pantalla */}
            {game.screenshots && game.screenshots.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4 border-b border-white/10 pb-2">Galería</h2>
                <div className="grid grid-cols-2 gap-4">
                  {game.screenshots.slice(0, 4).map((shot, idx) => (
                    <img key={idx} src={shot} alt={`Captura ${idx + 1}`} className="rounded-lg object-cover w-full aspect-video hover:opacity-80 transition cursor-pointer border border-white/5" />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Columna Derecha: Ficha Técnica */}
          <aside className="space-y-8 bg-[#121212] p-6 rounded-2xl border border-white/5 h-fit">
            <div>
              <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-3 font-bold">Plataformas</h3>
              <div className="flex flex-wrap gap-2">
                {game.platforms.map(p => (
                  <span key={p} className="px-3 py-1 bg-white/10 text-sm rounded-md text-gray-200">{p}</span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-3 font-bold">Géneros</h3>
              <div className="flex flex-wrap gap-2">
                {game.genres.map(g => (
                  <span key={g} className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-md border border-blue-500/30">{g}</span>
                ))}
              </div>
            </div>
            
            {/* Botón de Llamada a la Acción (CTA) */}
            <button className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              + Añadir a Mi Colección
            </button>
          </aside>
        </div>

        {/* 3. SECCIÓN DE COMUNIDAD / COMENTARIOS */}
        <div className="mt-20 pt-10 border-t border-white/10">
          <h2 className="text-3xl font-black mb-2">Comunidad</h2>
          <p className="text-gray-400 mb-8">¿Qué opina la red de Alexandria sobre {game.title}?</p>
          
          {/* CONCEPTO: Componente Placeholder (Skeleton de Integración)
              QUÉ HACE: Crea la estructura visual de un área de comentarios lista para que el equipo backend la conecte a la base de datos real.
              POR QUÉ LO USO: Permite avanzar con el frontend y demostrar el flujo de la UX sin bloquearse esperando a que la tabla de comentarios en PostgreSQL/Drizzle esté terminada.
              DOCUMENTACIÓN: https://uxdesign.cc/everything-you-need-to-know-about-skeleton-screens-69f201083e95 */}
          <div className="bg-[#121212] p-6 rounded-2xl border border-white/5">
            {/* Input para comentar */}
            <div className="flex gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                TÚ
              </div>
              <div className="flex-1">
                <textarea 
                  className="w-full bg-[#1a1a1a] text-white p-4 rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none resize-none"
                  rows={3}
                  placeholder="Escribe un post debatiendo sobre este juego..."
                ></textarea>
                <div className="flex justify-end mt-2">
                  <button className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition">Publicar</button>
                </div>
              </div>
            </div>

            {/* Mock de Comentario de un usuario */}
            <div className="space-y-6">
              <div className="flex gap-4">
                 <img src="https://placehold.co/50x50/333/fff?text=UX" alt="Avatar" className="w-12 h-12 rounded-full" />
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-blue-400">@alexandria_user</span>
                      <span className="text-xs text-gray-500">Hace 2 horas</span>
                    </div>
                    <p className="text-gray-300">¡La dirección de arte de este juego es increíble! Alguien más atascado en el nivel 4? Necesito consejos urgentes.</p>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </article>
  );
}