import type { Metadata } from "next";
import { Akaya_Telivigala, Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "./_components/ThemeProvider";
import ConditionalFooter from "./_components/ConditionalFooter";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={inter.variable}>
      <body className={`${akayaTelivigala.className} antialiased`}>
        <ThemeProvider>
          {children}
          <ConditionalFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
