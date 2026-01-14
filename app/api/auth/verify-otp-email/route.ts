"use server";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user || !user.otp || !user.otpExpiry) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const isValid = await bcrypt.compare(otp, user.otp);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (user.otpExpiry.getTime() < Date.now()) {
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return NextResponse.json({ message: "OTP verified" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
