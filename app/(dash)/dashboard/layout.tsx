import Topbar from "@/components/dash/Topbar";

export default function DashboardPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F9FBFB]">
      {/* TOP HEADER */}
      <Topbar />

      {/* PAGE CONTENT */}
      <main className="px-4 md:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
