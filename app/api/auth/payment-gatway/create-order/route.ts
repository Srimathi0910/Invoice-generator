import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  const { amount } = await req.json(); // Amount in rupees

  const options = {
    amount: amount * 100, // Razorpay amount is in paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
    payment_capture: 1, // auto capture
  };

  const order = await razorpay.orders.create(options);

  return NextResponse.json({ order });
}
