"use server";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  await connectDB();
  const { newPassword, confirmPassword, token, email } = await req.json();

  if (!newPassword || !confirmPassword || !token || !email)
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });

  if (newPassword.length <= 8)
    return NextResponse.json({ error: "Password must be more than 8 characters" }, { status: 400 });

  if (newPassword !== confirmPassword)
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });

  const user = await User.findOne({
    email,
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return NextResponse.json({ message: "Password changed successfully" });
}
