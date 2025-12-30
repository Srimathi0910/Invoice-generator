import dynamic from "next/dynamic";

// Dynamically import the client component, disable SSR
const InvoicePreview = dynamic(() => import("./InvoicePreview"), { ssr: false });

export default function PreviewPage() {
  return <InvoicePreview />;
}
