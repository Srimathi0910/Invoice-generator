import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  await connectDB();
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password required" },
      { status: 400 }
    );
  }

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const accessToken = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }
  );

  // Include token in JSON response for frontend
  const response = NextResponse.json({
    message: "Login successful",
    role: user.role,
    token: accessToken, // <--- add this
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });

  // Set cookies
  response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15, // 15 minutes
  });

  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  response.cookies.set("role", user.role, {
    httpOnly: false, // frontend can access it
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
