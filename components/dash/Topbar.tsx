export default function Topbar() {
  return (
    <div className="border-b bg-white">
      <div className="px-4 md:px-8 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">OVERVIEW</p>
          <h1 className="text-xl md:text-2xl font-semibold">Ringkasan KOJE24</h1>
          <p className="text-sm text-gray-600 mt-1">
            Ini dashboard internal untuk pantau order & operasional.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">
            Mode: UI only
          </span>
        </div>
      </div>
    </div>
  );
}
