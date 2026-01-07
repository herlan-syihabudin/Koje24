export default function Topbar() {
  return (
    <header className="border-b bg-white">
      <div className="px-4 md:px-8 py-4 flex items-center justify-between">
        
        {/* LEFT */}
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-gray-900">
            Welcome back 👋
          </h1>
          <p className="text-sm text-gray-500">
            Dashboard operasional KOJE24
          </p>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">
            Mode: UI only
          </span>
          {/* nanti bisa tambah notif, avatar, search */}
        </div>

      </div>
    </header>
  );
}
