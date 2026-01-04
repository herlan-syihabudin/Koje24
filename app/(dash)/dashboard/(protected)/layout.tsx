import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, getCookieName } from "@/lib/dashboardAuth";
import DashboardShellLayout from "@/components/dash/DashboardShellLayout";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get(getCookieName())?.value;
  const v = verifySession(token);

  if (!v.ok) redirect("/dashboard/login");

  return <DashboardShellLayout>{children}</DashboardShellLayout>;
}
