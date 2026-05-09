import { treaty } from "@elysiajs/eden";
import { app } from "@final-degree-project/api";

// Cliente Eden Treaty optimizado para SSR.
// Al pasar la instancia 'app' directamente, procesa las peticiones en memoria
// a velocidad nativa sin realizar llamadas HTTP externas por la red,
// evitando problemas de CORS, cookies o restricciones de despliegues protegidos en Vercel.
export const serverApi = treaty(app);
