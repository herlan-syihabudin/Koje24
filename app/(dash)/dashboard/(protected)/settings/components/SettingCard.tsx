export default function SettingCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-3 border-b bg-gray-50 flex items-center gap-2">
        <Icon className="w-4 h-4 text-[#0FA3A8]" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}
