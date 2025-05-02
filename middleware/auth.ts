export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuth();
  const token = useCookie("auth_token");

  // Detailed logging
  console.log("Auth Middleware Detailed Check:", {
    currentPath: to.path,
    tokenExists: !!token.value,
    tokenLength: token.value ? token.value.length : 0,
    isAuthenticated: isAuthenticated.value,
  });

  // Define public routes that don't require authentication
  const publicRoutes = ["/login", "/"];

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(
    (route) => route === to.path || to.path.startsWith(route)
  );

  // If route is not public and user is not authenticated, redirect to login
  if (!isPublicRoute && !token.value) {
    console.log("Auth middleware: Redirecting to login from", to.path);
    return navigateTo("/login");
  }

  // If user is already authenticated and trying to access login page, redirect to dashboard
  if (token.value && to.path === "/login") {
    console.log("Auth middleware: Redirecting to dashboard from login");
    return navigateTo("/dashboard");
  }
});
