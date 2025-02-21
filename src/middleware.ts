import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If user is logged in and tries to access unauthorized pages, redirect to /dashboard
    if (token) {
      const allowedAuthPaths = ['/dashboard', '/client-view', '/seat-scanning'];
      if (!allowedAuthPaths.some(p => path.startsWith(p))) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Allow access to seat-scanning and client-view without authentication
        if (path.startsWith('/seat-scanning') || path.startsWith('/client-view')) {
          return true;
        }

        // Require authentication for /dashboard and other protected pages
        if (path.startsWith('/dashboard')) {
          return !!token;
        }

        // Default behavior (require authentication)
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/client-view/:path*",
    "/seat-scanning/:path*",
    // Exclude API, static files, and images from authentication
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ]
};