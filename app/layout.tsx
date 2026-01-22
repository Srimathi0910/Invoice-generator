import type { Metadata } from "next";
import { Akaya_Telivigala } from "next/font/google";
import "./globals.css";
import ThemeProvider from "./_components/ThemeProvider";
import ConditionalFooter from "./_components/ConditionalFooter";

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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${akayaTelivigala.className} antialiased`}>
        <ThemeProvider>
          {children}
          <ConditionalFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
