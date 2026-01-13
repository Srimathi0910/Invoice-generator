import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import NotificationPreference from "@/models/NotificationPreference";
import jwt from "jsonwebtoken";

/* ---------------- SAVE PREFERENCES ---------------- */
export async function POST(req: NextRequest) {
  await connectDB();

  try {
    // Get token from cookies
    const token = req.cookies.get("accessToken")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.id || decoded.userId || decoded._id;

    if (!userId) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    // Parse preferences from request body
    const preferences = await req.json();

    // Use only userId for upsert, do NOT include email
    await NotificationPreference.findOneAndUpdate(
      { userId },           // filter by userId
      { $set: preferences }, // set preferences
      { upsert: true, new: true } // create if not exists
    );

    return NextResponse.json({ message: "Preferences saved" });
  } catch (err: any) {
    console.error("PREFERENCES POST ERROR:", err);
    return NextResponse.json(
      {
        message:
          err.name === "TokenExpiredError"
            ? "ACCESS_TOKEN_EXPIRED"
            : "Error saving preferences",
      },
      { status: 401 }
    );
  }
}

/* ---------------- GET PREFERENCES ---------------- */
export async function GET(req: NextRequest) {
  await connectDB();

  try {
    // Get token from cookies
    const token = req.cookies.get("accessToken")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.id || decoded.userId || decoded._id;

    if (!userId) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    // Fetch preferences by userId
    const preferences = await NotificationPreference.findOne({ userId }).lean();

    return NextResponse.json({ preferences: preferences || {} });
  } catch (err: any) {
    console.error("PREFERENCES GET ERROR:", err);
    return NextResponse.json(
      {
        message:
          err.name === "TokenExpiredError"
            ? "ACCESS_TOKEN_EXPIRED"
            : "Error fetching preferences",
      },
      { status: 401 }
    );
  }
}
