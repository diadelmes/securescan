import { withAuth } from "next-auth/middleware";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n";

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed", // Only adds prefix for non-default locales
});

// Protected routes that require authentication
const protectedPaths = ["/dashboard", "/settings", "/profile"];

// Auth routes - redirect to dashboard if already logged in
const authPaths = ["/login", "/register"];

function isProtectedPath(pathname: string) {
  return protectedPaths.some((path) =>
    pathname.includes(path)
  );
}

function isAuthPath(pathname: string) {
  return authPaths.some((path) => pathname.includes(path));
}

export default withAuth(
  function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.nextauth?.token;

    // Redirect authenticated users away from auth pages
    if (isAuthPath(pathname) && token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Apply i18n middleware
    return intlMiddleware(request);
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const { pathname } = req.nextUrl;
        // Allow access to non-protected routes without token
        if (!isProtectedPath(pathname)) return true;
        // Require token for protected routes
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
