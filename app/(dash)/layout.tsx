// app/(dash)/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, getCookieName } from "@/lib/dashboardAuth";

export default async function DashGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = cookies().get(getCookieName())?.value;
  const session = verifySession(token);

  if (!session) {
    redirect("/dashboard/login");
  }

  return children;
}
