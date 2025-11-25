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

type CartItemType = {
  id: string
  name: string
  price: number
  qty: number
}

type ShippingInfo = {
  distanceKm: number
  zone: "A" | "B" | "C" | "D"
  zoneLabel: string
  ongkir: number | null
}

// 📍 KOORDINAT BASE KOJE24 (GANTI SEKALI AJA PAKAI TITIK TOKO / RUMAH)
const ORIGIN_LAT = -6.3180335  // TODO: ganti dengan latitude KOJE24
const ORIGIN_LNG = 107.0426622 // TODO: ganti dengan longitude KOJE24

// 👉 ambil lat/lng dari URL Google Maps
function extractLatLngFromUrl(url: string): { lat: number; lng: number } | null {
  try {
    const clean = url.trim()

    // Pola 1: .../@-6.123456,107.123456,17z
    const atMatch = clean.match(/@(-?\d+\.\d+),\s*(-?\d+\.\d+)/)
    if (atMatch) {
      const lat = parseFloat(atMatch[1])
      const lng = parseFloat(atMatch[2])
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
    }

    // Pola 2: !3dLAT!4dLNG
    const dMatch = clean.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
    if (dMatch) {
      const lat = parseFloat(dMatch[1])
      const lng = parseFloat(dMatch[2])
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
    }

    // Pola 3: q=LAT,LNG
    const qMatch = clean.match(/q=(-?\d+\.\d+),\s*(-?\d+\.\d+)/)
    if (qMatch) {
      const lat = parseFloat(qMatch[1])
      const lng = parseFloat(qMatch[2])
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
    }

    return null
  } catch {
    return null
  }
}

