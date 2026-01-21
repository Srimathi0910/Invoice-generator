"use server";

import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = expiry;
    await user.save();

    // SMS integration goes here
    console.log(`OTP for ${phone}: ${otp}`);

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
