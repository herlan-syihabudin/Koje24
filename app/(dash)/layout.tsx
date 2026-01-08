import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, getCookieName } from "@/lib/dashboardAuth";

export default async function DashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies(); // 🔑 WAJIB await
  const token = cookieStore.get(getCookieName())?.value;

  const session = verifySession(token);

  if (!session) {
    redirect("/dashboard/login");
  }

  return children;
}
