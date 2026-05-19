import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, getCookieName } from "@/lib/dashboardAuth";

import Sidebar from "@/components/dash/Sidebar";
import TopbarClient from "@/components/dash/TopbarClient";

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

  // 🔥 FIX: Ambil dari session atau default (karena verifySession return type beda)
  const user = {
    name: "Admin",
    email: session.email || "admin@koje24",
    initial: "A",
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <aside className="w-64 border-r bg-white flex-shrink-0 overflow-y-auto">
        <Sidebar />
      </aside>

      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <div className="flex-shrink-0">
          <TopbarClient user={user} />
        </div>

        <main className="flex-1 overflow-y-auto min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}
