import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const role = req.cookies.get("role")?.value; // 👈 NEW
  const pathname = req.nextUrl.pathname;

  /* ---------------- PUBLIC ROUTES ---------------- */
  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/forgot-password-email",
    "/verify-email",
    "/change-password",
  ];

  /* ---------------- ROLE ROUTES ---------------- */
  const companyRoutes = ["/dashboard", "/invoices", "/settings"];
  const clientRoutes = ["/dashboard-client", "/client-invoices"];

  /* ---------------- AUTH LOGIC ---------------- */

  // Logged in user should not visit auth pages
  if (accessToken && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(
      new URL(
        role === "company" ? "/dashboard" : "/dashboard-client",
        req.url
      )
    );
  }

  // Not logged in → block protected routes
  if (!accessToken && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  /* ---------------- ROLE PROTECTION ---------------- */

  // Company trying to access client routes
  if (role === "company" && clientRoutes.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Client trying to access company routes
  if (role === "client" && companyRoutes.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/dashboard-client", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/invoices/:path*",
    "/settings/:path*",
    "/client-dashboard/:path*",
    "/client-invoices/:path*",
    "/profile/:path*",
    "/login",
    "/signup",
    "/forgot-password-email",
    "/verify-email",
    "/change-password",
  ],
};
