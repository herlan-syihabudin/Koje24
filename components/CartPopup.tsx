"use client"

import { useEffect, useState, type ChangeEvent } from "react"
import { useCartStore } from "@/stores/cartStore"

type FormState = {
  nama: string
  hp: string
  alamat: string
  catatan: string
  mapsUrl: string
}

type ChangeEvt = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>

type ShippingInfo = {
  distanceKm: number
  zone: "A" | "B" | "C" | "D"
  zoneLabel: string
  ongkir: number | null
}

const ORIGIN_LAT = -6.3180335
const ORIGIN_LNG = 107.0426622

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function getShippingInfo(distanceKm: number): ShippingInfo {
  const d = Math.round(distanceKm * 10) / 10
  if (d <= 5) return { distanceKm: d, zone: "A", zoneLabel: "Zona A (0–5 km)", ongkir: 15000 }
  if (d <= 10) return { distanceKm: d, zone: "B", zoneLabel: "Zona B (5–10 km)", ongkir: 20000 }
  if (d <= 15) return { distanceKm: d, zone: "C", zoneLabel: "Zona C (10–15 km)", ongkir: 30000 }
  return { distanceKm: d, zone: "D", zoneLabel: "Zona D (>15 km – luar jangkauan utama)", ongkir: null }
}

