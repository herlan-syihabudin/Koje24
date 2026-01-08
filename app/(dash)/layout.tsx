import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, getCookieName } from "@/lib/dashboardAuth";
import Sidebar from "@/components/(dash)/Sidebar"; // Pastikan path sidebar lo bener

export default async function DashGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value;

  // 🛡️ PROTEKSI: verifySession balikin payload atau null
  const admin = verifySession(token);
  
  if (!admin) {
    redirect("/dashboard/login");
  }

  return (
    <div className="flex h-screen bg-[#F8FAFB] overflow-hidden text-slate-900">
      {/* 🧭 SIDEBAR: Tetap diam di kiri */}
      <aside className="w-64 border-r bg-white h-full flex-shrink-0">
        <Sidebar admin={admin} />
      </aside>

      {/* 🚀 MAIN CONTENT: Bisa discroll sendiri */}
      <main className="flex-1 h-full overflow-y-auto relative scroll-smooth">
        {/* Header bar tipis biar makin pro */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b px-8 py-4 flex justify-between items-center">
          <h1 className="text-sm font-medium text-gray-500 uppercase tracking-widest">
            Toko Koje Internal System
          </h1>
          <div className="flex items-center gap-3">
             <div className="text-right">
                <p className="text-xs font-bold leading-none">{admin.email}</p>
                <p className="text-[10px] text-green-600 font-medium">Administrator</p>
             </div>
             <div className="w-8 h-8 rounded-full bg-[#0FA3A8] text-white flex items-center justify-center text-xs">
                {admin.email.substring(0, 1).toUpperCase()}
             </div>
          </div>
        </header>

        <section className="p-8">
          {children}
        </section>
      </main>
    </div>
  );
}
