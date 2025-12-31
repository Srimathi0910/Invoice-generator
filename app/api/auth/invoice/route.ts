import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";
import User from "@/models/User";
import sendEmail from "@/lib/sendEmail";
import bcrypt from "bcryptjs";

/* ---------------- CREATE / UPDATE INVOICE ---------------- */
export async function POST(req: Request) {
  await connectDB();

  try {
    const data = await req.json();

    const billedBy = {
      country: data.billedBy.country || "",
      businessName: data.billedBy.businessName || "",
      email: data.billedBy.email || "",
      phone: data.billedBy.phone || "",
      gstin: data.billedBy.gstin || "",
      address: data.billedBy.address || "",
      city: data.billedBy.city || "",
    };

    const billedTo = {
      country: data.billedTo.country || "",
      businessName: data.billedTo.businessName || "",
      email: data.billedTo.email || "",
      phone: data.billedTo.phone || "",
      gstin: data.billedTo.gstin || "",
      address: data.billedTo.address || "",
      city: data.billedTo.city || "",
    };

    const invoiceData = {
      invoiceNumber: data.invoiceNumber,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      billedBy,
      billedTo,
      items: data.items || [],
      extras: data.extras || {},
      totals: data.totals || {},
      totalInWords: data.totalInWords || "",
      status: data.status || "Unpaid",
    };

    /* ---------------- CLIENT USER ---------------- */
    let clientUser = await User.findOne({ email: billedTo.email });

    let tempPassword: string | null = null;

    // Create new client only if not exists
    if (!clientUser) {
      tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      clientUser = await User.create({
        username: billedTo.businessName,
        email: billedTo.email,
        password: hashedPassword,
        role: "client",
      });

      /* ---------------- SEND EMAIL ---------------- */
      await sendEmail({
        to: clientUser.email,
        subject: "Invoice Dashboard Login Details",
        html: `
          <h2>Hello ${clientUser.username}</h2>
          <p>You have received a new invoice.</p>

          <h3>Login Credentials</h3>
          <p><b>Email:</b> ${clientUser.email}</p>
          <p><b>Password:</b> ${tempPassword}</p>

          <p>
            <a href="http://localhost:3000/client/dashboard">
              Login to Dashboard
            </a>
          </p>

          <p style="color:red;">
            Please change your password after login.
          </p>
        `,
      });
    }

    /* ---------------- SAVE INVOICE ---------------- */
    let invoice;
    if (data._id) {
      invoice = await Invoice.findByIdAndUpdate(data._id, invoiceData, { new: true });
    } else {
      invoice = new Invoice(invoiceData);
      await invoice.save();
    }

    return new Response(JSON.stringify({ success: true, invoice }), {
      status: data._id ? 200 : 201,
    });
  } catch (err: any) {
    console.error("Error saving invoice:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}

/* ---------------- GET INVOICES FOR CLIENT ---------------- */
export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
  }

  try {
    // Fetch invoices where billedTo.email matches client
    const invoices = await Invoice.find({ "billedTo.email": email }).sort({ invoiceDate: -1 });

    return new Response(JSON.stringify(invoices), { status: 200 });
  } catch (err: any) {
    console.error("Error fetching invoices:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch invoices" }), { status: 500 });
  }
}
