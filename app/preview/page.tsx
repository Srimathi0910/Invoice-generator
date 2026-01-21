import { Suspense } from "react";
import InvoicePreview from "./InvoicePreview";

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading preview...</div>}>
      <InvoicePreview />
    </Suspense>
  );
}
