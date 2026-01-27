import { Suspense } from "react";
import ViewPDF from "./ViewPDF";

export default function PreviewPage() {
  return (
    <Suspense fallback={null}>
      <ViewPDF />
    </Suspense>
  );
}
