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
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 border-r bg-white flex-shrink-0 overflow-y-auto">
        <Sidebar />
      </aside>

      {/* MAIN AREA */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        {/* TOPBAR */}
        <div className="flex-shrink-0">
          <Topbar />
        </div>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}
