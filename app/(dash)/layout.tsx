import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession, getCookieName } from "@/lib/dashboardAuth";

export default function DashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
