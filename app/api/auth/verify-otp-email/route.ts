"use server";

import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { otp } = await req.json();

    if (!otp) {
      return NextResponse.json({ error: "OTP is required" }, { status: 400 });
    }

    // Find user with matching OTP
    const user = await User.findOne({ otp: otp.toString() });
    if (!user) {
      // OTP does not match any user
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Check OTP expiry
    const now = new Date();
    if (!user.otpExpiry || user.otpExpiry.getTime() < now.getTime()) {
      // OTP exists but expired
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    // OTP is valid → clear it
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return NextResponse.json({ message: "OTP verified", userId: user._id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