export default function CartPopup() {
  const { items, addItem, removeItem, clearCart, totalPrice } = useCartStore()

  const [form, setForm] = useState<FormState>({
    nama: "",
    hp: "",
    alamat: "",
    catatan: "",
    mapsUrl: "",
  })

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [shipping, setShipping] = useState<ShippingInfo | null>(null)
  const [gpsError, setGpsError] = useState<string | null>(null)

  /* =========================
     OPEN CART LISTENER
  ========================== */
  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener("open-cart", handler)
    return () => window.removeEventListener("open-cart", handler)
  }, [])

  const close = () => {
    setOpen(false)
    setShipping(null)
    setGpsError(null)
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
  }, [open])

  const onChange =
    (key: keyof FormState) =>
    (e: ChangeEvt) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))

  /* ⭐ AMBIL LOKASI GPS */
  const handleGetGps = () => {
    setGpsError(null)
    setGpsLoading(true)

    if (!navigator.geolocation) {
      setGpsError("HP kamu tidak mendukung GPS otomatis.")
      setGpsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        const autoUrl = `https://www.google.com/maps?q=${lat},${lng}`
        setForm((prev) => ({ ...prev, mapsUrl: autoUrl }))

        const jarak = haversineKm(ORIGIN_LAT, ORIGIN_LNG, lat, lng)
        const info = getShippingInfo(jarak)
        setShipping(info)

        setGpsLoading(false)
      },
      (err) => {
        console.error("GPS ERROR:", err)
        setGpsError("Tidak bisa ambil lokasi. Aktifkan GPS & izinkan akses lokasi.")
        setGpsLoading(false)
      },
      { enableHighAccuracy: true }
    )
  }

  /* ⭐ CHECKOUT */
  const handleCheckout = async () => {
    if (!form.nama || !form.hp || !form.alamat) {
      alert("Isi Nama, HP dan Alamat ya 🙏")
      return
    }

    if (!form.mapsUrl.trim()) {
      alert("Ambil lokasi otomatis dulu ya 🙏")
      return
    }

    if (items.length === 0) {
      alert("Keranjang masih kosong 😅")
      return
    }

    setLoading(true)

    const subtotalProduk = totalPrice
    const ongkir = shipping?.ongkir ?? 0
    const totalBayar = subtotalProduk + ongkir

    const text = `
🍹 *Pesanan KOJE24*
------------------------
${items.map((i) => `• ${i.name} × ${i.qty}`).join("\n")}

📞 *HP:* ${form.hp}
👤 *Nama:* ${form.nama}
📍 *Alamat:* ${form.alamat}

📏 *Jarak:* ~${shipping?.distanceKm} km
🗺 *Zona:* ${shipping?.zoneLabel}
🚚 *Ongkir:* ${
      shipping?.ongkir ? "Rp" + shipping.ongkir.toLocaleString("id-ID") : "Hubungi admin"
    }

💰 *Subtotal:* Rp${subtotalProduk.toLocaleString("id-ID")}
💰 *Total Bayar:* Rp${totalBayar.toLocaleString("id-ID")}

🔗 *Lokasi Anda:* ${form.mapsUrl}

Terima kasih sudah order KOJE24 🍹✨
    `.trim()

    window.open(
      `https://wa.me/6282213139580?text=${encodeURIComponent(text)}`,
      "_blank"
    )

    clearCart()
    close()
    setLoading(false)
  }

  /* 🔥 BUG FIX — AUTO RESET FORM KETIKA CART KOSONG 🔥 */
  useEffect(() => {
    if (items.length === 0) {
      setForm({
        nama: "",
        hp: "",
        alamat: "",
        catatan: "",
        mapsUrl: "",
      })
      setShipping(null)
      setGpsError(null)
    }
  }, [items.length])

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={close} />

      <div className="fixed inset-0 grid place-items-center z-[61] p-4">
        <div
          className="bg-white w-full max-w-md rounded-3xl p-6 relative shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-3 right-3 text-xl text-gray-500 hover:text-[#0FA3A8]"
            onClick={close}
          >
            ✕
          </button>

          <h3 className="text-xl font-playfair font-semibold text-[#0B4B50] mb-4">
            Keranjang Kamu
          </h3>

          <div className="max-h-64 overflow-y-auto border-y py-3 mb-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm text-[#0B4B50]">
                <span className="flex-1">{item.name}</span>

                <div className="flex items-center gap-2">
                  <button
                    className="bg-[#E8C46B] text-[#0B4B50] px-3 py-1 rounded-full font-bold"
                    onClick={() => removeItem(item.id)}
                  >
                    –
                  </button>

                  <span className="w-6 text-center">{item.qty}</span>

                  <button
                    className="bg-[#0FA3A8] text-white px-3 py-1 rounded-full font-bold"
                    onClick={() =>
                      addItem({ id: item.id, name: item.name, price: item.price })
                    }
                  >
                    +
                  </button>
                </div>

                <span className="w-20 text-right">
                  Rp{(item.qty * item.price).toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>

          <div className="text-right font-semibold text-[#0B4B50] mb-2">
            Subtotal: Rp{totalPrice.toLocaleString("id-ID")}
          </div>

          <div className="space-y-3 mb-4">
            <input
              type="text"
              placeholder="Nomor HP (WA)"
              value={form.hp}
              onChange={onChange("hp")}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />

            <input
              type="text"
              placeholder="Nama lengkap"
              value={form.nama}
              onChange={onChange("nama")}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />

            <input
              type="text"
              placeholder="Alamat lengkap"
              value={form.alamat}
              onChange={onChange("alamat")}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />

            <button
              onClick={handleGetGps}
              type="button"
              className="w-full bg-[#0FA3A8] text-white rounded-full py-2 font-semibold hover:bg-[#0DC1C7] transition-all"
            >
              {gpsLoading ? "Mengambil Lokasi..." : "📍 Ambil Lokasi Otomatis (GPS)"}
            </button>

            {gpsError && <p className="text-xs text-red-500">{gpsError}</p>}

            {shipping && (
              <div className="mt-2 rounded-xl border border-dashed border-[#0FA3A8]/60 bg-[#F4FAFA] p-3 text-xs text-[#0B4B50] space-y-1">
                <p className="font-semibold">📏 Jarak: ~{shipping.distanceKm} km</p>
                <p className="font-semibold">🗺 {shipping.zoneLabel}</p>
                <p>
                  🚚 Ongkir:{" "}
                  {shipping.ongkir
                    ? "Rp" + shipping.ongkir.toLocaleString("id-ID")
                    : "Hubungi admin"}
                </p>
              </div>
            )}

            <textarea
              placeholder="Catatan tambahan (opsional)…"
              value={form.catatan}
              onChange={onChange("catatan")}
              className="w-full border rounded-lg px-3 py-2 text-sm h-16 resize-none"
            />
          </div>

          <button
            disabled={loading || items.length === 0}
            onClick={handleCheckout}
            className="w-full bg-[#0FA3A8] text-white rounded-full py-3 font-semibold disabled:opacity-50 hover:bg-[#0DC1C7] transition-all"
          >
            {loading ? "Mengirim Pesanan…" : "Checkout & Kirim ke WhatsApp"}
          </button>
        </div>
      </div>
    </>
  )
}
