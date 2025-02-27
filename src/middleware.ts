import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // If user is logged in and tries to access pages other than the allowed ones
    if (token) {
      const allowedAuthPaths = ["/dashboard", "/client-view", "/seat-scanning"]
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

        if (path.startsWith("/check-in")) {
          // If not logged in and trying to access check-in, redirect to login with the current URL
          if (!token) {
            const url = req.nextUrl.clone()
            const loginUrl = new URL("/login", req.url)
            loginUrl.searchParams.set("redirect", url.pathname + url.search)
            throw new Response(null, {
              status: 302,
              headers: {
                Location: loginUrl.toString(),
              },
            })
          }
          return true
        }

        // Only require authentication for dashboard page
        if (path.startsWith("/dashboard")) {
          if (!token) {
            const url = req.nextUrl.clone()
            const loginUrl = new URL("/login", req.url)
            loginUrl.searchParams.set("redirect", url.pathname + url.search)
            throw new Response(null, {
              status: 302,
              headers: {
                Location: loginUrl.toString(),
              },
            })
          }
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

