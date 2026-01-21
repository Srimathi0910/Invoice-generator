import cloudinary from "@/lib/cloudinary";
import streamifier from "streamifier";

export function uploadPdfToCloudinary(buffer: Buffer, invoiceNo: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",  // important for PDFs
        folder: "invoices",
        public_id: `Invoice-${invoiceNo}`,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(error);
        }
        resolve(result!.secure_url); // this URL is the PDF
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}
