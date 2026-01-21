import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { username, email, phone, password } = await req.json();

    // ================= VALIDATION =================
    if (!username || !email || !phone || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // ================= PASSWORD LENGTH CHECK =================
    if (password.length <= 8) {
      return NextResponse.json(
        { error: "Password must be more than 8 characters long" },
        { status: 400 }
      );
    }

    // ================= CHECK EXISTING USER =================
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 409 }
      );
    }

    // ================= HASH PASSWORD =================
    const hashedPassword = await bcrypt.hash(password, 10);

    // ================= CREATE COMPANY USER =================
    const user = await User.create({
      username,
      email,
      phone,
      password: hashedPassword,

      // 🔐 IMPORTANT
      role: "company",      // company signs up manually
      companyId: null,      // company owns itself
      isFirstLogin: false,  // company already sets password
    });

    return NextResponse.json(
      {
        success: true,
        message: "Company account created successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("SIGNUP ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
