// lib/promos.ts — FINAL SAFE VERSION
export type Promo = {
  kode: string
  tipe: "Diskon" | "Potongan" | "Free Ongkir" | "Cashback"
  nilai: number
  minimal: number
  maxDiskon: number | null
  status: string
}

// helper: konversi % & Rp jadi angka murni
const toNumber = (v: string): number => {
  if (!v) return 0
  if (v.includes("%")) return Number(v.replace("%", "").trim())
  return Number(v.replace(/\D/g, "")) || 0
}

export async function fetchPromos(): Promise<Promo[]> {
  try {
    const res = await fetch("/api/promos", { cache: "no-store" })
    const rows = await res.json()

    return rows.map((r: any) => ({
      kode: r.kode,
      tipe: r.tipe,
      nilai: toNumber(r.nilai),
      minimal: toNumber(r.minimal),
      maxDiskon:
        r.maxDiskon === "-" || !r.maxDiskon ? null : toNumber(r.maxDiskon),
      status: r.status || "Tidak Aktif",
    }))
  } catch (err) {
    console.error("Fetch promos ERROR:", err)
    return []
  }
}
