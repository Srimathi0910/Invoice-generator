"use server";

import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  await connectDB();
  const { email } = await req.json();

  if (!email)
    return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const user = await User.findOne({ email });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Generate a random token
  const token = crypto.randomBytes(32).toString("hex");

  // Set token and expiry (3 hours)
  user.resetPasswordToken = token;
  user.resetPasswordExpires = new Date(Date.now() + 3 * 60 * 60 * 1000);
  await user.save();

  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/change-password?token=${token}&email=${encodeURIComponent(email)}`;

  // Configure nodemailer
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  // Send email
  await transporter.sendMail({
    from: `"Support Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Arial, sans-serif; color: #24292f; padding: 20px; max-width: 600px; margin: auto; line-height: 1.5;">
        <h2 style="font-size: 20px; font-weight: bold;">We heard that you lost your password</h2>
        <p style="font-size: 16px; margin: 10px 0;">
          Sorry about that! But don’t worry, you can use the button below to reset your password.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="
               display: inline-block;
               padding: 12px 24px;
               font-size: 16px;
               font-weight: 600;
               color: #000000;
               background-color: #D9D9D9;
               border-radius: 6px;
               text-decoration: none;
             ">
            Reset your password
          </a>
        </div>

        <p style="font-size: 14px; color: #6a737d;">
          If you don’t use this link within 3 hours, it will expire. You can request a new password reset link any time.
        </p>

        <p style="margin-top: 20px; font-size: 16px;">
          Thanks,<br/>
          The Support Team
        </p>
      </div>
    `,
  });

  return NextResponse.json({ message: "Reset link sent to your email" });
}
