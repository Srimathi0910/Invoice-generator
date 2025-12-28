import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const pathname = req.nextUrl.pathname;

  // ✅ Public routes (NO LOGIN REQUIRED)
  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/forgot-password-email",
    "/verify-email",
    "/change-password",
  ];

  // ✅ If user is logged in and tries to access auth pages → redirect to dashboard
  if (accessToken && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ❌ If user is NOT logged in and tries to access protected routes → redirect to login
  if (!accessToken && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// ✅ Apply middleware only to required routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/invoices/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
    "/forgot-password-email",
    "/verify-email",
    "/change-password",
  ],
};
