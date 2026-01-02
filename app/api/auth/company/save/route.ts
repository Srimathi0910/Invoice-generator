import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Company from "@/models/CompanySetting";

export async function POST(req: Request) {
  const { userId, logoUrl } = await req.json();

  await connectDB();

  const company = await Company.findOneAndUpdate(
    { userId },
    { logoUrl },
    { upsert: true, new: true }
  );

  return NextResponse.json(company);
}
