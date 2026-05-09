import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { adminUsersExist } from "@/lib/admin-auth";
import { SetupClient } from "./setup-client";

export const metadata: Metadata = {
  title: "Setup — Stratus Admin",
  robots: { index: false, follow: false },
};

export default async function AdminSetupPage() {
  // Setup is single-use — once an admin exists, redirect to login.
  if (await adminUsersExist()) {
    redirect("/admin/login");
  }
  return <SetupClient />;
}
