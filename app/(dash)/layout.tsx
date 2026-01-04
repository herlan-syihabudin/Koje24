import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dashboardAuth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("dashboard_token")?.value;

  // ❌ BELUM LOGIN → lempar ke login
  if (!token || !verifySession(token)) {
    redirect("/dashboard/login");
  }

  return (
    <div className="min-h-screen bg-[#F4FAFA] p-6">
      {children}
    </div>
  );
}
