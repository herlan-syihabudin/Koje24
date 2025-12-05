"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import Script from "next/script";

declare const google: any;

type CheckoutState = "idle" | "submitting" | "error";

const BASE_LAT = -6.2903238;
const BASE_LNG = 107.087373;

// haversine
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
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

function calcOngkir(distanceKm: number | null): number {
  if (!distanceKm || distanceKm <= 0) return 15000;
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
  const promoLabel = useCartStore((s) => s.promoLabel);
  const promoAmount = useCartStore((s) => s.promoAmount);

  const [hydrated, setHydrated] = useState(false);
  const [nama, setNama] = useState("");
  const [hp, setHp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [catatan, setCatatan] = useState("");
  const [payment, setPayment] = useState<"transfer" | "qris" | "cod">("transfer");
  const [status, setStatus] = useState<CheckoutState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [ongkir, setOngkir] = useState<number>(15000);
  const alamatRef = useRef<HTMLInputElement | null>(null);
  const [buktiBayarFile, setBuktiBayarFile] = useState<File | null>(null);

  const subtotal = items.reduce((acc, it) => acc + it.price * it.qty, 0);
  const total = Math.max(0, subtotal + (items.length ? ongkir : 0) - promoAmount); // ⛔ never negatif

  useEffect(() => {
    setHydrated(true);
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (items.length === 0) {
      const t = setTimeout(() => router.push("/#produk"), 1600);
      return () => clearTimeout(t);
    }
  }, [items.length, hydrated, router]);

  // GOOGLE AUTOCOMPLETE FIX (anti double init)
  useEffect(() => {
    const el = alamatRef.current;
    const w = window as any;
    if (!el || !w.google?.maps?.places) return;
    if ((el as any)._autocomplete_inited) return;
    (el as any)._autocomplete_inited = true;

    try {
      const auto = new google.maps.places.Autocomplete(el, {
        componentRestrictions: { country: "id" },
        fields: ["formatted_address", "geometry"],
      });

      auto.addListener("place_changed", () => {
        const place = auto.getPlace();
        if (!place?.geometry?.location) return;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const dKm = haversineDistance(BASE_LAT, BASE_LNG, lat, lng);
        setDistanceKm(dKm);
        setOngkir(calcOngkir(dKm));
        if (place.formatted_address) setAlamat(place.formatted_address);
      });
    } catch {}
  }, []);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return alert("Perangkat tidak mendukung GPS lokasi.");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const dKm = haversineDistance(BASE_LAT, BASE_LNG, latitude, longitude);
        setDistanceKm(dKm);
        setOngkir(calcOngkir(dKm));
        setAlamat(`Koordinat: ${latitude}, ${longitude}`);
      },
      () => alert("Izin GPS ditolak. Aktifkan lokasi dulu ya 🙏"),
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return; // ⛔ anti submit dobel
    if (!items.length) return;

    if (!nama.trim() || !hp.trim() || !alamat.trim()) {
      setErrorMsg("Lengkapi nama, nomor WhatsApp, dan alamat dulu ya 🙏");
      return;
    }

    if (["transfer", "qris"].includes(payment) && !buktiBayarFile) {
      setErrorMsg("Upload bukti pembayaran terlebih dahulu 🙏");
      return;
    }

    try {
      setStatus("submitting");
      setErrorMsg("");

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
          promoAmount,
          promoLabel,
          grandTotal: total,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Gagal membuat invoice");

      clearCart();
      router.push(data.invoiceUrl || "/");
    } catch {
      setStatus("error");
      setErrorMsg("Ada kendala saat membuat invoice — coba ulang sebentar ya 🙏");
    }
  };

  const disabled = status === "submitting" || !items.length;

  return (
    <>
      <Script src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`} strategy="lazyOnload" />

      {/* === UI tidak disentuh & tetap sama === */}
      <main className="min-h-screen bg-[#F4FAFA] text-[#0B4B50] py-10 px-4 flex justify-center">
        <div className="w-full max-w-5xl">
          <div className="mb-8">
            <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">KOJE24 • PREMIUM CHECKOUT</p>
            <h1 className="text-3xl md:text-4xl font-playfair font-semibold">Selesaikan Pesanan Kamu</h1>
            <p className="text-sm text-gray-600 mt-2 max-w-xl">
              Isi alamat dengan teliti. Ongkir dihitung otomatis berdasarkan jarak.
            </p>
          </div>

          {hydrated && items.length === 0 ? (
            <p className="text-center text-gray-500">Keranjang kosong. Mengarahkan kembali…</p>
          ) : (
            <div className="grid gap-8 md:grid-cols-[1.15fr_0.85fr]">
              <section className="bg-white border rounded-3xl shadow p-6 md:p-7">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input className="border rounded-lg px-3 py-2 w-full" placeholder="Nama lengkap" value={nama} onChange={(e) => setNama(e.target.value)} />
                  <input className="border rounded-lg px-3 py-2 w-full" placeholder="Nomor WhatsApp" value={hp} onChange={(e) => setHp(e.target.value)} />
                  <input ref={alamatRef} className="border rounded-lg px-3 py-2 w-full" placeholder="Alamat lengkap" value={alamat} onChange={(e) => setAlamat(e.target.value)} />

                  <button type="button" onClick={handleDetectLocation} className="w-full bg-[#0FA3A8]/90 hover:bg-[#0FA3A8] text-white mt-2 py-2 rounded-lg text-sm font-medium shadow-sm">
                    📍 Deteksi Lokasi Otomatis (Hitung Ongkir)
                  </button>

                  {distanceKm && <p className="text-[12px] text-gray-500">Jarak {distanceKm.toFixed(1)} km • Ongkir Rp{ongkir.toLocaleString("id-ID")}</p>}

                  <textarea className="border rounded-lg px-3 py-2 w-full h-16 resize-none" placeholder="Catatan (opsional)" value={catatan} onChange={(e) => setCatatan(e.target.value)} />

                  <h2 className="font-playfair text-xl">Metode Pembayaran</h2>
                  <div className="rounded-xl bg-[#f7fbfb] border p-4 space-y-3">
                    {(["transfer", "qris", "cod"] as const).map((p) => (
                      <label
                        key={p}
                        className={`flex items-center justify-between cursor-pointer rounded-lg px-3 py-2 ${payment === p ? "bg-white border border-[#0FA3A8]" : ""}`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="payment"
                            checked={payment === p}
                            onChange={() => {
                              setPayment(p);
                              setBuktiBayarFile(null);
                              setErrorMsg(""); // ⛔ reset error lama
                            }}
                          />
                          <span className="capitalize">{p === "cod" ? "COD (Bayar di tempat)" : p}</span>
                        </div>
                      </label>
                    ))}

                    {["transfer", "qris"].includes(payment) && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium mb-1">Upload Bukti Pembayaran</label>
                        <input type="file" accept="image/*,.pdf" onChange={(e) => setBuktiBayarFile(e.target.files?.[0] || null)} className="border rounded-lg px-3 py-2 w-full text-sm bg-white cursor-pointer" />
                        {buktiBayarFile && <p className="text-[11px] mt-1 text-gray-500">File: {buktiBayarFile.name}</p>}
                      </div>
                    )}
                  </div>

                  {errorMsg && <p className="text-red-500 text-sm pt-1">{errorMsg}</p>}

                  <button disabled={disabled} className="w-full bg-[#0FA3A8] text-white py-3 rounded-full font-semibold disabled:opacity-50">
                    {status === "submitting" ? "Memproses pesanan..." : "Buat Pesanan"}
                  </button>
                </form>
              </section>

              {/* SIDEBAR */}
              <aside className="bg-white border rounded-3xl shadow p-6 flex flex-col gap-4">
                <h2 className="font-playfair text-xl">Ringkasan Pesanan</h2>

                <div className="max-h-[260px] overflow-y-auto space-y-3 pr-1">
                  {items.map((it) => (
                    <div key={it.id} className="flex justify-between items-start border-b pb-2 text-sm gap-3">
                      <div className="flex-1">
                        <p className="font-medium">{it.name}</p>
                        <p className="text-[12px] text-gray-500">{it.qty}x • Rp{it.price.toLocaleString("id-ID")}/pcs</p>
                      </div>
                      <div className="font-semibold whitespace-nowrap">Rp{(it.qty * it.price).toLocaleString("id-ID")}</div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>Rp{subtotal.toLocaleString("id-ID")}</span></div>
                  <div className="flex justify-between"><span>Ongkir</span><span>Rp{ongkir.toLocaleString("id-ID")}</span></div>

                  {promoAmount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>{promoLabel}</span>
                      <span>- Rp{promoAmount.toLocaleString("id-ID")}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-semibold text-lg pt-1">
                    <span>Total</span>
                    <span>Rp{total.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
