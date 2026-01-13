import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  await connectDB();
  const { email, password } = await req.json();

  // -------------------- CHECK EMAIL AND PASSWORD --------------------
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  // -------------------- PASSWORD LENGTH CHECK --------------------
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters long" },
      { status: 400 }
    );
  }

  const user = await User.findOne({ email });

  // -------------------- INVALID EMAIL --------------------
  if (!user) {
    const res = NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    res.cookies.delete("accessToken");
    res.cookies.delete("refreshToken");
    res.cookies.delete("role");
    return res;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  // -------------------- INVALID PASSWORD --------------------
  if (!isMatch) {
    const res = NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    res.cookies.delete("accessToken");
    res.cookies.delete("refreshToken");
    res.cookies.delete("role");
    return res;
  }

  // -------------------- SUCCESSFUL LOGIN --------------------
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

  const response = NextResponse.json({
    message: "Login successful",
    role: user.role,
    token: accessToken,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });

  // -------------------- SET COOKIES --------------------
  response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });

  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  response.cookies.set("role", user.role, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
