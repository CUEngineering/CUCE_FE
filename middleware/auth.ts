export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuth();
  const token = useCookie("auth_token");

  // Define public routes that don't require authentication
  const publicRoutes = ["/login"];

  // Check if the current route is public
  const isPublicRoute = publicRoutes.includes(to.path);

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
