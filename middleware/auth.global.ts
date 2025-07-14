export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie("token").value;
  const role = useCookie("role").value;

  // const auth = useAuthStore();
  // console.log("Auth Middleware", auth);

  const roleRoutes: Record<string, { roles: string[]; exclude?: string[] }> = {
    "/admin": {
      roles: ["ADMIN"],
    },
    "/student": {
      roles: ["STUDENT"],
      exclude: ["/student/create"],
    },
    "/registrar": {
      roles: ["REGISTRAR"],
    },
  };

  if (
    Object.keys(roleRoutes).some((prefix) => to.path.startsWith(prefix)) &&
    !token
  ) {
    return navigateTo("/login");
  }

  for (const [prefix, config] of Object.entries(roleRoutes)) {
    if (
      to.path.startsWith(prefix) &&
      !config.exclude?.includes(to.path) &&
      !config.roles.includes(role || "")
    ) {
      return navigateTo("/unauthorized");
    }
  }
});
