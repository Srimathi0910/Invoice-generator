import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";
import User from "@/models/User";
import sendEmail from "@/lib/sendEmail";
import bcrypt from "bcryptjs";

/* ================= CREATE / UPDATE INVOICE ================= */
export async function POST(req: Request) {
  await connectDB();

  try {
    const data = await req.json();

    const invoiceData = {
      invoiceNumber: data.invoiceNumber,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,

      billedBy: {
        businessName: data.billedBy.businessName,
        email: data.billedBy.email,
        phone: data.billedBy.phone,
        gstin: data.billedBy.gstin,
        address: data.billedBy.address,
        city: data.billedBy.city,
        country: data.billedBy.country,
      },

      billedTo: {
        businessName: data.billedTo.businessName,
        email: data.billedTo.email,
        phone: data.billedTo.phone,
        gstin: data.billedTo.gstin,
        address: data.billedTo.address,
        city: data.billedTo.city,
        country: data.billedTo.country,
      },

      items: data.items || [],
      totals: data.totals || {},
      extras: {
        paymentStatus: "Unpaid",
        paymentMethod: "N/A",
      },
      totalInWords: data.totalInWords || "",
      status: "Unpaid",
    };

    /* ---------- CREATE CLIENT USER IF NOT EXISTS ---------- */
    let clientUser = await User.findOne({ email: invoiceData.billedTo.email });

    if (!clientUser) {
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      clientUser = await User.create({
        username: invoiceData.billedTo.businessName,
        email: invoiceData.billedTo.email,
        phone: invoiceData.billedTo.phone || "",
        contactPerson: data.billedTo.contactPerson || "",
        password: hashedPassword,
        role: "client",
      });


      await sendEmail({
        to: clientUser.email,
        subject: "Invoice Dashboard Login",
        html: `
          <h3>Hello ${clientUser.username}</h3>
          <p>You have received an invoice.</p>
          <p><b>Email:</b> ${clientUser.email}</p>
          <p><b>Password:</b> ${tempPassword}</p>
          <a href="http://localhost:3000/login">Login</a>
        `,
      });
    }

    const invoice = data._id
      ? await Invoice.findByIdAndUpdate(data._id, invoiceData, { new: true })
      : await Invoice.create(invoiceData);

    return new Response(JSON.stringify({ success: true, invoice }), { status: 200 });

  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}

/* ================= COMPANY GET (ALL INVOICES) ================= */
export async function GET() {
  await connectDB();

  const invoices = await Invoice.find().sort({ invoiceDate: -1 });

  return new Response(JSON.stringify(invoices), { status: 200 });
}
