export type Promo = {
  kode: string
  tipe: "Diskon" | "Potongan" | "Free Ongkir" | "Cashback"
  nilai: number
  minimal: number
  maxDiskon: number | null
  status: string
}

// Convert angka — aman buat Rp & %
const toNumber = (v: any): number => {
  if (!v) return 0
  if (typeof v === "number") return v
  if (v.includes("%")) return Number(v.replace("%", "").trim())
  return Number(v.replace(/\D/g, "")) || 0
}

export async function fetchPromos(): Promise<Promo[]> {
  try {
    // ❗ fetch wajib di sisi client, bukan build server
    const res = await fetch("/api/promos", {
      method: "GET",
      cache: "no-store",
    })

    if (!res.ok) return []

    const rows = await res.json()
    if (!Array.isArray(rows)) return []

    return rows.map((r: any) => ({
      kode: String(r.kode || "").trim(),
      tipe: r.tipe || "Potongan",
      nilai: toNumber(r.nilai),
      minimal: toNumber(r.minimal),
      maxDiskon:
        !r.maxDiskon || r.maxDiskon === "-" ? null : toNumber(r.maxDiskon),
      status: String(r.status || "Tidak Aktif"),
    }))
  } catch (err) {
    console.error("Fetch promos ERROR:", err)
    return []
  }
}
