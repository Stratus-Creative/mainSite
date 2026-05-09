import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { adminUsersExist } from "@/lib/admin-auth";
import { SetupClient } from "./setup-client";

export const metadata: Metadata = {
  title: "Setup — Stratus Admin",
  robots: { index: false, follow: false },
};

// Hits Supabase to check whether an admin exists; must run at request time,
// not at build time when env vars may be unavailable.
export const dynamic = "force-dynamic";

export default async function AdminSetupPage() {
  // Setup is single-use — once an admin exists, redirect to login.
  if (await adminUsersExist()) {
    redirect("/admin/login");
  }
  return <SetupClient />;
}
