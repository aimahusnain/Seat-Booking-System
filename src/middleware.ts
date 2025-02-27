// Updated middleware.js
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If user is not logged in and tries to access check-in
    if (!token && path.startsWith('/check-in')) {
      // Preserve the entire URL including query parameters for redirect
      const redirectUrl = encodeURIComponent(req.nextUrl.href);
      return NextResponse.redirect(
        new URL(`/login?redirect=${redirectUrl}`, req.url)
      );
    }

    // If user is logged in and tries to access pages other than the allowed ones
    if (token) {
      const allowedAuthPaths = ['/dashboard', '/client-view', '/seat-scanning', '/check-in'];
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
        
        // Allow unrestricted access to seat-scanning
        if (path.startsWith('/seat-scanning')) {
          return true;
        }
        
        // Require authentication for dashboard and check-in
        if (path.startsWith('/dashboard') || path.startsWith('/check-in')) {
          return !!token;
        }
        
        // Allow access to client-view without auth
        if (path.startsWith('/client-view')) {
          return true;
        }

        // Allow access to login page
        if (path.startsWith('/login')) {
          return true;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/",
    '/dashboard/:path*',
    '/client-view/:path*',
    '/seat-scanning/:path*',
    '/check-in',
    '/login',
  ]
};