import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dashboardAuth";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get("dashboard_token")?.value;

  if (!token || !verifySession(token)) {
    redirect("/dashboard/login");
  }

  return (
    <div className="min-h-screen flex bg-[#F4FAFA] text-[#0B4B50]">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r px-5 py-6 flex flex-col">
        <div className="mb-8">
          <p className="text-xs tracking-[0.3em] text-[#0FA3A8]">ADMIN</p>
          <h2 className="font-playfair text-xl font-semibold">KOJE24</h2>
        </div>

        <nav className="flex-1 space-y-1 text-sm">
          <SidebarItem href="/dashboard" label="Overview" />
          <SidebarItem href="/dashboard/orders" label="Orders" />
          <SidebarItem href="/dashboard/products" label="Products" />
          <SidebarItem href="/dashboard/reports" label="Reports" />
          <SidebarItem href="/dashboard/settings" label="Settings" />
        </nav>

        <div className="pt-6 border-t">
          <Link
            href="/api/dashboard/logout"
            className="block text-sm text-red-600 hover:underline"
          >
            Logout
          </Link>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

function SidebarItem({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-lg hover:bg-[#EAF6F6]"
    >
      {label}
    </Link>
  );
}
