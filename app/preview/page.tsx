import { Suspense } from "react";
import InvoicePreview from "./InvoicePreview";

export default function PreviewPage() {
  return (
    <Suspense fallback={null}>
      <InvoicePreview />
    </Suspense>
  );
}
