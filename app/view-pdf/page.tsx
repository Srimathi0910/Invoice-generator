import { Suspense } from "react";
import ViewPDF from "./ViewPDf";

export default function PreviewPage() {
  return (
    <Suspense fallback={null}>
      <ViewPDF />

    </Suspense>
  );
}
