// app/api/auth/profile-update/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function PUT(req: Request) {
  try {
    await connectDB();

    const cookieHeader = req.headers.get("cookie");
    const token = cookieHeader
      ?.split("; ")
      .find((c) => c.startsWith("accessToken="))
      ?.split("=")[1];

    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.id;

    const { phone, contactPerson, password } = await req.json();

    const updateData: any = {};
    if (phone) updateData.phone = phone;
    if (contactPerson) updateData.contactPerson = contactPerson;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true });

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        email: updatedUser.email,
        phone: updatedUser.phone,
        contactPerson: updatedUser.contactPerson,
      },
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
