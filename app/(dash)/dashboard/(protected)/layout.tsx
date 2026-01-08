import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, getCookieName } from "@/lib/dashboardAuth";

import Sidebar from "@/components/dash/Sidebar";
import Topbar from "@/components/dash/Topbar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value;

  const session = verifySession(token);

if (!session) {
  redirect("/dashboard/login");
}

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* SIDEBAR */}
      <aside className="w-64 border-r bg-white">
        <Sidebar />
      </aside>

      {/* CONTENT */}
      <main className="flex-1">
        <Topbar />
        <div className="px-6 py-4">{children}</div>
      </main>
    </div>
  );
}
