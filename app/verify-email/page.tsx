import { Suspense } from "react";
import VerifyEmail from "./VerifyEmailClient";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Verifying email...</div>}>
      <VerifyEmail />
    </Suspense>
  );
}
