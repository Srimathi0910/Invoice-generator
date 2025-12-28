"use server";

import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  await connectDB();

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ error: "Email not found" }, { status: 404 });

  // Generate 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Save in correct field
  user.otp = otp;
  user.otpExpiry = expiry;
  await user.save();

  // Send OTP via email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use App Password
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "OTP for Password Reset",
    text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
  });

  return NextResponse.json({ message: "OTP sent" });
}
