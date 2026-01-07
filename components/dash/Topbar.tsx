export default function Topbar() {
  return (
    <header className="border-b bg-white">
      <div className="px-4 md:px-8 py-3 flex items-center justify-between">
        
        {/* LEFT */}
        <div>
          <h1 className="text-base md:text-lg font-semibold text-gray-900">
            Welcome back 👋
          </h1>
          <p className="text-xs text-gray-500">
            Dashboard operasional KOJE24
          </p>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
            Mode: UI only
          </span>
          {/* nanti bisa tambah notif, avatar, search */}
        </div>

      </div>
    </header>
  );
}
