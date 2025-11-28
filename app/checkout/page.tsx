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
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
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

  // ⬅️ flag buat nunggu Zustand hydrate dulu
  const [hydrated, setHydrated] = useState(false);

  const [nama, setNama] = useState("");
  const [hp, setHp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [catatan, setCatatan] = useState("");
  const [payment, setPayment] = useState<"transfer" | "qris" | "cod">(
    "transfer"
  );
  const [status, setStatus] = useState<CheckoutState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [ongkir, setOngkir] = useState<number>(15000);
  const alamatRef = useRef<HTMLInputElement | null>(null);

  // 🧾 Bukti pembayaran (baru ditambah)
  const [buktiBayarFile, setBuktiBayarFile] = useState<File | null>(null);

  const subtotal = items.reduce((acc, it) => acc + it.price * it.qty, 0);
  const total = subtotal + (items.length > 0 ? ongkir : 0);

  // scroll ke atas saat page dibuka
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0 });
  }, []);

  // tandai bahwa client + zustand sudah hydrate
  useEffect(() => {
    setHydrated(true);
  }, []);

  // redirect HANYA kalau sudah hydrate dan cart kosong
  useEffect(() => {
    if (!hydrated) return; // jangan apa-apa sebelum hydrate

    if (items.length === 0) {
      const t = setTimeout(() => {
        router.push("/#produk");
      }, 1600);
      return () => clearTimeout(t);
    }
  }, [items.length, hydrated, router]);

  // Google autocomplete — versi stabil
