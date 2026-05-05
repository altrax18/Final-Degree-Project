import { c as createComponent } from './astro-component_CvTESmvA.mjs';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_DF_D8ei4.mjs';
import { $ as $$Layout } from './Layout_Dqj83iAE.mjs';
import { s as serverApi } from './server-api_BGd5GONv.mjs';
import { Icon } from '@iconify/react';

const $$albumId = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$albumId;
  const { albumId } = Astro2.params;
  let album = null;
  let tracks = [];
  let fetchError = null;
  if (albumId) {
    const { data, error } = await serverApi.api.music.album({ id: albumId }).get();
    if (error || !data) {
      fetchError = "No se pudo cargar el álbum. Comprueba que la API esté activa.";
    } else {
      album = data.album ?? null;
      tracks = data.tracks ?? [];
    }
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": album ? `${album.title} — Álbum` : "Álbum" }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="mb-6"> <a href="/music" class="inline-flex items-center gap-2 text-sm text-slate dark:text-mist hover:text-ink dark:hover:text-screen transition-colors group"> ${renderComponent($$result2, "Icon", Icon, { "icon": "tabler:arrow-left", "className": "w-5 h-5 group-hover:-translate-x-0.5 transition-transform" })}
Volver a Música
</a> </div>  ${fetchError && renderTemplate`<div class="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-400 text-sm flex items-center gap-3"> ${renderComponent($$result2, "Icon", Icon, { "icon": "tabler:alert-circle", "className": "w-5 h-5" })} ${fetchError} </div>`} ${album && renderTemplate`${renderComponent($$result2, "AlbumDetail", null, { "client:only": "react", "album": album, "tracks": tracks, "client:component-hydration": "only", "client:component-path": "C:/Users/sabax/OneDrive/Desktop/Final-Degree-Project/apps/web/src/components/music/AlbumDetail.jsx", "client:component-export": "default" })}`} ${!fetchError && !album && renderTemplate`<div class="flex flex-col items-center justify-center py-32 gap-4 text-slate dark:text-mist"> <span class="text-6xl">💿</span> <p class="text-lg font-medium">Álbum no encontrado</p> <a href="/music" class="text-amethyst dark:text-orchid hover:text-amethyst/80 dark:hover:text-orchid/80 text-sm underline">
Volver a Música
</a> </div>`}` })}`;
}, "C:/Users/sabax/OneDrive/Desktop/Final-Degree-Project/apps/web/src/pages/music/album/[albumId].astro", void 0);

const $$file = "C:/Users/sabax/OneDrive/Desktop/Final-Degree-Project/apps/web/src/pages/music/album/[albumId].astro";
const $$url = "/music/album/[albumId]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$albumId,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
