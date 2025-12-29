"use server";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
<<<<<<< HEAD
import * as jwt from "jsonwebtoken";
=======
import jwt from "jsonwebtoken";
>>>>>>> d69b7d5 (Initial commit)
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();

<<<<<<< HEAD
    if (!email)
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    if (!password)
      return NextResponse.json({ error: "Password is required" }, { status: 400 });

    const user = await User.findOne({ email });
    if (!user)
      return NextResponse.json({ error: "Email not found" }, { status: 404 });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });

    // ✅ ACCESS TOKEN (short life recommended)
=======
    // Validate input
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Generate tokens
>>>>>>> d69b7d5 (Initial commit)
    const accessToken = jwt.sign(
      { id: user._id.toString(), email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );

<<<<<<< HEAD
    // ✅ REFRESH TOKEN (long life)
=======
>>>>>>> d69b7d5 (Initial commit)
    const refreshToken = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: "7d" }
    );

<<<<<<< HEAD
    // ✅ Set cookies
=======
    // Prepare response with cookies
>>>>>>> d69b7d5 (Initial commit)
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        phone: user.phone,
      },
    });

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 15, // 15 minutes
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
