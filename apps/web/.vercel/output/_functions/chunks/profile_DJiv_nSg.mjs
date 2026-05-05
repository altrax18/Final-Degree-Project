import { c as createComponent } from './astro-component_Ca-ehMXU.mjs';
import { l as renderComponent, r as renderTemplate } from './entrypoint_BHKh6TqG.mjs';
import { $ as $$Layout } from './Layout_CvdiqHQU.mjs';

const $$Profile = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Profile;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Perfil" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "ProfilePage", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/sabax/OneDrive/Desktop/Final-Degree-Project/apps/web/src/components/profile/ProfilePage.tsx", "client:component-export": "default" })} ` })}`;
}, "C:/Users/sabax/OneDrive/Desktop/Final-Degree-Project/apps/web/src/pages/profile.astro", void 0);

const $$file = "C:/Users/sabax/OneDrive/Desktop/Final-Degree-Project/apps/web/src/pages/profile.astro";
const $$url = "/profile";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Profile,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
