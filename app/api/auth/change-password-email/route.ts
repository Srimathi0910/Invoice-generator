"use server";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { newPassword, confirmPassword } = await req.json();

    // 1️⃣ Check empty fields
    if (!newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "New password and confirm password are required" },
        { status: 400 }
      );
    }

    // 2️⃣ Length validation (MORE THAN 8 characters)
    if (newPassword.length <= 8 || confirmPassword.length <= 8) {
      return NextResponse.json(
        { error: "Password must be more than 8 characters" },
        { status: 400 }
      );
    }

    // 3️⃣ Match validation
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // 4️⃣ Find last verified user
    const user = await User.findOne().sort({ updatedAt: -1 });
    if (!user) {
      return NextResponse.json(
        { error: "No user available to reset password" },
        { status: 400 }
      );
    }

    // 5️⃣ Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    return NextResponse.json({
      message: "Password reset successfully",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
