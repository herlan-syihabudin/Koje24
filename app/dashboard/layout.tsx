import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCookieName, verifySession } from "@/lib/dashboardAuth";
import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get(getCookieName())?.value;
  const ses = verifySession(token);

  // Biarkan login page tidak ke-redirect (di-handle di page login)
  // Tapi layout ini dipakai untuk semua /dashboard/* termasuk /dashboard/login
  // Solusi: bikin folder (dashboard)/ untuk route group, atau cek pathname di middleware.
  // Cara paling simpel: layout ini khusus untuk /dashboard (bukan /dashboard/login)
  // => kita bikin login di /dashboard-login agar clean. Tapi kamu minta /dashboard/login.
  // Jadi: kita pakai "route group" di bawah.

  if (!ses.ok) redirect("/dashboard/login");

  return (
    <div className="min-h-screen bg-[#F4FAFA] text-[#0B4B50]">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          <Sidebar />
          <main className="bg-white border rounded-3xl shadow p-5 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
