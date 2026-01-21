import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }

  const accessToken = jwt.sign(
    { id: payload.id, email: payload.email, role: payload.role },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" }
  );

  const response = NextResponse.json({ message: "Token refreshed" });

  response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });

  response.cookies.set("role", payload.role, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
