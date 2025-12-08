"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import Script from "next/script";

declare const google: any;

type CheckoutState = "idle" | "submitting" | "error";

const BASE_LAT = -6.2903238;
const BASE_LNG = 107.087373;

// 📍 hitung jarak km Haversine
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
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

// 📍 Hitung ongkir otomatis
function calcOngkir(dKm: number | null) {
  if (!dKm || dKm <= 0) return 15000;
  const base = 8000;
  const perKm = 3000;
  const minPay = 10000;
  const raw = base + dKm * perKm;
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
  const total = Math.max(0, subtotal + ongkir - promoAmount);

  // 🚀 Auto hydrate + fokus input
  useEffect(() => {
    setHydrated(true);
    setTimeout(() => {
      alamatRef.current?.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 200);
  }, []);

  // 🚀 Redirect kalau keranjang kosong
  useEffect(() => {
    if (!hydrated) return;
    if (items.length === 0) {
      const t = setTimeout(() => router.push("/#produk"), 1500);
      return () => clearTimeout(t);
    }
  }, [items.length, hydrated, router]);

  // 🌍 Google autocomplete
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
        const dKm = haversine(BASE_LAT, BASE_LNG, lat, lng);

        setDistanceKm(dKm);
        setOngkir(calcOngkir(dKm));

        setAlamat((prev) => prev || place.formatted_address);
      });
    } catch {}
  }, []);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Perangkat tidak mendukung GPS.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dKm = haversine(BASE_LAT, BASE_LNG, pos.coords.latitude, pos.coords.longitude);
        setDistanceKm(dKm);
        setOngkir(calcOngkir(dKm));
        alert("GPS berhasil! Ongkir sudah dihitung 🚚");
      },
      () => alert("Izin lokasi ditolak 🙏"),
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;

    if (!nama.trim() || !hp.trim() || !alamat.trim()) {
      setErrorMsg("Lengkapi nama, nomor WhatsApp, dan alamat ya 🙏");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!distanceKm) {
      setDistanceKm(3);
      setOngkir(calcOngkir(3));
    }

    if (["transfer", "qris"].includes(payment) && !buktiBayarFile) {
      setErrorMsg("Upload bukti pembayaran dulu 🙏");
      return;
    }

    try {
      setStatus("submitting");
      setErrorMsg("");

      const fd = new FormData();
      fd.append("nama", nama);
      fd.append("hp", hp);
      fd.append("alamat", alamat);
      fd.append("note", catatan);
      fd.append("payment", payment);
      fd.append("distanceKm", String(distanceKm || 0));
      fd.append("shippingCost", String(ongkir));
      fd.append("promoAmount", String(promoAmount));
      fd.append("promoLabel", promoLabel);
      fd.append("grandTotal", String(total));
      fd.append("cart", JSON.stringify(items.map((x) => ({ id: x.id, name: x.name, qty: x.qty, price: x.price }))));
      if (buktiBayarFile) fd.append("buktiBayar", buktiBayarFile);

      const res = await fetch("/api/order", { method: "POST", body: fd });
      const data = await res.json();
      if (!data?.success) throw new Error();

      clearCart();
      router.push(data.invoiceUrl);
    } catch {
      setStatus("error");
      setErrorMsg("Ada gangguan sistem — coba sebentar lagi 🙏");
    }
  };

  const disabled = status === "submitting";

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="lazyOnload"
      />

      <main className="min-h-screen bg-[#F4FAFA] text-[#0B4B50] py-10 px-4 flex justify-center">
        <div className="w-full max-w-6xl space-y-6">
          <div className="mb-4">
            <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">KOJE24 • CHECKOUT</p>
            <h1 className="text-3xl md:text-4xl font-playfair font-semibold">Selesaikan Pesanan Kamu</h1>
          </div>

          {hydrated && items.length === 0 ? (
            <p className="text-center text-gray-500">Keranjang kosong. Mengarahkan kembali…</p>
          ) : (
            <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
              {/* FORM */}
              <section className="bg-white border rounded-3xl shadow p-6 md:p-8 space-y-4">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <input className="border rounded-lg px-3 py-2 w-full" placeholder="Nama lengkap" value={nama} onChange={(e) => setNama(e.target.value)} />
                  <input className="border rounded-lg px-3 py-2 w-full" placeholder="Nomor WhatsApp" value={hp} onChange={(e) => setHp(e.target.value)} />
                  <input ref={alamatRef} className="border rounded-lg px-3 py-2 w-full" placeholder="Alamat lengkap" value={alamat} onChange={(e) => setAlamat(e.target.value)} />

                  <button type="button" onClick={handleDetectLocation} className="w-full bg-[#0FA3A8] text-white py-2 rounded-lg text-sm font-medium">
                    📍 Hitung Ongkir Pakai Lokasi Saya
                  </button>

                  {distanceKm ? (
                    <p className="text-[13px] text-gray-600">
                      Jarak {distanceKm.toFixed(1)} km • Ongkir Rp{ongkir.toLocaleString("id-ID")}
                    </p>
                  ) : (
                    <p className="text-[12px] text-gray-500">Ongkir sementara Rp15.000</p>
                  )}

                  <textarea className="border rounded-lg px-3 py-2 w-full h-18 resize-none" placeholder="Catatan (opsional)" value={catatan} onChange={(e) => setCatatan(e.target.value)} />

                  {/* PAYMENT */}
                  <h2 className="font-playfair text-xl">Metode Pembayaran</h2>
                  <div className="rounded-xl bg-[#f7fbfb] border p-4 space-y-3">
                    {(["transfer", "qris", "cod"] as const).map((p) => (
                      <label key={p} className={`flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 ${payment === p ? "bg-white border border-[#0FA3A8]" : ""}`}>
                        <input type="radio" checked={payment === p} onChange={() => setPayment(p)} />
                        <span className="capitalize">{p === "cod" ? "COD (Bayar di tempat)" : p}</span>
                      </label>
                    ))}

                    {payment === "transfer" && (
                      <div className="bg-white border rounded-xl p-4 mt-3 space-y-3">
                        <p className="text-sm font-medium">Rekening Transfer:</p>
                        <div className="text-sm flex justify-between">
                          <span>BCA — 5350429695 (KOJE)</span>
                          <button type="button" onClick={() => navigator.clipboard.writeText("5350429695")} className="text-[#0FA3A8] text-xs">
                            Copy
                          </button>
                        </div>
                        <label className="block text-sm font-medium">Upload Bukti Transfer</label>
                        <input type="file" accept="image/*,.pdf" onChange={(e) => setBuktiBayarFile(e.target.files?.[0] || null)} className="border rounded-lg px-3 py-2 w-full text-sm cursor-pointer" />
                      </div>
                    )}

                    {payment === "qris" && (
                      <div className="bg-white border rounded-xl p-4 mt-3 space-y-3">
                        <p className="text-sm font-medium">Scan QRIS untuk pembayaran:</p>
                        <img src="/qris-static.jpg" className="w-full rounded-lg" alt="QRIS" />
                        <label className="block text-sm font-medium">Upload Bukti Pembayaran</label>
                        <input type="file" accept="image/*,.pdf" onChange={(e) => setBuktiBayarFile(e.target.files?.[0] || null)} className="border rounded-lg px-3 py-2 w-full text-sm cursor-pointer" />
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
              <aside className="bg-white border rounded-3xl shadow p-6 space-y-4 h-fit sticky top-6">
                <h2 className="font-playfair text-xl">Ringkasan Pesanan</h2>
                <div className="max-h-[260px] overflow-y-auto space-y-3 pr-1">
                  {items.map((it) => (
                    <div key={it.id} className="flex justify-between items-start border-b pb-2 text-sm gap-3">
                      <div className="flex-1">
                        <p className="font-medium">{it.name}</p>
                        <p className="text-[12px] text-gray-500">
                          {it.qty}x • Rp{it.price.toLocaleString("id-ID")}/pcs
                        </p>
                      </div>
                      <div className="font-semibold whitespace-nowrap">
                        Rp{(it.qty * it.price).toLocaleString("id-ID")}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rp{subtotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ongkir</span>
                    <span>Rp{ongkir.toLocaleString("id-ID")}</span>
                  </div>

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
