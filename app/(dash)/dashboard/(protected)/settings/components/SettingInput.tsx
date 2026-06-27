export default function SettingInput({ label, value, onChange, type = "text", suffix, icon, textarea = false, placeholder = "" }: any) {
  const displayValue = type === "currency" && typeof value === "number" ? value.toLocaleString("id-ID") : value;
  const handleChange = (e: any) => {
    let val = e.target.value;
    if (type === "number") val = Number(val);
    if (type === "currency") val = Number(val.replace(/\D/g, ""));
    onChange(val);
  };
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
        {textarea ? (
          <textarea value={value} onChange={handleChange} rows={2} placeholder={placeholder}
            className={`w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0FA3A8] ${icon ? "pl-10" : ""}`} />
        ) : (
          <input type={type === "currency" ? "text" : type} value={type === "currency" ? displayValue : value} onChange={handleChange}
            placeholder={placeholder}
            className={`w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0FA3A8] ${icon ? "pl-10" : ""}`} />
        )}
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{suffix}</span>}
      </div>
    </div>
  );
}
