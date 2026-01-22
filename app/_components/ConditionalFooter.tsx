"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

const ConditionalFooter = () => {
  const pathname = usePathname();

  const hideFooterRoutes = [
     "/", // landing page always allowed
    "/login",
    "/signup",
    "/forgot-password-email",
    "/verify-email",
    "/change-password",
  ];

  if (hideFooterRoutes.includes(pathname)) {
    return null;
  }

  return <Footer />;
};

export default ConditionalFooter;
