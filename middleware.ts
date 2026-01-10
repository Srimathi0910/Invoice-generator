import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  let pathname = req.nextUrl.pathname;
  if (pathname !== "/" && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }

  const publicRoutes = [
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
    "/help",
  ];

  const accessToken = req.cookies.get("accessToken")?.value;
  const role = req.cookies.get("role")?.value;

  /* ---------------- NOT LOGGED IN ---------------- */
  if (!accessToken && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  /* ---------------- LOGGED IN ---------------- */
  if (accessToken && role && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(
      new URL(
        role === "company" ? "/dashboard" : "/dashboard-client",
        req.url
      )
    );
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

  return NextResponse.next();
}

export const config = {
  matcher: [
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
    "/profile/:path*",
    "/help/:path*",
    "/login",
    "/signup",
    "/forgot-password-email",
    "/verify-email",
    "/change-password",
  ],
};
