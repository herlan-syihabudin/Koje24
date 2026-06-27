export default function SettingToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (val: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <button onClick={() => onChange(!value)} className={`relative w-12 h-6 rounded-full transition ${value ? "bg-[#0FA3A8]" : "bg-gray-300"}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${value ? "right-1" : "left-1"}`} />
      </button>
    </div>
  );
}
