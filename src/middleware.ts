import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth-related pages without a token
        const publicPaths = ["/login", "/register", "/forgot-password"]
        if (publicPaths.includes(req.nextUrl.pathname)) {
          return true
        }

        return !!token
      },
    },
  },
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/client-view/:path*",
    "/seat-scanning/:path*",
    // Exclude auth pages and static assets
    "/((?!api|_next/static|_next/image|favicon.ico|login|register|forgot-password).*)",
  ],
}

