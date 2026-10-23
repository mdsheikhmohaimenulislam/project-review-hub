import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

type UserRole = "STUDENT" | "MENTOR";

interface JwtPayload {
  userId?: string;
  id?: string;
  email?: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

const AUTH_ROUTES = ["/login", "/register"];

const ROLE_ROUTES: Record<UserRole, string> = {
  STUDENT: "/student/dashboard",
  MENTOR: "/mentor/dashboard",
};

const PROTECTED_ROUTES = [
  { path: "/student", role: "STUDENT" },
  { path: "/mentor", role: "MENTOR" },
] as const;

function getUserFromToken(
  accessToken: string | undefined,
): JwtPayload | null {
  if (!accessToken) {
    return null;
  }

  try {
    const user = jwtDecode<JwtPayload>(accessToken);

    if (user.exp && user.exp * 1000 <= Date.now()) {
      return null;
    }

    if (user.role !== "STUDENT" && user.role !== "MENTOR") {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const user = getUserFromToken(accessToken);

  // Allow Next.js internals and public assets.
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/images")
  ) {
    return NextResponse.next();
  }

  // Allow authentication callback routes.
  if (pathname.startsWith("/auth/success")) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from login/register.
  if (AUTH_ROUTES.includes(pathname) && user) {
    return NextResponse.redirect(
      new URL(ROLE_ROUTES[user.role], request.url),
    );
  }

  // Protect role-specific routes.
  const protectedRoute = PROTECTED_ROUTES.find(({ path }) =>
    pathname.startsWith(`${path}/`) || pathname === path,
  );

  if (protectedRoute) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set(
        "redirect",
        `${pathname}${request.nextUrl.search}`,
      );

      return NextResponse.redirect(loginUrl);
    }

    if (user.role !== protectedRoute.role) {
      return NextResponse.redirect(
        new URL(ROLE_ROUTES[user.role], request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/auth/success",
    "/student/:path*",
    "/mentor/:path*",
  ],
};