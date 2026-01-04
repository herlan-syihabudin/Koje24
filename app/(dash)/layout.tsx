import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, getCookieName } from "@/lib/dashboardAuth";

export default function DashGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = cookies().get(getCookieName())?.value;
  const v = verifySession(token);

  if (!v.ok) {
    redirect("/dashboard/login");
  }

  return children;
}
