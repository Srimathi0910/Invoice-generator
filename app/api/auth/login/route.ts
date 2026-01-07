import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
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
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ INCLUDE ROLE IN JWT
    const accessToken = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role, // 🔥 REQUIRED
        email: user.email, 
      },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    const response = NextResponse.json({
      message: "Login successful",
      role: user.role,
      companyId: user.companyId,
      user: {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        companyId: user.companyId, // optional to send
      },
      token: accessToken // <-- add this
    });



    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 15,
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
