import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useProfile } from "../../hooks/useProfile";

interface Review {
  id: number;
  rating: number;
  content: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    profileImageUrl: string;
  };
}

interface Props {
  itemType: "game" | "movie" | "music";
  itemApiId: string | number;
  accentColor: "blue" | "red" | "purple";
}

export default function ReviewSection({ itemType, itemApiId, accentColor }: Props) {
  const { user } = useProfile();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const colorClasses = {
    blue: {
      bg: "bg-blue-600",
      bgHover: "hover:bg-blue-500",
      text: "text-blue-500",
      textActive: "text-blue-400",
      shadow: "shadow-[0_0_20px_rgba(37,99,235,0.2)]",
    },
    red: {
      bg: "bg-red-600",
      bgHover: "hover:bg-red-500",
      text: "text-red-500",
      textActive: "text-red-400",
      shadow: "shadow-[0_0_20px_rgba(220,38,38,0.2)]",
    },
    purple: {
      bg: "bg-amethyst",
      bgHover: "hover:bg-orchid",
      text: "text-amethyst",
      textActive: "text-orchid",
      shadow: "shadow-[0_0_20px_rgba(139,111,189,0.2)]",
    },
  };

  const colors = colorClasses[accentColor];

  useEffect(() => {
    fetchReviews();
  }, [itemType, itemApiId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews/${itemType}/${itemApiId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Error fetching reviews", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("Debes iniciar sesión para publicar una reseña");
      return;
    }
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          itemType,
          itemApiId: String(itemApiId),
          rating,
          content,
        }),
      });

      if (res.ok) {
        setContent("");
        setRating(5);
        fetchReviews(); // Recargar reseñas
      } else {
        alert("Error al publicar la reseña");
      }
    } catch (err) {
      console.error(err);
      alert("Error al publicar la reseña");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres borrar esta reseña?")) return;
    
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReviews(reviews.filter(r => r.id !== id));
      } else {
        alert("Error al borrar la reseña");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getRelativeTime = (dateString: string) => {
    const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
    const daysDifference = Math.round((new Date(dateString).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDifference === 0) return "Hoy";
    if (daysDifference > -30) return rtf.format(daysDifference, "day");
    const monthsDifference = Math.round(daysDifference / 30);
    if (monthsDifference > -12) return rtf.format(monthsDifference, "month");
    return rtf.format(Math.round(daysDifference / 365), "year");
  };

  return (
    <section className="mt-16 pt-10 border-t border-bone dark:border-night-edge">
      <h2 className="text-3xl font-black mb-2">Comunidad</h2>
      <p className="text-slate dark:text-mist mb-8">
        ¿Qué opinas sobre esto? Comparte tu reseña.
      </p>

      <div className={`bg-sand dark:bg-coal p-4 sm:p-6 rounded-2xl border border-bone dark:border-night-edge ${colors.shadow}`}>
        {/* Input para comentar */}
        <div className="flex gap-3 sm:gap-4 mb-8">
          <div className="flex-shrink-0">
            {user ? (
              <img src={user.profileImageUrl} alt="Avatar" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover" />
            ) : (
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${colors.bg} flex items-center justify-center font-bold text-lg text-white`}>
                ?
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <textarea
              className="w-full bg-linen dark:bg-coal text-ink dark:text-screen p-4 rounded-xl border border-bone dark:border-night-edge focus:outline-none resize-none transition-colors duration-200"
              style={{ outlineColor: "var(--accent-color)" }}
              rows={3}
              placeholder={user ? "Escribe tu reseña..." : "Inicia sesión para escribir una reseña..."}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={!user || submitting}
            ></textarea>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    disabled={!user || submitting}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Icon
                      icon={star <= (hoverRating || rating) ? "tabler:star-filled" : "tabler:star"}
                      className={`w-6 h-6 ${star <= (hoverRating || rating) ? colors.text : "text-slate dark:text-mist"}`}
                    />
                  </button>
                ))}
              </div>
              <button
                onClick={handleSubmit}
                disabled={!user || !content.trim() || submitting}
                className={`w-full sm:w-auto px-6 py-2.5 ${colors.bg} text-white font-bold rounded-xl ${colors.bgHover} transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base`}
              >
                {submitting ? "Publicando..." : "Publicar Reseña"}
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Reseñas */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center text-slate dark:text-mist py-4">Cargando reseñas...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center text-slate dark:text-mist py-4 border-t border-bone dark:border-night-edge pt-6">
              Aún no hay reseñas. ¡Sé el primero en compartir la tuya!
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="flex gap-3 sm:gap-4 border-t border-bone dark:border-night-edge pt-6 group">
                <a href={`/u/${review.user.id}`} className="shrink-0">
                  <img src={review.user.profileImageUrl} alt={review.user.username} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover hover:opacity-80 transition-opacity" />
                </a>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <a href={`/u/${review.user.id}`} className={`font-bold text-sm sm:text-base ${colors.textActive} hover:underline truncate max-w-[120px] sm:max-w-none`}>
                        @{review.user.username}
                      </a>
                      <span className="text-[10px] sm:text-xs bg-linen dark:bg-night-edge px-1.5 sm:px-2 py-0.5 rounded text-ink dark:text-screen border border-bone dark:border-night-edge flex items-center gap-1 shrink-0">
                        <Icon icon="tabler:star-filled" className={`w-3 h-3 ${colors.text}`} />
                        {review.rating}/5
                      </span>
                      <span className="text-[10px] sm:text-xs text-slate dark:text-mist shrink-0">
                        {getRelativeTime(review.createdAt)}
                      </span>
                    </div>
                    {user && user.id === review.user.id && (
                      <button 
                        onClick={() => handleDelete(review.id)}
                        className="text-red-500 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1 shrink-0"
                        title="Borrar reseña"
                      >
                        <Icon icon="tabler:trash" className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-slate dark:text-mist text-sm sm:text-base whitespace-pre-wrap break-words">{review.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
