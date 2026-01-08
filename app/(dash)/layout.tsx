import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dashboardAuth.server";
import { COOKIE_NAME } from "@/lib/dashboardAuth.edge";

export default async function DashGroupLayout({ children }: any) {
  const token = cookies().get(COOKIE_NAME)?.value;
  const admin = verifySession(token);

  if (!admin) redirect("/dashboard/login");

  return children;
}
