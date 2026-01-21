// app/api/auth/profile-update/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function PUT(req: Request) {
  try {
    await connectDB();

    // 🔐 Get token from cookie
    const cookieHeader = req.headers.get("cookie");
    const token = cookieHeader
      ?.split("; ")
      .find((c) => c.startsWith("accessToken="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 🔓 Verify token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.id;

    // 📥 Request body
    const { phone, contactPerson, password } = await req.json();

    // 🧠 Build update object
    const updateData: any = {};

    if (phone !== undefined) updateData.phone = phone;
    if (contactPerson !== undefined) updateData.contactPerson = contactPerson;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // 📝 Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // ✅ Return everything EXCEPT email
    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        phone: updatedUser.phone,
        contactPerson: updatedUser.contactPerson,
        role: updatedUser.role,
      },
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}




// app/api/auth/profile-update/route.ts
export async function GET(req: Request) {
  try {
    await connectDB();

    // 🔐 Get token from cookie
    const cookieHeader = req.headers.get("cookie");
    const token = cookieHeader
      ?.split("; ")
      .find((c) => c.startsWith("accessToken="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 🔓 Verify token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.id;

    // 🧠 Fetch user by ID
    const user = await User.findById(userId).select(
      "username email phone contactPerson role"
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Fetch profile error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
