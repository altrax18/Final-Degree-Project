import { c as createComponent } from './astro-component_Ca-ehMXU.mjs';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_BHKh6TqG.mjs';
import { $ as $$Layout } from './Layout_CvdiqHQU.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { s as serverApi } from './server-api_05J3DRLn.mjs';

function MediaCard({ title, type, image }) {
  const fallback = "https://placehold.co/400x600/1f2937/e5e7eb?text=No+Image";
  return /* @__PURE__ */ jsxs("article", { className: "group overflow-hidden rounded-xl border border-bone dark:border-night-edge bg-linen dark:bg-coal backdrop-blur-sm transition hover:-translate-y-1 hover:border-bone dark:hover:border-night-edge", children: [
    /* @__PURE__ */ jsx("div", { className: "aspect-[2/3] w-full overflow-hidden bg-sand dark:bg-coal", children: /* @__PURE__ */ jsx(
      "img",
      {
        src: image || fallback,
        alt: title,
        loading: "lazy",
        className: "h-full w-full object-cover transition duration-300 group-hover:scale-105"
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "p-3", children: [
      /* @__PURE__ */ jsx("p", { className: "mb-1 text-xs uppercase tracking-wide text-electric-sky", children: type }),
      /* @__PURE__ */ jsx("h3", { className: "line-clamp-2 text-sm font-semibold text-ink dark:text-screen", children: title })
    ] })
  ] });
}

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  let trending = [];
  let error = null;
  try {
    const { data, error: apiError } = await serverApi.api.music.trending.songs.get();
    if (apiError) throw new Error("API error");
    trending = data?.results ?? [];
  } catch (err) {
    error = err;
    trending = [];
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Trending" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="space-y-6"> <div class="space-y-1"> <h1 class="text-3xl font-bold text-ink dark:text-screen tracking-tight">Trending Now</h1> <p class="text-slate dark:text-mist text-sm">
A curated snapshot of what's hot across all media.
</p> </div> ${error && renderTemplate`<div class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
Could not reach the API. Make sure${" "} <code class="font-mono">apps/api</code> is running on port 3000.
</div>`} ${Array.isArray(trending) && trending.length > 0 && renderTemplate`<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"> ${trending.map((item) => renderTemplate`${renderComponent($$result2, "MediaCard", MediaCard, { "client:visible": true, "title": item.title, "type": item.type, "image": item.image, "client:component-hydration": "visible", "client:component-path": "C:/Users/sabax/OneDrive/Desktop/Final-Degree-Project/apps/web/src/components/shared/MediaCard.jsx", "client:component-export": "default" })}`)} </div>`} </section> <section class="mt-12 border-t border-bone dark:border-night-edge pt-10"> ${renderComponent($$result2, "RecommendedUsersWidget", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/sabax/OneDrive/Desktop/Final-Degree-Project/apps/web/src/components/shared/RecommendedUsersWidget", "client:component-export": "default" })} </section> ` })}`;
}, "C:/Users/sabax/OneDrive/Desktop/Final-Degree-Project/apps/web/src/pages/index.astro", void 0);

const $$file = "C:/Users/sabax/OneDrive/Desktop/Final-Degree-Project/apps/web/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
