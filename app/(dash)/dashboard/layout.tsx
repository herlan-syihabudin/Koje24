import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dashboardAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = cookies().get("dashboard_token")?.value;

  if (!token || !verifySession(token)) {
    redirect("/dashboard/login");
  }

  return children; // ⬅️ cuma guard
}
