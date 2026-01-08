import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, getCookieName } from "@/lib/dashboardAuth";
import Sidebar from "@/components/dash/Sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = cookies().get(getCookieName())?.value;
  const admin = verifySession(token);

  if (!admin) redirect("/dashboard/login");

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* SIDEBAR — DIAM */}
      <aside className="w-64 border-r bg-white flex-shrink-0">
        <Sidebar admin={admin} />
      </aside>

      {/* CONTENT — SCROLL */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 glass-header border-b px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xs tracking-widest text-gray-500 uppercase">
              Toko Koje Internal System
            </h1>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold">{admin.email}</p>
                <p className="text-[10px] text-green-600">Administrator</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#0FA3A8] text-white flex items-center justify-center text-xs">
                {admin.email[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <section className="p-8">{children}</section>
      </main>
    </div>
  );
}
