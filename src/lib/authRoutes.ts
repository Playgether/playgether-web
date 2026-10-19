export const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/forgot-password",
  "/reset-password",
  "/terms",
  "/privacy",
  "/community",
  "/cookies",
  "/riot.txt",
];

/** Marketing/auth pages: a logged-in user is sent straight to /feed. */
export const AUTH_ENTRY_ROUTES = ["/", "/about", "/forgot-password", "/reset-password"];

/** Shared post/cut deep-links and embeds: /feed/{publicId}, /cuts/{publicId}, /cuts/{publicId}/embed. */
function isPublicPostRoute(pathname: string) {
  return /^\/(feed|cuts)\/[A-Za-z0-9]{12}(\/embed)?$/.test(pathname);
}

export function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.includes(pathname) || isPublicPostRoute(pathname);
}