// 👉 hitung jarak pakai rumus haversine
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const R = 6371 // km

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// 👉 mapping jarak → zona + ongkir
function getShippingInfo(distanceKm: number): ShippingInfo {
  const d = Math.round(distanceKm * 10) / 10 // 1 decimal
  if (d <= 5) {
    return {
      distanceKm: d,
      zone: "A",
      zoneLabel: "Zona A (0–5 km)",
      ongkir: 15000,
    }
  } else if (d <= 10) {
    return {
      distanceKm: d,
      zone: "B",
      zoneLabel: "Zona B (>5–10 km)",
      ongkir: 20000,
    }
  } else if (d <= 15) {
    return {
      distanceKm: d,
      zone: "C",
      zoneLabel: "Zona C (>10–15 km)",
      ongkir: 30000,
    }
  } else {
    // di atas 15 km → tetap hitung jarak, tapi ongkir manual admin
    return {
      distanceKm: d,
      zone: "D",
      zoneLabel: "Zona D (>15 km – luar jangkauan utama)",
      ongkir: null,
    }
  }
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
  const [shipping, setShipping] = useState<ShippingInfo | null>(null)
  const [shippingError, setShippingError] = useState<string | null>(null)

  // buka popup dari tombol sticky cart
  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener("open-cart", handler)
    return () => window.removeEventListener("open-cart", handler)
  }, [])

  const close = () => {
    setOpen(false)
    setShipping(null)
    setShippingError(null)
  }

  // lock scroll saat popup terbuka
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
  }, [open])

  const onChange =
    (key: keyof FormState) =>
    (e: ChangeEvt) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))

  // 👉 hitung ongkir berdasarkan link maps
  const handleCalculateShipping = () => {
    setShippingError(null)
    setShipping(null)

    if (!form.mapsUrl.trim()) {
      setShippingError("Tempel dulu link lokasi dari Google Maps ya 🙏")
      return
    }

    const coords = extractLatLngFromUrl(form.mapsUrl)
    if (!coords) {
      setShippingError(
        "Link Google Maps tidak dikenali. Pastikan kamu pakai tombol 'Bagikan lokasi' dari Google Maps, lalu tempel di sini."
      )
      return
    }

    const distance = haversineKm(ORIGIN_LAT, ORIGIN_LNG, coords.lat, coords.lng)
    const info = getShippingInfo(distance)
    setShipping(info)
  }

  const handleCheckout = async () => {
    if (!form.nama || !form.hp || !form.alamat) {
      alert("Isi Nama, HP, dan Alamat ya 🙏")
      return
    }

    if (!form.mapsUrl.trim()) {
      alert("Tempel link lokasi dari Google Maps dulu ya 🙏")
      return
    }

    const coords = extractLatLngFromUrl(form.mapsUrl)
    if (!coords) {
      alert(
        "Link Google Maps tidak valid. Pastikan kamu gunakan menu 'Bagikan lokasi' dari Google Maps lalu tempel di kolom yang tersedia."
      )
      return
    }

    if (items.length === 0) {
      alert("Keranjang masih kosong 😅")
      return
    }

    setLoading(true)

    const qtyTotal = items.reduce(
      (acc: number, i: CartItemType) => acc + i.qty,
      0
    )

    const subtotalProduk = Number(totalPrice) || 0
    const shippingInfo = shipping ?? getShippingInfo(
      haversineKm(ORIGIN_LAT, ORIGIN_LNG, coords.lat, coords.lng)
    )

    const ongkir = shippingInfo.ongkir ?? 0
    const grandTotal = subtotalProduk + ongkir

    // mapping cart agar cocok dengan /api/order yang pakai `cart`
    const cartMapped = items.map((i: CartItemType) => ({
      id: i.id,
      name: i.name,
      qty: i.qty,
      price: i.price,
    }))

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: form.nama,
          hp: form.hp,
          alamat: form.alamat,
          catatan: form.catatan,
          mapsUrl: form.mapsUrl,
          cart: cartMapped,
          subtotal: subtotalProduk,
          ongkir,
          grandTotal,
          zone: shippingInfo.zone,
          distanceKm: shippingInfo.distanceKm,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.invoiceUrl) {
        throw new Error("API gagal memproses pesanan")
      }

      // teks WA
      const text = `
🍹 *Pesanan KOJE24*
--------------------------------
${items
  .map((i: CartItemType) => `• ${i.name} × ${i.qty}`)
  .join("\n")}

📞 *HP:* ${form.hp}
👤 *Nama:* ${form.nama}
📍 *Alamat:* ${form.alamat}
🔗 *Lokasi (Maps):* ${form.mapsUrl}

📏 *Jarak:* ~${shippingInfo.distanceKm.toLocaleString("id-ID")} km
🗺 *Zona:* ${shippingInfo.zoneLabel}
🚚 *Ongkir Estimasi:* ${
        shippingInfo.ongkir
          ? "Rp" + shippingInfo.ongkir.toLocaleString("id-ID")
          : "Hubungi admin (di luar jangkauan utama)"
      }

💰 *Subtotal Produk:* Rp${subtotalProduk.toLocaleString("id-ID")}
${
  shippingInfo.ongkir
    ? `💰 *Total + Ongkir:* Rp${grandTotal.toLocaleString("id-ID")}`
    : ""
}

📄 *Invoice:* ${data.invoiceUrl}

Terima kasih sudah order KOJE24 🍹✨
      `.trim()

      window.open(
        `https://wa.me/6282213139580?text=${encodeURIComponent(text)}`,
        "_blank"
      )

      window.open(data.invoiceUrl, "_blank")

      clearCart()
      close()
    } catch (err) {
      console.error("Checkout Error:", err)
      alert("Order gagal terkirim ke sistem. Coba lagi ya 🙏")
    }

    setLoading(false)
  }

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
        onClick={close}
      />

      <div className="fixed inset-0 overflow-y-auto flex items-center justify-center z-[61] p-4">
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

          {/* LIST ITEM */}
          <div className="max-h-64 overflow-y-auto border-y py-3 mb-4 space-y-3">
            {items.length ? (
              items.map((item: CartItemType) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm text-[#0B4B50]"
                >
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
                        addItem({
                          id: item.id,
                          name: item.name,
                          price: item.price,
                        })
                      }
                    >
                      +
                    </button>
                  </div>

                  <span className="w-20 text-right">
                    Rp{(item.qty * item.price).toLocaleString("id-ID")}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400">Keranjang masih kosong</p>
            )}
          </div>

          <div className="text-right font-semibold text-[#0B4B50] mb-1">
            Subtotal Produk: Rp{totalPrice.toLocaleString("id-ID")}
          </div>

          {/* FORM */}
          <div className="space-y-3 mb-4">
            <input
              type="text"
              placeholder="Nomor HP (WA)"
              value={form.hp}
              onChange={onChange("hp")}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:border-[#0FA3A8]"
            />

            <input
              type="text"
              placeholder="Nama lengkap"
              value={form.nama}
              onChange={onChange("nama")}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:border-[#0FA3A8]"
            />

            <input
              type="text"
              placeholder="Alamat lengkap (tulis manual)"
              value={form.alamat}
              onChange={onChange("alamat")}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:border-[#0FA3A8]"
            />

            <input
              type="text"
              placeholder="Tempel link lokasi dari Google Maps (Share Location)"
              value={form.mapsUrl}
              onChange={onChange("mapsUrl")}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:border-[#0FA3A8]"
            />

            {shippingError && (
              <p className="text-xs text-red-500">{shippingError}</p>
            )}

            <button
              type="button"
              onClick={handleCalculateShipping}
              className="w-full border border-[#0FA3A8] text-[#0FA3A8] rounded-full py-2 text-sm font-semibold hover:bg-[#0FA3A8] hover:text-white transition-all"
            >
              Hitung Estimasi Ongkir dari Lokasi Kamu
            </button>

            {shipping && (
              <div className="mt-2 rounded-xl border border-dashed border-[#0FA3A8]/60 bg-[#F4FAFA] p-3 text-xs text-[#0B4B50] space-y-1">
                <p className="font-semibold">
                  📏 Perkiraan jarak: ~{shipping.distanceKm.toLocaleString("id-ID")} km
                </p>
                <p className="font-semibold">🗺 {shipping.zoneLabel}</p>
                <p>
                  🚚 Estimasi ongkir:{" "}
                  {shipping.ongkir
                    ? "Rp" + shipping.ongkir.toLocaleString("id-ID")
                    : "Hubungi admin (di luar jangkauan utama)"}
                </p>
              </div>
            )}

            <textarea
              placeholder="Catatan tambahan (opsional)…"
              value={form.catatan}
              onChange={onChange("catatan")}
              className="w-full border rounded-lg px-3 py-2 text-sm h-16 resize-none focus:border-[#0FA3A8]"
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
