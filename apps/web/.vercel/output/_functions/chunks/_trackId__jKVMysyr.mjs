import { c as createComponent } from './astro-component_CvTESmvA.mjs';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_DF_D8ei4.mjs';
import { $ as $$Layout } from './Layout_Dqj83iAE.mjs';
import { s as serverApi } from './server-api_BGd5GONv.mjs';
import { Icon } from '@iconify/react';

const $$trackId = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$trackId;
  const { trackId } = Astro2.params;
  let track = null;
  let fetchError = null;
  if (trackId) {
    const { data, error } = await serverApi.api.music.track({ id: trackId }).get();
    if (error || !data) {
      fetchError = "No se pudo cargar la canción. Comprueba que la API esté activa.";
    } else {
      track = data;
    }
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": track ? track.title : "Track" }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="mb-6"> <a href="/music" class="inline-flex items-center gap-2 text-sm text-slate dark:text-mist hover:text-ink dark:hover:text-screen transition-colors group"> ${renderComponent($$result2, "Icon", Icon, { "icon": "tabler:arrow-left", "className": "w-5 h-5 group-hover:-translate-x-0.5 transition-transform" })}
Volver a Música
</a> </div>  ${fetchError && renderTemplate`<div class="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-400 text-sm flex items-center gap-3"> ${renderComponent($$result2, "Icon", Icon, { "icon": "tabler:alert-circle", "className": "w-5 h-5" })} ${fetchError} </div>`} ${track && renderTemplate`${renderComponent($$result2, "TrackDetail", null, { "client:only": "react", "track": track, "client:component-hydration": "only", "client:component-path": "C:/Users/sabax/OneDrive/Desktop/Final-Degree-Project/apps/web/src/components/music/TrackDetail.jsx", "client:component-export": "default" })}`} ${!fetchError && !track && renderTemplate`<div class="flex flex-col items-center justify-center py-32 gap-4 text-slate dark:text-mist"> <span class="text-6xl">🎵</span> <p class="text-lg font-medium">Canción no encontrada</p> <a href="/music" class="text-amethyst dark:text-orchid hover:text-amethyst/80 dark:hover:text-orchid/80 text-sm underline">
Volver a Música
</a> </div>`}` })}`;
}, "C:/Users/sabax/OneDrive/Desktop/Final-Degree-Project/apps/web/src/pages/music/[trackId].astro", void 0);

const $$file = "C:/Users/sabax/OneDrive/Desktop/Final-Degree-Project/apps/web/src/pages/music/[trackId].astro";
const $$url = "/music/[trackId]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$trackId,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
