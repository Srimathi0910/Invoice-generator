import type { Metadata } from "next";
import { Akaya_Telivigala } from "next/font/google";
import "./globals.css";

const akayaTelivigala = Akaya_Telivigala({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-akaya",
});

export const metadata: Metadata = {
  title: "Invoice Generator",
  description: "Invoice Generator SaaS Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${akayaTelivigala.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
