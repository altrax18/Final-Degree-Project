import type { Game } from "../../types/game";
import SharedDetailsLayout from "../shared/details/SharedDetailsLayout";

interface Props {
  game: Game;
}

export default function GameDetailsClient({ game }: Props) {
  const releaseDate = game.firstReleaseDate
    ? new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(new Date(game.firstReleaseDate * 1000))
    : "Fecha desconocida";

  const leftColumn = (
    <>
      <section>
        <h2 className="text-2xl font-bold mb-4 border-b border-bone dark:border-night-edge pb-2">Acerca del juego</h2>
        <p className="text-slate dark:text-mist leading-relaxed text-lg">{game.summary}</p>
        {game.storyline && (
          <div className="mt-6 p-6 bg-linen dark:bg-coal rounded-xl border border-bone dark:border-night-edge italic text-slate dark:text-mist">
            "{game.storyline}"
          </div>
        )}
      </section>

      {game.screenshots && game.screenshots.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4 border-b border-bone dark:border-night-edge pb-2">Galería</h2>
          <div className="grid grid-cols-2 gap-4">
            {game.screenshots.slice(0, 4).map((shot, idx) => (
              <img key={idx} src={shot} alt={`Captura ${idx + 1}`} className="rounded-lg object-cover w-full aspect-video hover:opacity-80 transition cursor-pointer border border-bone dark:border-night-edge" />
            ))}
          </div>
        </section>
      )}
    </>
  );

  const rightColumn = (
    <>
      <div>
        <h3 className="text-sm uppercase tracking-widest text-slate dark:text-mist mb-3 font-bold">Plataformas</h3>
        <div className="flex flex-wrap gap-2">
          {game.platforms.map(p => (
            <span key={p} className="px-3 py-1 bg-linen dark:bg-night-edge text-sm rounded-md text-slate dark:text-mist">{p}</span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm uppercase tracking-widest text-slate dark:text-mist mb-3 font-bold">Géneros</h3>
        <div className="flex flex-wrap gap-2">
          {game.genres.map(g => (
            <span key={g} className="px-3 py-1 bg-sapphire/10 text-sapphire text-sm rounded-md border border-sapphire/20 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30">{g}</span>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <SharedDetailsLayout
      id={game.id}
      title={game.title}
      type="game"
      image={game.image}
      heroBackground={game.screenshots && game.screenshots.length > 0 ? game.screenshots[0] : game.image}
      heroSubtitle={game.developer || "Desconocido"}
      rating={game.rating}
      releaseDate={releaseDate}
      accentColor="blue"
      collectionMetadata={{
        image: game.image,
        rating: game.rating,
        genres: game.genres,
        developer: game.developer
      }}
      leftColumn={leftColumn}
      rightColumn={rightColumn}
    />
  );
}