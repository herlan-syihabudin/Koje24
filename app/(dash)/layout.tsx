import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dashboardAuth";
import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = cookies().get("dashboard_token")?.value;

  // ❌ BELUM LOGIN → TENDANG KE LOGIN
  if (!token || !verifySession(token)) {
    redirect("/dashboard/login");
  }

  return (
    <div className="min-h-screen flex bg-[#F7FBFB]">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
