"use server";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export async function POST(req: Request) {
  try {
    await connectDB();
    const {  newPassword, confirmPassword } = await req.json();

    if ( !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "Phone, new password, and confirm password are required" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    const user = await User.findOne({ phone });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
