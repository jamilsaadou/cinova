import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Proxy (ex-middleware) de routage i18n : détecte/redirige la locale.
export default createMiddleware(routing);

export const config = {
  // Ignore les routes internes, l'API et les fichiers statiques.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
