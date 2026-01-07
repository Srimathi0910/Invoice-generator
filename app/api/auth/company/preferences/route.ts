import { connectDB } from "@/lib/db";
import NotificationPreference from "@/models/NotificationPreference";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  await connectDB();

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

  const userId = decoded.id;

  const preferences = await req.json();

  await NotificationPreference.findOneAndUpdate(
  { userId },
  { $set: preferences },
  { upsert: true, new: true }
);


  return Response.json({ message: "Preferences saved" });
}
export async function GET(req: Request) {
  await connectDB();

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

  const userId = decoded.id;

  const preferences = await NotificationPreference.findOne({ userId });

  return Response.json({ preferences });
}
