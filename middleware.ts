import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  let pathname = req.nextUrl.pathname;

  // Remove trailing slash (except for root)
  if (pathname !== "/" && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }

  const publicRoutes = [
    "/", // landing page always allowed
    "/login",
    "/signup",
    "/forgot-password-email",
    "/verify-email",
    "/change-password",
  ];

  const companyRoutes = [
    "/dashboard",
    "/clients",
    "/reports",
    "/payments",
    "/settings",
    "/preview",
    "/company-new-invoice",
  ];

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

  /* ---------------- ALWAYS ALLOW LANDING PAGE ---------------- */
  if (pathname === "/") {
    // Landing page is accessible for everyone
    return NextResponse.next();
  }

  /* ---------------- PROTECT PRIVATE ROUTES ---------------- */
  if (!accessToken) {
    // Not logged in, redirect only if trying to access private routes
    if (!publicRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next(); // allow public route like /login
  }

  /* ---------------- ROLE PROTECTION ---------------- */
  if (
    role === "company" &&
    clientRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"))
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (
    role === "client" &&
    companyRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"))
  ) {
    return NextResponse.redirect(new URL("/dashboard-client", req.url));
  }

  // Otherwise, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
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
    "/reports-client/:path",
    "/profile/:path*",
    "/help/:path*",
    "/login",
    "/signup",
    "/forgot-password-email",
    "/verify-email",
    "/change-password",
  ],
};
