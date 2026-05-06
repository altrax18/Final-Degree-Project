import { motion } from "framer-motion";
import IconText from "../IconText";
import type { RecentPost } from "../../../types/home";

// SECCION FEED
// QUE HACE: Renderiza el feed social con acciones (like, comentar, guardar).
// POR QUE: Es el nucleo de la experiencia social de Alexandria.
// DOCUMENTACION: https://react.dev/learn/conditional-rendering

type Props = {
  filteredPosts: RecentPost[];
  hasFeedPosts: boolean;
  topTags: string[];
  activeTag: string;
  onTagChange: (tag: string) => void;
  likedPosts: string[];
  savedPosts: string[];
  followedAuthors: string[];
  activeCommentId: string | null;
  commentDraft: string;
  onLikeToggle: (postId: string) => void;
  onSaveToggle: (postId: string) => void;
  onFollowToggle: (author: string) => void;
  onCommentToggle: (postId: string) => void;
  onCommentDraftChange: (value: string) => void;
  onCommentSubmit: (postId: string) => void;
};

export default function FeedSection({
  filteredPosts,
  hasFeedPosts,
  topTags,
  activeTag,
  onTagChange,
  likedPosts,
  savedPosts,
  followedAuthors,
  activeCommentId,
  commentDraft,
  onLikeToggle,
  onSaveToggle,
  onFollowToggle,
  onCommentToggle,
  onCommentDraftChange,
  onCommentSubmit,
}: Props) {
  const getTagButtonClass = (tag: string) =>
    `cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
      activeTag === tag
        ? "border-electric-sky bg-electric-sky text-obsidian"
        : "border-bone text-slate dark:border-night-edge dark:text-mist hover:border-electric-sky"
    }`;

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]" id="feed">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-ink text-xl font-semibold dark:text-screen">Feed reciente</h2>
          <a
            href="#circulos"
            className="cursor-pointer rounded-full border border-bone px-4 py-1 text-xs font-semibold text-ink transition-colors hover:border-electric-sky dark:border-night-edge dark:text-screen"
          >
            Ver circulos
          </a>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onTagChange("Todas")}
            className={getTagButtonClass("Todas")}
            aria-pressed={activeTag === "Todas"}
          >
            Todas
          </button>
          {topTags.map((tag) => (
            <button
              key={`feed-${tag}`}
              type="button"
              onClick={() => onTagChange(tag)}
              className={getTagButtonClass(tag)}
              aria-pressed={activeTag === tag}
            >
              #{tag}
            </button>
          ))}
        </div>

        {hasFeedPosts ? (
          filteredPosts.map((post, index) => {
            const isLiked = likedPosts.includes(post.id);
            const isSaved = savedPosts.includes(post.id);
            const isFollowing = followedAuthors.includes(post.author);

            return (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.05 }}
                className="rounded-2xl border border-bone bg-linen p-5 dark:border-night-edge dark:bg-obsidian"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-sapphire/50" />
                    <div>
                      <p className="text-sm font-semibold text-ink dark:text-screen">
                        {post.author}
                      </p>
                      <p className="text-xs text-slate dark:text-mist">
                        {post.handle} - {post.time}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onFollowToggle(post.author)}
                    className="cursor-pointer rounded-full bg-depth px-4 py-1 text-xs font-semibold text-screen transition-colors hover:bg-sapphire"
                    aria-pressed={isFollowing}
                  >
                    {isFollowing ? "Siguiendo" : "Seguir"}
                  </button>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                  {post.cover ? (
                    <img
                      src={post.cover}
                      alt={post.headline}
                      loading="lazy"
                      className="h-36 w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="h-36 rounded-xl bg-gradient-to-br from-depth to-obsidian" />
                  )}

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-ink dark:text-screen">
                      {post.headline}
                    </h3>
                    <p className="text-sm text-slate leading-relaxed dark:text-mist">
                      {post.summary}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <button
                          key={`${post.id}-feed-${tag}`}
                          type="button"
                          onClick={() => onTagChange(tag)}
                          className={getTagButtonClass(tag)}
                          aria-pressed={activeTag === tag}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => onLikeToggle(post.id)}
                    className={`cursor-pointer rounded-full border px-3 py-1 text-slate transition-colors hover:border-electric-sky dark:text-mist ${
                      isLiked
                        ? "border-electric-sky text-ink dark:border-electric-sky dark:text-screen"
                        : "border-bone dark:border-night-edge"
                    }`}
                    aria-pressed={isLiked}
                  >
                    <IconText
                      icon={isLiked ? "tabler:heart-filled" : "tabler:heart"}
                      text={isLiked ? "Te gusta" : "Me gusta"}
                      className="text-slate dark:text-mist"
                      iconSize={14}
                      iconClassName={isLiked ? "pulse-active" : undefined}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => onCommentToggle(post.id)}
                    className="cursor-pointer rounded-full border border-bone px-3 py-1 text-slate transition-colors hover:border-electric-sky dark:border-night-edge dark:text-mist"
                  >
                    <IconText
                      icon="tabler:message"
                      text="Comentar"
                      className="text-slate dark:text-mist"
                      iconSize={14}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => onSaveToggle(post.id)}
                    className={`cursor-pointer rounded-full border px-3 py-1 text-slate transition-colors hover:border-electric-sky dark:text-mist ${
                      isSaved
                        ? "border-electric-sky text-ink dark:border-electric-sky dark:text-screen"
                        : "border-bone dark:border-night-edge"
                    }`}
                    aria-pressed={isSaved}
                  >
                    <IconText
                      icon={isSaved ? "tabler:bookmark-filled" : "tabler:bookmark"}
                      text={isSaved ? "Guardado" : "Guardar"}
                      className="text-slate dark:text-mist"
                      iconSize={14}
                      iconClassName={isSaved ? "pulse-active" : undefined}
                    />
                  </button>
                  <a
                    href={post.href}
                    className="cursor-pointer rounded-full border border-bone px-3 py-1 text-slate transition-colors hover:border-electric-sky dark:border-night-edge dark:text-mist"
                  >
                    Ver detalle
                  </a>
                </div>

                {activeCommentId === post.id && (
                  <div className="mt-3 rounded-xl border border-bone bg-sand p-3 dark:border-night-edge dark:bg-coal">
                    <label
                      htmlFor={`comment-${post.id}`}
                      className="text-xs text-slate dark:text-mist"
                    >
                      Escribe un comentario
                    </label>
                    <textarea
                      id={`comment-${post.id}`}
                      value={commentDraft}
                      onChange={(event) => onCommentDraftChange(event.target.value)}
                      rows={3}
                      className="mt-2 w-full rounded-lg border border-bone bg-linen px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-electric-sky/40 dark:border-night-edge dark:bg-obsidian dark:text-screen"
                      placeholder="Comparte tu opinion..."
                    />
                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onCommentToggle(post.id)}
                        className="cursor-pointer rounded-full border border-bone px-3 py-1 text-xs font-semibold text-slate transition-colors hover:border-electric-sky dark:border-night-edge dark:text-mist"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => onCommentSubmit(post.id)}
                        className="cursor-pointer rounded-full bg-electric-sky px-3 py-1 text-xs font-semibold text-obsidian transition-colors hover:bg-sapphire"
                      >
                        Enviar
                      </button>
                    </div>
                  </div>
                )}
              </motion.article>
            );
          })
        ) : (
          <div className="rounded-2xl border border-bone bg-sand p-4 text-sm text-slate dark:border-night-edge dark:bg-coal dark:text-mist">
            No hay publicaciones para esta etiqueta. Prueba otra.
          </div>
        )}
      </div>

      <aside className="space-y-6">
        <div className="rounded-2xl border border-bone bg-sand p-5 dark:border-night-edge dark:bg-coal">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate dark:text-mist">
            Etiquetas destacadas
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {topTags.length > 0 ? (
              topTags.map((tag) => (
                <button
                  key={`tag-${tag}`}
                  type="button"
                  onClick={() => onTagChange(tag)}
                  className={getTagButtonClass(tag)}
                  aria-pressed={activeTag === tag}
                >
                  #{tag}
                </button>
              ))
            ) : (
              <span className="text-xs text-slate dark:text-mist">
                Agrega posts para ver etiquetas.
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-bone bg-linen p-5 dark:border-night-edge dark:bg-obsidian">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate dark:text-mist">
            Sugerencias para ti
          </h3>
          <div className="mt-4 space-y-3">
            {Array.from(new Map(filteredPosts.map((post) => [post.author, post])).values()).map(
              (post) => (
                <div
                  key={`suggested-${post.id}`}
                  className="flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink dark:text-screen">
                      {post.author}
                    </p>
                    <p className="text-xs text-slate dark:text-mist">
                      {post.handle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onFollowToggle(post.author)}
                    className="cursor-pointer rounded-full border border-bone px-3 py-1 text-xs font-semibold text-ink transition-colors hover:border-electric-sky dark:border-night-edge dark:text-screen"
                    aria-pressed={followedAuthors.includes(post.author)}
                  >
                    {followedAuthors.includes(post.author) ? "Siguiendo" : "Seguir"}
                  </button>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-bone bg-sand p-5 dark:border-night-edge dark:bg-coal">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate dark:text-mist">
            Tu proxima coleccion
          </h3>
          <p className="mt-3 text-sm text-slate dark:text-mist">
            Combina juegos, peliculas y musica en una coleccion curada.
          </p>
          <a
            href="/games"
            className="mt-4 inline-flex cursor-pointer rounded-full border border-bone px-4 py-2 text-xs font-semibold text-ink transition-colors hover:border-electric-sky dark:border-night-edge dark:text-screen"
          >
            Empezar coleccion
          </a>
        </div>
      </aside>
    </section>
  );
}
