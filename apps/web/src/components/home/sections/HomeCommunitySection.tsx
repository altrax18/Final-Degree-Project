import { motion } from "framer-motion";
import IconText from "../IconText";
import { useEffect, useState } from "react";

export type RecentReview = {
  id: string | number;
  content: string;
  rating: number; // del 1 al 5 (adaptado al componente review)
  createdAt: string | Date;
  user?: {
    username?: string;
    profileImageUrl?: string | null;
  };
  itemType?: "movie" | "game" | "music";
  itemApiId?: string | number;
  media?: {
    title?: string;
    type?: string;
  };
};

export default function HomeCommunitySection() {
  const [reviews, setReviews] = useState<RecentReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // CONCEPTO: Client-Side Rendering (CSR) / Patrón "Isla Dinámica"
    // QUE HACE: Solicita las reseñas recientes desde el cliente al montarse el componente, de forma asíncrona.
    // POR QUE LO USO: La actividad de la comunidad cambia constantemente; incrustarla estáticamente en el servidor (SSG) mostraría datos viejos.
    fetch("/recent-reviews")
      .then((res) => res.json())
      .then((data) => {
        setReviews(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-ink dark:text-screen">
          Actividad de la comunidad
        </h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[200px] rounded-xl bg-bone/40 dark:bg-night-edge/40 animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-bone bg-linen/50 p-8 text-center dark:border-night-edge dark:bg-obsidian/50">
          <p className="text-sm font-semibold text-ink dark:text-screen">
            Aún no hay actividad reciente
          </p>
          <p className="mt-1 text-xs text-slate dark:text-mist">
            Las reseñas de la comunidad aparecerán aquí. Sé el primero en opinar sobre el catálogo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reviews.slice(0, 3).map((review, index) => {
            const href = review.itemType && review.itemApiId
              ? `/${review.itemType === "movie" ? "movies" : review.itemType === "game" ? "games" : "music"}/${review.itemApiId}`
              : undefined;

            return (
              <motion.a
                key={review.id}
                href={href}
                aria-label={`Ver reseña de ${review.user?.username || "usuario"} sobre ${review.media?.title || "este elemento"}`}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
                className="group flex cursor-pointer flex-col justify-between rounded-xl border border-bone bg-linen p-5 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-amethyst hover:shadow-xl dark:border-night-edge dark:bg-obsidian dark:hover:border-electric-sky active:scale-[0.98]"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.user?.profileImageUrl || "https://placehold.co/150x150/0A0A0A/FFFFFF?text=U"}
                      alt={review.user?.username || "Usuario"}
                      className="h-10 w-10 rounded-full border border-screen/20 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold leading-tight text-ink dark:text-screen">
                        {review.user?.username || "Usuario anónimo"}
                      </p>
                      <p className="mt-0.5 text-[0.65rem] uppercase tracking-wider text-slate dark:text-mist">
                        escribió una reseña
                      </p>
                    </div>
                  </div>
                  <p className="line-clamp-2 text-xs leading-relaxed text-slate dark:text-mist">
                    Sobre <span className="font-semibold text-ink dark:text-screen">{
                      review.media?.title ||
                      (review.itemType === "movie" ? "una película" :
                        review.itemType === "game" ? "un juego" :
                          review.itemType === "music" ? "un álbum" :
                            "un elemento del catálogo")
                    }</span>
                  </p>
                  <p className="line-clamp-4 text-sm italic leading-relaxed text-ink/80 dark:text-screen/80">
                    "{review.content}"
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-bone pt-3 transition-colors group-hover:border-amethyst/30 dark:border-night-edge dark:group-hover:border-electric-sky/30">
                  <IconText icon="tabler:star-filled" text={`${review.rating || 0}/5`} className="text-xs font-semibold text-amethyst dark:text-electric-sky" iconSize={16} />
                  <span className="text-[0.65rem] font-semibold text-slate transition-colors group-hover:text-amethyst dark:text-mist dark:group-hover:text-electric-sky">Ver reseña &rarr;</span>
                </div>
              </motion.a>
            );
          })}
        </div>
      )}
    </section>
  );
}