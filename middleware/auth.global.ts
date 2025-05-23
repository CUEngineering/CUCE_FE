export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie("token").value;
  const role = useCookie("role").value;

  const protectedRoutes = ["/dashboard", "/admin", "/student", "/registrar"];

  const roleRoutes: Record<string, string[]> = {
    "/admin": ["ADMIN"],
    "/student": ["STUDENT"],
    "/registrar": ["REGISTRAR"],
  };

  if (protectedRoutes.some((p) => to.path.startsWith(p)) && !token) {
    return navigateTo("/login");
  }

  for (const [prefix, allowedRoles] of Object.entries(roleRoutes)) {
    if (to.path.startsWith(prefix) && !allowedRoles.includes(role || "")) {
      return navigateTo("/unauthorized");
    }
  }
});
