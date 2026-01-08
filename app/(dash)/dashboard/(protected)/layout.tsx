import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, getCookieName } from "@/lib/dashboardAuth";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = cookies().get(getCookieName())?.value;
  const admin = verifySession(token);

  if (!admin) {
    redirect("/dashboard/login");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* SIDEBAR FIX */}
      <aside className="w-64 border-r bg-white flex-shrink-0">
        <Sidebar />
      </aside>

      {/* CONTENT SCROLL */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
