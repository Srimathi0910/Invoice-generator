import { Suspense } from "react";
import View from "./View";

export default function PreviewPage() {
  return (
    <Suspense fallback={null}>
      <View />
    </Suspense>
  );
}
