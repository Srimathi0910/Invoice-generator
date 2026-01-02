import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("logo") as File;

    if (!file) {
      return NextResponse.json({ message: "No file" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "company-logos" }, (err, res) => {
          if (err) reject(err);
          resolve(res);
        })
        .end(buffer);
    });

    return NextResponse.json({ logoUrl: result.secure_url });
  } catch (err) {
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
