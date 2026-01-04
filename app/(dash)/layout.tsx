import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifySession } from "@/lib/dashboardAuth"

export default async function DashLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get("dashboard_token")?.value

  if (!token || !verifySession(token)) {
    redirect("/dashboard/login")
  }

  return <>{children}</>
}
