import type { APIRoute } from "astro";
import { neon } from "@neondatabase/serverless";
import { serverApi } from "../lib/server-api";

// CONCEPTO: API Route (Backend For Frontend)
// QUE HACE: Crea un endpoint exclusivo para el frontend que sirve datos en tiempo real.
// POR QUE LO USO: Permite separar la caché de la portada (5 min) de las reseñas (0 min).
// DOCUMENTACION: https://docs.astro.build/en/guides/endpoints/#server-endpoints-api-routes
export const GET: APIRoute = async () => {
  try {
    const dbUrl = import.meta.env.DATABASE_URL || process.env.DATABASE_URL;
    if (!dbUrl) return new Response(JSON.stringify([]), { status: 200 });

    const sql = neon(dbUrl);
    const rows = await sql`
      SELECT r.id, r.content, r.rating, r.created_at, r.item_type, r.item_api_id, u.username, u.profile_image_url
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
      LIMIT 3
    `;

    const rawReviews = rows.map((row: any) => ({
      id: row.id,
      content: row.content,
      rating: row.rating,
      createdAt: row.created_at,
      itemType: row.item_type,
      itemApiId: row.item_api_id,
      user: {
        username: row.username,
        profileImageUrl: row.profile_image_url,
      },
    }));

    // Enriquecimiento de Datos (Títulos de películas/juegos)
    const recentReviews = await Promise.all(
      rawReviews.map(async (review) => {
        let title = undefined;
        try {
          if (review.itemType === "game" && review.itemApiId) {
            const { data, error } = await serverApi.api
              .games({ apiId: String(review.itemApiId) })
              .get();
            if (!error && data) title = (data as any).title;
          } else if (review.itemType === "movie" && review.itemApiId) {
            const { data, error } = await serverApi.api
              .movies({ apiId: String(review.itemApiId) })
              .get();
            if (!error && data) title = (data as any).title;
          }
        } catch (err) {}
        return { ...review, media: { title, type: review.itemType } };
      }),
    );

    return new Response(JSON.stringify(recentReviews), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify([]), { status: 500 });
  }
};