useEffect(() => {
  if (!alamatRef.current) return;

  const w = window as any;
  if (!w.google?.maps?.places) return;

  try {
    const auto = new google.maps.places.Autocomplete(alamatRef.current, {
      componentRestrictions: { country: "id" },
    });

    // pastikan formatted_address + geometry terbaca
    auto.setFields(["formatted_address", "geometry"]);

    auto.addListener("place_changed", () => {
      const place = auto.getPlace();
      if (!place || !place.geometry?.location) return;

      const destLat = place.geometry.location.lat();
      const destLng = place.geometry.location.lng();

      const dKm = haversineDistance(BASE_LAT, BASE_LNG, destLat, destLng);
      const ship = calcOngkir(dKm);

      setDistanceKm(dKm);
      setOngkir(ship);

      // ambil alamat dari Google, bukan dari input
      if (place.formatted_address) {
        setAlamat(place.formatted_address);
      }
    });
  } catch (err) {
    console.error("Autocomplete init error:", err);
  }
}, []);

  // SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;

    if (!nama.trim() || !hp.trim() || !alamat.trim()) {
      setErrorMsg("Lengkapi nama, nomor WhatsApp, dan alamat dulu ya 🙏");
      return;
    }

    // 💡 VALIDASI WAJIB: bukti bayar untuk transfer / qris
    if (["transfer", "qris"].includes(payment) && !buktiBayarFile) {
      setErrorMsg(
        "Upload Bukti Pembayaran (Transfer / QRIS) dulu ya sebelum submit 🙏"
      );
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

      // ⚠️ STEP SEKARANG: buktiBayarFile BELUM DIUPLOAD ke server
      // Nanti di step berikutnya kita buat /api/upload-bukti
      // dan di sini kita kirim file tersebut, lalu dapatkan URL-nya.

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          hp,
          alamat,
          note: catatan,
          payment,
          // buktiPembayaran: buktiUrl, // ⬅️ ini nanti diisi setelah API upload siap
          cart: cartMapped,
          distanceKm,
          shippingCost: ongkir,
          grandTotal: total,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success)
        throw new Error(data?.message || "Gagal membuat invoice");

      // kirim WA async (tidak menghambat redirect) — FUNGSI LAMA TETAP JALAN
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
      }).catch((err) => console.error("WA send failed:", err));

      clearCart();
      router.push(data.invoiceUrl || "/");
    } catch (e) {
      console.error("Checkout error:", e);
      setStatus("error");
      setErrorMsg(
        "Ada kendala saat membuat invoice. Coba lagi sebentar ya 🙏"
      );
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

      <main className="min-h-screen bg-[#F4FAFA] text-[#0B4B50] py-10 px-4 flex justify-center">
        <div className="w-full max-w-5xl">
          {/* HEADER */}
          <div className="mb-8">
            <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">
              KOJE24 • PREMIUM CHECKOUT
            </p>
            <h1 className="text-3xl md:text-4xl font-playfair font-semibold">
              Selesaikan Pesanan Kamu
            </h1>
            <p className="text-sm text-gray-600 mt-2 max-w-xl">
              Isi alamat dengan teliti. Ongkir dihitung otomatis berdasarkan
              jarak.
            </p>
          </div>

          {/* Kalau sudah hydrate & kosong baru tampilkan info redirect */}
          {hydrated && items.length === 0 ? (
            <p className="text-center text-gray-500">
              Keranjang kosong. Mengarahkan kembali…
            </p>
          ) : (
            <div className="grid gap-8 md:grid-cols-[1.15fr_0.85fr]">
              {/* FORM */}
              <section className="bg-white border rounded-3xl shadow p-6 md:p-7">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#0FA3A8]/60"
                    placeholder="Nama lengkap"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                  />
                  <input
                    className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#0FA3A8]/60"
                    placeholder="Nomor WhatsApp"
                    value={hp}
                    onChange={(e) => setHp(e.target.value)}
                  />

                  <input
                    ref={alamatRef}
                    className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#0FA3A8]/60"
                    placeholder="Alamat lengkap (bisa pilih dari Google)"
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                  />
                  {distanceKm && (
                    <p className="text-[12px] text-gray-500">
                      Jarak {distanceKm.toFixed(1)} km • Ongkir Rp
                      {ongkir.toLocaleString("id-ID")}
                    </p>
                  )}

                  <textarea
                    className="border rounded-lg px-3 py-2 w-full h-16 resize-none focus:outline-none focus:ring-2 focus:ring-[#0FA3A8]/60"
                    placeholder="Catatan (opsional)"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                  />

                  {/* PAYMENT */}
                  <h2 className="font-playfair text-xl mt-5 mb-1">
                    Metode Pembayaran
                  </h2>
                  <div className="rounded-xl bg-[#f7fbfb] border p-4 space-y-3">
                    {(["transfer", "qris", "cod"] as const).map((p) => (
                      <label
                        key={p}
                        className={`flex items-center justify-between gap-3 cursor-pointer rounded-lg px-3 py-2 ${
                          payment === p
                            ? "bg-white border border-[#0FA3A8]"
                            : "border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="payment"
                            checked={payment === p}
                            onChange={() => {
                              setPayment(p);
                              setBuktiBayarFile(null); // reset bukti saat ganti metode
                            }}
                          />
                          <span className="capitalize">
                            {p === "cod" ? "COD (Bayar di tempat)" : p}
                          </span>
                        </div>
                      </label>
                    ))}

                    {/* UPLOAD BUKTI BAYAR → WAJIB untuk transfer / qris */}
                    {["transfer", "qris"].includes(payment) && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-[#0B4B50] mb-1">
                          Upload Bukti Pembayaran (Transfer / QRIS)
                        </label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) =>
                            setBuktiBayarFile(
                              e.target.files?.[0] ? e.target.files[0] : null
                            )
                          }
                          className="border rounded-lg px-3 py-2 w-full text-sm cursor-pointer bg-white"
                        />
                        {buktiBayarFile && (
                          <p className="text-[11px] mt-1 text-gray-500">
                            File: {buktiBayarFile.name}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {errorMsg && (
                    <p className="text-red-500 text-sm pt-1">{errorMsg}</p>
                  )}

                  <button
                    disabled= {disabled}
                    className="w-full bg-[#0FA3A8] text-white py-3 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    {status === "submitting"
                      ? "Memproses pesanan..."
                      : "Buat Pesanan"}
                  </button>
                </form>
              </section>

              {/* RINGKASAN */}
              <aside className="bg-white border rounded-3xl shadow p-6 flex flex-col gap-4">
                <h2 className="font-playfair text-xl">Ringkasan Pesanan</h2>
                <div className="max-h-[260px] overflow-y-auto space-y-3 pr-1">
                  {items.map((it) => (
                    <div
                      key={it.id}
                      className="flex justify-between items-start border-b pb-2 text-sm gap-3"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-[#0B4B50]">
                          {it.name}
                        </p>
                        <p className="text-[12px] text-gray-500">
                          {it.qty}x • Rp
                          {it.price.toLocaleString("id-ID")} / pcs
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
