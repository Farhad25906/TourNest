export type UserRole = "ADMIN" | "TOURIST" | "HOST"; 


export type RouteConfig = {
    exact: string[],
    patterns: RegExp[],
}

export const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

export const commonProtectedRoutes: RouteConfig = {
    exact: ["/my-profile", "/settings", "/change-password"],
    patterns: [], 
}

export const userProtectedRoutes: RouteConfig = { 
    patterns: [/^\/tou‌rist\/dashboard/], 
    exact: ["/dashboard"], 
}

export const hostProtectedRoutes: RouteConfig = { 
    patterns: [/^\/host\/dashboard/], 
    exact: [], 
}

export const adminProtectedRoutes: RouteConfig = {
    patterns: [/^\/admin\/dashboard/], 
    exact: [], 
}

export const isAuthRoute = (pathname: string) => {
    return authRoutes.some((route: string) => route === pathname);
}

export const isRouteMatches = (pathname: string, routes: RouteConfig): boolean => {
    if (routes.exact.includes(pathname)) {
        return true;
    }
    return routes.patterns.some((pattern: RegExp) => pattern.test(pathname))
}

export const getRouteOwner = (pathname: string): "ADMIN" | "TOURIST" | "HOST" | "COMMON" | null => {
    if (isRouteMatches(pathname, adminProtectedRoutes)) {
        return "ADMIN";
    }
    if (isRouteMatches(pathname, hostProtectedRoutes)) {
        return "HOST";
    }
    if (isRouteMatches(pathname, userProtectedRoutes)) {
        return "TOURIST";
    }
    if (isRouteMatches(pathname, commonProtectedRoutes)) {
        return "COMMON";
    }
    return null;
}

export const getDefaultDashboardRoute = (role: UserRole): string => {
    if (role === "ADMIN") {
        return "/admin/dashboard";
    }
    if (role === "HOST") {
        return "/host/dashboard";
    }
    if (role === "TOURIST") {
        return "/tourist/dashboard";
    }
    return "/";
}

export const isValidRedirectForRole = (redirectPath: string, role: UserRole): boolean => {
    const routeOwner = getRouteOwner(redirectPath);

    if (routeOwner === null || routeOwner === "COMMON") {
        return true;
    }

    if (routeOwner === role) {
        return true;
    }

    return false;
}
