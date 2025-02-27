import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // If user is logged in and tries to access pages other than the allowed ones
    if (token) {
      const allowedAuthPaths = ["/dashboard", "/client-view", "/seat-scanning", "/check-in"]
      if (!allowedAuthPaths.some((p) => path.startsWith(p))) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        // Allow unrestricted access to seat-scanning
        if (path.startsWith("/seat-scanning")) {
          return true
        }

        // Require authentication for check-in page, but allow access to check-in/login
        if (path.startsWith("/check-in")) {
          // Allow access to the login page without authentication
          if (path.startsWith("/check-in/login")) {
            return true
          }
          // Require authentication for the actual check-in process
          return !!token
        }

        // Only require authentication for dashboard page
        if (path.startsWith("/dashboard")) {
          return !!token
        }

        // Allow access to client-view without auth
        if (path.startsWith("/client-view")) {
          return true
        }

        return true
      },
    },
  },
)

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/client-view/:path*",
    "/seat-scanning/:path*",
    "/check-in/:path*",
    // '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}