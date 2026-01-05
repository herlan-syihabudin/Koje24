export default function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* HEADER */}
      <div>
        <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">SYSTEM</p>
        <h1 className="text-2xl font-semibold">Pengaturan Sistem</h1>
        <p className="text-sm text-gray-600 mt-1">
          Konfigurasi akses, pembayaran, pengiriman, dan keamanan.
        </p>
      </div>

      {/* ACCESS */}
      <Section title="Admin & Akses">
        <SettingItem
          title="Manajemen Admin"
          desc="Tambah, edit, dan atur peran admin."
        />
        <SettingItem
          title="Hak Akses"
          desc="Kontrol modul yang bisa diakses setiap role."
        />
      </Section>

      {/* PAYMENT */}
      <Section title="Metode Pembayaran">
        <SettingItem
          title="Transfer Bank"
          desc="Atur rekening & instruksi pembayaran."
        />
        <SettingItem
          title="Payment Gateway"
          desc="Integrasi Midtrans / Xendit (Tahap berikutnya)."
        />
      </Section>

      {/* SHIPPING */}
      <Section title="Pengiriman & Ongkir">
        <SettingItem
          title="Kurir"
          desc="Aktifkan / nonaktifkan kurir pengiriman."
        />
        <SettingItem
          title="Aturan Ongkir"
          desc="Pengaturan jarak & wilayah pengiriman."
        />
      </Section>

      {/* SECURITY */}
      <Section title="Keamanan">
        <SettingItem
          title="Session Login"
          desc="Pengaturan durasi login admin."
        />
        <SettingItem
          title="Log Aktivitas"
          desc="Catatan aktivitas admin & perubahan sistem."
        />
      </Section>

      {/* NOTE */}
      <div className="border rounded-2xl p-4 bg-[#F7FBFB]">
        <p className="text-sm font-semibold">Catatan Tahap E3</p>
        <p className="text-sm text-gray-600 mt-1">
          Modul pengaturan masih UI only.
          Seluruh konfigurasi akan diaktifkan bertahap setelah alur order & keuangan stabil.
        </p>
      </div>

    </div>
  );
}

/* --- COMPONENTS --- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b bg-gray-50">
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="divide-y">{children}</div>
    </div>
  );
}

function SettingItem({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="p-5 flex items-center justify-between">
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{desc}</p>
      </div>
      <button className="text-sm text-[#0FA3A8] font-medium hover:underline">
        Kelola
      </button>
    </div>
  );
}
