import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  let { pathname } = req.nextUrl;

  // Normalize pathname (remove trailing slash)
  if (pathname !== "/" && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }

  // ---------------- PUBLIC ROUTES ----------------
  const publicRoutes = [
    "/", // landing page
    "/login",
    "/signup",
    "/forgot-password-email",
    "/verify-email",
    "/change-password",
    "/contact",
  ];

  // ---------------- COMPANY ROUTES ----------------
  const companyRoutes = [
    "/dashboard",
    "/clients",
    "/reports",
    "/payments",
    "/settings",
    "/preview",
    "/company-new-invoice",
  ];

  // ---------------- CLIENT ROUTES ----------------
  const clientRoutes = [
    "/dashboard-client",
    "/myInvoices",
    "/payment-client",
    "/profile",
    "/reports-client",
    "/help",
  ];

  const accessToken = req.cookies.get("accessToken")?.value;
  const role = req.cookies.get("role")?.value;

  // ---------------- ALWAYS ALLOW PUBLIC ROUTES ----------------
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // ---------------- PROTECT PRIVATE ROUTES ----------------
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ---------------- ROLE PROTECTION ----------------
  if (role === "company" && clientRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (role === "client" && companyRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    return NextResponse.redirect(new URL("/dashboard-client", req.url));
  }

  // ---------------- ALLOW ALL OTHER ACCESS ----------------
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/", // landing page
    "/login",
    "/signup",
    "/forgot-password-email",
    "/verify-email",
    "/change-password",
    "/contact",
    "/dashboard/:path*",
    "/clients/:path*",
    "/reports/:path*",
    "/payments/:path*",
    "/settings/:path*",
    "/preview/:path*",
    "/company-new-invoice/:path*",
    "/dashboard-client/:path*",
    "/myInvoices/:path*",
    "/payment-client/:path*",
    "/reports-client/:path*",
    "/profile/:path*",
    "/help/:path*",
  ],
};
