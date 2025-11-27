"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import Script from "next/script";

declare const google: any;

type CheckoutState = "idle" | "submitting" | "error";

export type CartItemType = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

// Koordinat base KOJE24 (Grand Wisata Bekasi)
const BASE_LAT = -6.2903238;
const BASE_LNG = 107.087373;

// Rumus haversine untuk jarak
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Perhitungan ongkir KOJE24
function calcOngkir(distanceKm: number | null): number {
  if (!distanceKm) return 15000;
  const base = 8000;
  const perKm = 3000;
  const minPay = 10000;
  const raw = base + distanceKm * perKm;
  const rounded = Math.round(raw / 100) * 100;
  return Math.max(minPay, rounded);
}

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const [mounted, setMounted] = useState(false);
  const [nama, setNama] = useState("");
  const [hp, setHp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [catatan, setCatatan] = useState("");
  const [payment, setPayment] = useState("transfer");
  const [status, setStatus] = useState<CheckoutState>("idle");
  const [err, setErr] = useState("");

  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [ongkir, setOngkir] = useState(15000);

  const alamatRef = useRef<HTMLInputElement | null>(null);

  const subtotal = items.reduce((a, it) => a + it.price * it.qty, 0);
  const total = subtotal + (items.length ? ongkir : 0);

  // scroll ke atas saat page dibuka
  useEffect(() => {
    window.scrollTo({ top: 0 });
    setMounted(true);
  }, []);

  // redirect aman bila checkout dibuka dengan keranjang kosong
  useEffect(() => {
    if (!mounted) return;
    if (items.length === 0) {
      setTimeout(() => {
        router.push("/#produk");
      }, 1600);
    }
  }, [items, mounted, router]);

  // Google autocomplete
  useEffect(() => {
    if (!alamatRef.current) return;
    const w = window as any;
    if (!w.google?.maps?.places) return;

    const auto = new google.maps.places.Autocomplete(alamatRef.current, {
      componentRestrictions: { country: "id" },
      fields: ["formatted_address", "geometry"],
    });

    auto.addListener("place_changed", () => {
      const place = auto.getPlace();
      if (!place?.geometry?.location) return;

      const destLat = place.geometry.location.lat();
      const destLng = place.geometry.location.lng();
      const dKm = haversineDistance(BASE_LAT, BASE_LNG, destLat, destLng);
      const ship = calcOngkir(dKm);

      setDistanceKm(dKm);
      setOngkir(ship);
      setAlamat(place.formatted_address || alamat);
    });
  }, []);

  // SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;

    if (!nama.trim() || !hp.trim() || !alamat.trim()) {
      setErr("Lengkapi nama, nomor WA, dan alamat dulu ya 🙏");
      return;
    }

    try {
      setStatus("submitting");
      setErr("");

      const cartMapped = items.map((x) => ({
        id: x.id,
        name: x.name,
        qty: x.qty,
        price: x.price,
      }));

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
      });

      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message);

      // kirim WA async (tidak menghambat redirect)
      fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nama,
          phone: hp,
          address: alamat,
          note: catatan,
          order: cartMapped,
          total,
        }),
      });

      clearCart();
      router.push(data.invoiceUrl || "/");
    } catch {
      setStatus("error");
      setErr("Ada kendala saat membuat invoice. Coba lagi ya 🙏");
    } finally {
      setStatus("idle");
    }
  };

  const disabled = status === "submitting" || !items.length;

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="lazyOnload"
      />

      <main className="min-h-screen bg-[#F4FAFA] text-[#0B4B50] flex items-start justify-center py-10 px-4 md:px-6">
        <div className="w-full max-w-5xl">
          <div className="mb-8">
            <p className="text-xs tracking-[0.25em] uppercase text-[#0FA3A8] mb-2">
              KOJE24 • Premium Checkout
            </p>
            <h1 className="font-playfair text-3xl md:text-4xl font-semibold">
              Selesaikan Pesanan Kamu
            </h1>
            <p className="text-sm text-gray-600 mt-2 max-w-2xl">
              Isi data pengiriman dengan teliti. Ongkir dihitung otomatis dari base KOJE24.
            </p>
          </div>

          {mounted && items.length === 0 ? (
            <div className="bg-white/70 border rounded-2xl p-6 text-center shadow-sm mt-10">
              Keranjang kosong. Mengarahkan ke halaman produk...
            </div>
          ) : (
            <div className="grid gap-6 md:gap-8 md:grid-cols-[1.1fr_0.9fr]">
              {/* FORM */}
              <section className="bg-white/90 border rounded-3xl shadow p-6 md:p-7">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input className="w-full border rounded-lg px-3 py-2" placeholder="Nama lengkap"
                    value={nama} onChange={(e) => setNama(e.target.value)} />
                  <input className="w-full border rounded-lg px-3 py-2" placeholder="Nomor WhatsApp"
                    value={hp} onChange={(e) => setHp(e.target.value)} />

                  <div className="space-y-1">
                    <input className="w-full border rounded-lg px-3 py-2"
                      placeholder="Alamat lengkap"
                      ref={alamatRef}
                      value={alamat}
                      onChange={(e) => setAlamat(e.target.value)} />
                    {distanceKm && (
                      <p className="text-[11px] text-gray-500">
                        {distanceKm.toFixed(1)} km • Ongkir Rp{ongkir.toLocaleString("id-ID")}
                      </p>
                    )}
                  </div>

                  <textarea className="w-full border rounded-lg px-3 py-2 h-16 resize-none"
                    placeholder="Catatan tambahan (opsional)"
                    value={catatan} onChange={(e) => setCatatan(e.target.value)} />

                  <h2 className="font-playfair text-xl mt-6">Metode Pembayaran</h2>
                  <div className="space-y-3 bg-[#f8fcfc] border rounded-2xl p-4">
                    {["transfer", "qris", "cod"].map((m) => (
                      <label key={m} className="flex items-center gap-3 cursor-pointer">
                        <input type="radio" value={m} checked={payment === m} onChange={() => setPayment(m)} />
                        <span className="capitalize">{m}</span>
                      </label>
                    ))}
                  </div>

                  {err && <p className="text-red-500 text-sm">{err}</p>}

                  <button disabled={disabled}
                    className="w-full bg-[#0FA3A8] text-white rounded-full py-3 font-semibold disabled:opacity-50">
                    {status === "submitting" ? "Memproses..." : "Buat Invoice & Lanjut WhatsApp"}
                  </button>
                </form>
              </section>

              {/* RINGKASAN */}
              <aside className="bg-white/95 border rounded-3xl shadow p-6 flex flex-col gap-4">
                <h2 className="font-playfair text-lg mb-1">Ringkasan Pesanan</h2>
                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                  {items.map((x) => (
                    <div key={x.id} className="flex justify-between border-b pb-2.5">
                      <div>
                        <p className="font-semibold">{x.name}</p>
                        <p className="text-xs text-gray-500">{x.qty} × Rp{x.price.toLocaleString("id-ID")}</p>
                      </div>
                      <p className="font-semibold">
                        Rp{(x.qty * x.price).toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>Rp{subtotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Ongkir</span>
                    <span>Rp{ongkir.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2 mt-2">
                    <span className="font-semibold">Total Akhir</span>
                    <span className="font-bold text-lg text-[#0B4B50]">
                      Rp{total.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <button onClick={() => router.push("/#produk")}
                  className="mt-auto text-xs text-gray-500 hover:text-[#0FA3A8] underline">
                  ← Kembali belanja dulu
                </button>
              </aside>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
