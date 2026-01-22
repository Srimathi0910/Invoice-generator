import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";
import { sendContactMail } from "@/lib/sendContactMail";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Save to DB
    const contact = await ContactMessage.create({
      name,
      email,
      message,
    });

    // Send Email
    await sendContactMail({ name, email, message });

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      data: contact,
    });
  } catch (error) {
    console.error("CONTACT ERROR 👉", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
