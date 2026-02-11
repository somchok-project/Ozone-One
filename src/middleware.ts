import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const publicRoutes = ["/", "/auth/login", "/auth/register", "/booths"];

// Routes that require any authenticated user
const protectedRoutes = ["/customer", "/admin"];


export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes, API routes, and static files
  if (
    publicRoutes.some((route) => pathname === route) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check session via the session token cookie
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ??
    request.cookies.get("__Secure-authjs.session-token")?.value;

  const isAuthenticated = !!sessionToken;

  // If not authenticated and trying to access protected routes → redirect to login
  if (
    !isAuthenticated &&
    protectedRoutes.some((route) => pathname.startsWith(route))
  ) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated and trying to access auth pages → redirect based on role
  if (
    isAuthenticated &&
    pathname.startsWith("/auth/") &&
    !pathname.startsWith("/auth/redirect")
  ) {
    return NextResponse.redirect(new URL("/auth/redirect", request.url));
  }



  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
