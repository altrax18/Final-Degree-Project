import { a as app } from './index_DAZL6o-p.mjs';

const handle = ({ request }) => app.handle(request);
const GET = handle;
const POST = handle;
const PUT = handle;
const PATCH = handle;
const DELETE = handle;
const OPTIONS = handle;
const ALL = handle;

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	ALL,
	DELETE,
	GET,
	OPTIONS,
	PATCH,
	POST,
	PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
