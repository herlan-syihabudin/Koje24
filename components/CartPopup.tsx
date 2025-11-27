"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/stores/cartStore"
import Script from "next/script"

declare const google: any

type CheckoutState = "idle" | "submitting" | "error"

export type CartItemType = {
  id: string
  name: string
  price: number
  qty: number
}

// Koordinat base KOJE24 (Grand Wisata Bekasi)
const BASE_LAT = -6.2903238
const BASE_LNG = 107.087373

// Haversine distance (km) antara 2 titik
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c
  return d
}

// Rumus ongkir KOJE24 (bisa lu ubah)
function calcOngkir(distanceKm: number | null): number {
  if (!distanceKm || distanceKm <= 0) {
    // fallback default kalau jarak belum ke-detect
    return 15000
  }

  const base = 8000 // ongkir minimum
  const perKm = 3000
  const minPay = 10000

  const raw = base + distanceKm * perKm
  const rounded = Math.round(raw / 100) * 100 // bulatkan ke ratusan

  return Math.max(minPay, rounded)
}

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)

  const [nama, setNama] = useState("")
  const [hp, setHp] = useState("")
  const [alamat, setAlamat] = useState("")
  const [catatan, setCatatan] = useState("")
  const [payment, setPayment] = useState("transfer")
  const [status, setStatus] = useState<CheckoutState>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const [distanceKm, setDistanceKm] = useState<number | null>(null)
  const [ongkir, setOngkir] = useState<number>(15000)

  const alamatRef = useRef<HTMLInputElement | null>(null)

  // 🔐 Guard biar redirect nggak nembak sebelum state siap
  const [mounted, setMounted] = useState(false)

  const subtotal = items.reduce(
    (acc: number, item: CartItemType) => acc + item.price * item.qty,
    0
  )

  const total = subtotal + (items.length > 0 ? ongkir : 0)

  // Scroll to top
  useEffect(() => {
    if (typeof window === "undefined") return
    window.scrollTo({ top: 0 })
  }, [])

  // Tandain sudah mounted (render client stabil)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect kalau bener-bener masuk /checkout tanpa item
  useEffect(() => {
    if (!mounted) return
    if (items.length === 0) {
      const t = setTimeout(() => {
        router.push("/#produk")
      }, 1800)
      return () => clearTimeout(t)
    }
  }, [items, router, mounted])

  // Inisialisasi Google Places Autocomplete
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!alamatRef.current) return

    const w = window as any
    if (!w.google || !w.google.maps || !w.google.maps.places) {
      // Kalau script Maps belum ready, biarkan dulu
      return
    }

    try {
      const autocomplete = new google.maps.places.Autocomplete(
        alamatRef.current,
        {
          componentRestrictions: { country: "id" },
          fields: ["formatted_address", "geometry"],
        }
      )

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace()
        if (!place || !place.geometry || !place.geometry.location) return

        const destLat = place.geometry.location.lat()
        const destLng = place.geometry.location.lng()

        const dKm = haversineDistance(BASE_LAT, BASE_LNG, destLat, destLng)
        const ship = calcOngkir(dKm)

        setDistanceKm(dKm)
        setOngkir(ship)
        setAlamat(place.formatted_address || alamatRef.current?.value || "")
      })
    } catch (e) {
      console.error("Error init Google Autocomplete:", e)
    }
  }, [])

  // ============================
  // HANDLE SUBMIT
  // ============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!items.length) return

    if (!nama.trim() || !hp.trim() || !alamat.trim()) {
      setErrorMsg("Lengkapi nama, nomor WhatsApp, dan alamat dulu ya 🙏")
      return
    }

    try {
      setStatus("submitting")
      setErrorMsg("")

      const cartMapped = items.map((it: CartItemType) => ({
        id: it.id,
        name: it.name,
        qty: it.qty,
        price: it.price,
      }))

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          hp,
          alamat,
          note: catatan,
          payment,
          cart: cartMapped,
          distanceKm,
          shippingCost: ongkir,
          grandTotal: total,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Gagal membuat invoice")
      }

      // 🚀 Kirim ke WhatsApp (async, tidak menghambat redirect)
      fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nama,
          phone: hp,
          address: alamat,
          note: catatan,
          order: items.map((x) => ({
            name: x.name,
            qty: x.qty,
            price: x.price,
          })),
          total: total,
        }),
      }).catch((err) => console.error("WA send failed:", err))

      clearCart()
      router.push(data.invoiceUrl || "/")
    } catch (err: any) {
      console.error("Checkout error:", err)
      setStatus("error")
      setErrorMsg(
        "Maaf, sedang ada kendala saat membuat invoice. Coba lagi sebentar lagi ya."
      )
    } finally {
      setStatus((prev) => (prev === "submitting" ? "idle" : prev))
    }
  }

  const disabled = status === "submitting" || !items.length

  return (
    <>
      {/* LOAD GOOGLE MAPS JS + PLACES */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="lazyOnload"
      />

      <main className="min-h-screen bg-[#F4FAFA] text-[#0B4B50] flex items-start justify-center py-10 px-4 md:px-6">
        <div className="w-full max-w-5xl">
          {/* Title */}
          <div className="mb-8">
            <p className="text-xs tracking-[0.25em] uppercase text-[#0FA3A8] mb-2">
              KOJE24 • Premium Checkout
            </p>
            <h1 className="font-playfair text-3xl md:text-4xl font-semibold">
              Selesaikan Pesanan Kamu
            </h1>
            <p className="font-inter text-sm md:text-base text-gray-600 mt-2 max-w-2xl">
              Isi data pengiriman dengan teliti. Ongkir akan dihitung otomatis
              berdasarkan jarak dari base KOJE24.
            </p>
          </div>

          {mounted && items.length === 0 ? (
            <div className="mt-10 bg-white/70 border border-[#e6eeee] rounded-2xl p-6 text-center shadow-sm">
              <p className="font-inter text-sm md:text-base text-gray-600">
                Keranjang kamu masih kosong. Mengarahkan kembali ke halaman
                produk...
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:gap-8 md:grid-cols-[1.1fr_0.9fr]">
              {/* LEFT: FORM */}
              <section className="bg-white/90 border border-[#e6eeee] rounded-3xl shadow-[0_10px_35px_rgba(11,75,80,0.07)] p-6 md:p-7">
                <h2 className="font-playfair text-xl md:text-2xl mb-4">
                  Detail Pengiriman
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nama lengkap"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />

                  <input
                    type="text"
                    placeholder="Nomor WhatsApp"
                    value={hp}
                    onChange={(e) => setHp(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />

                  {/* ALAMAT + AUTOCOMPLETE */}
                  <div className="space-y-1">
                    <input
                      type="text"
                      placeholder="Alamat lengkap (bisa pilih dari saran Google)"
                      value={alamat}
                      ref={alamatRef}
                      onChange={(e) => setAlamat(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                    {distanceKm && (
                      <p className="text-[11px] text-gray-500">
                        Perkiraan jarak:{" "}
                        <span className="font-semibold">
                          {distanceKm.toFixed(1)} km
                        </span>{" "}
                        • Ongkir:{" "}
                        <span className="font-semibold">
                          Rp{ongkir.toLocaleString("id-ID")}
                        </span>
                      </p>
                    )}
                  </div>

                  <textarea
                    placeholder="Catatan tambahan (opsional)… misal: patokan rumah, blok, warna pagar"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 h-16 resize-none"
                  />

                  {/* METODE PEMBAYARAN */}
                  <h2 className="font-playfair text-xl md:text-2xl mt-6 mb-2">
                    Metode Pembayaran
                  </h2>

                  <div className="space-y-3 bg-[#f8fcfc] border border-[#e6eeee] rounded-2xl p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="transfer"
                        checked={payment === "transfer"}
                        onChange={() => setPayment("transfer")}
                      />
                      <span>Transfer Bank (disarankan)</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="qris"
                        checked={payment === "qris"}
                        onChange={() => setPayment("qris")}
                      />
                      <span>QRIS</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={payment === "cod"}
                        onChange={() => setPayment("cod")}
                      />
                      <span>COD (Cash on Delivery)</span>
                    </label>
                  </div>

                  {errorMsg && (
                    <p className="text-red-500 text-sm">{errorMsg}</p>
                  )}

                  <button
                    disabled={disabled}
                    className="w-full bg-[#0FA3A8] text-white rounded-full py-3 font-semibold disabled:opacity-50"
                  >
                    {status === "submitting"
                      ? "Memproses..."
                      : "Buat Invoice & Lanjut WhatsApp"}
                  </button>
                </form>
              </section>

              {/* RIGHT: ORDER SUMMARY */}
              <aside className="bg-white/95 border border-[#e1eeee] rounded-3xl shadow-[0_10px_35px_rgba(0,0,0,0.04)] p-5 md:p-6 flex flex-col gap-4">
                <h2 className="font-playfair text-lg md:text-xl mb-1">
                  Ringkasan Pesanan
                </h2>

                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                  {items.map((item: CartItemType) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 border-b border-[#edf5f5] pb-2.5"
                    >
                      <div>
                        <p className="font-inter text-[14px] font-semibold">
                          {item.name}
                        </p>
                        <p className="text-[12px] text-gray-500">
                          {item.qty} x Rp
                          {item.price.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <p className="font-semibold text-[14px]">
                        Rp{(item.qty * item.price).toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-2 space-y-1 text-sm border-t border-[#e6eeee] pt-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>Rp{subtotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Ongkir (otomatis)</span>
                    <span>Rp{ongkir.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#e6eeee] mt-2">
                    <span className="font-semibold text-sm">Total Akhir</span>
                    <span className="font-bold text-lg text-[#0B4B50]">
                      Rp{total.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/#produk")}
                  className="mt-auto text-xs text-gray-500 hover:text-[#0FA3A8] underline-offset-2 hover:underline"
                >
                  ← Kembali belanja dulu
                </button>
              </aside>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
