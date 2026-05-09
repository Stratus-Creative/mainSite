import type { Metadata } from "next";
import { AdminLoginClient } from "./login-client";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <AdminLoginClient />;
}
