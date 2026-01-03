"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCartStore } from "@/stores/cartStore";

declare global {
  interface Window {
    google?: any;
    snap?: any;
  }
}

type CheckoutState = "idle" | "submitting" | "error";

// ✅ FINAL: versi ecommerce besar (VA / QRIS / E-Wallet / COD)
type PaymentMethod = "bank" | "qris" | "ewallet" | "cod";

const BASE_LAT = -6.2903238;
const BASE_LNG = 107.087373;

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

function calcOngkir(distanceKm: number | null) {
  if (!distanceKm || distanceKm <= 0) return 15000;
  const base = 8000;
  const perKm = 3000;
  const raw = base + distanceKm * perKm;
  const rounded = Math.round(raw / 100) * 100;
  return Math.max(10000, rounded);
}

export default function CheckoutPage() {
  const router = useRouter();

  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const promo = useCartStore((s) => s.promo);
  const getDiscount = useCartStore((s) => s.getDiscount);

  const [hydrated, setHydrated] = useState(false);

  const [nama, setNama] = useState("");
  const [hp, setHp] = useState("");
  const [email, setEmail] = useState("");
  const [alamat, setAlamat] = useState("");
  const [catatan, setCatatan] = useState("");

  // ✅ default ke Transfer Bank (VA) biar paling “ecommerce”
  const [payment, setPayment] = useState<PaymentMethod>("bank");

  const [status, setStatus] = useState<CheckoutState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [ongkir, setOngkir] = useState<number>(15000);

  const alamatRef = useRef<HTMLInputElement | null>(null);

  const [mapsReady, setMapsReady] = useState(false);
  const [snapReady, setSnapReady] = useState(false);

  // cache payload untuk dipakai setelah pembayaran sukses (Snap) ATAU COD sukses
  const lastPayloadRef = useRef<{
    nama: string;
    hp: string;
    email: string;
    alamat: string;
    note: string;
    payment: PaymentMethod;
    distanceKm: number;
    shippingCost: number;
    promoAmount: number;
    promoLabel: string;
    grandTotal: number;
    cart: any[];
  } | null>(null);

  const subtotal = items.reduce((acc, it) => acc + it.price * it.qty, 0);
  const promoAmount = getDiscount();
  const promoLabel = promo?.kode ?? "";
  const total = Math.max(0, subtotal + ongkir - promoAmount);

  useEffect(() => {
    setHydrated(true);
    setTimeout(() => {
      alamatRef.current?.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 250);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (items.length === 0) {
      const t = setTimeout(() => router.push("/#produk"), 1200);
      return () => clearTimeout(t);
    }
  }, [items.length, hydrated, router]);


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

  const createOrderAfterSuccess = async () => {
    const p = lastPayloadRef.current;
    if (!p) return;

    const fd = new FormData();
    fd.append("nama", p.nama);
    fd.append("hp", p.hp);
    fd.append("email", p.email);
    fd.append("alamat", p.alamat);
    fd.append("note", p.note);
    fd.append("payment", p.payment);
    fd.append("distanceKm", String(p.distanceKm || 0));
    fd.append("shippingCost", String(p.shippingCost));
    fd.append("promoAmount", String(p.promoAmount));
    fd.append("promoLabel", p.promoLabel);
    fd.append("grandTotal", String(p.grandTotal));
    fd.append("cart", JSON.stringify(p.cart));

    await fetch(`${window.location.origin}/api/order`, {
      method: "POST",
      body: fd,
    });
  };

  const finalAlamat = alamat || alamatRef.current?.value || "";
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;

    if (!nama.trim() || !hp.trim() || !finalAlamat.trim()) {
      setErrorMsg("Lengkapi nama, nomor WhatsApp, dan alamat ya 🙏");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Masukkan email yang valid ya 🙏");
      return;
    }

    const safeDistance = distanceKm || 3;
    const safeOngkir = distanceKm ? ongkir : calcOngkir(3);
    const grandTotal = Math.max(0, subtotal + safeOngkir - promoAmount);

    try {
      setStatus("submitting");
      setErrorMsg("");

      lastPayloadRef.current = {
        nama,
        hp,
        email,
        alamat,
        note: catatan,
        payment,
        distanceKm: safeDistance,
        shippingCost: safeOngkir,
        promoAmount,
        promoLabel,
        grandTotal,
        cart: items.map((x) => ({ id: x.id, name: x.name, qty: x.qty, price: x.price })),
      };

      // =========================
      // ✅ ONLINE (VA / QRIS / E-Wallet) => Snap popup
      // =========================
      if (payment !== "cod") {
        if (!snapReady || !window.snap) {
          setStatus("idle");
          setErrorMsg("Pembayaran online belum siap. Refresh dulu ya 🙏");
          return;
        }

        const res = await fetch(`${window.location.origin}/api/midtrans`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
  nama,
  hp,
  email,
  alamat: finalAlamat,
  total: grandTotal,
  payment,
  cart: ...
}),
        });

        const data = await res.json();
        if (!res.ok || !data?.token) {
          throw new Error("Token pembayaran gagal");
        }

        window.snap.pay(data.token, {
          onSuccess: async () => {
            try {
              await createOrderAfterSuccess();
            } catch {}
            clearCart();
            router.push("/?payment=success");
          },
          onPending: () => {
            setStatus("idle");
            router.push("/?payment=pending");
          },
          onError: () => {
            setStatus("idle");
            setErrorMsg("Pembayaran gagal 🙏");
          },
          onClose: () => {
            setStatus("idle");
          },
        });

        return;
      }

      // =========================
      // ✅ COD (manual) => langsung buat order tanpa popup
      // =========================
      await createOrderAfterSuccess();
      clearCart();
      router.push("/?payment=cod");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMsg("Ada gangguan sistem — coba sebentar lagi 🙏");
      setStatus("idle");
    }
  };

  const disabled = status === "submitting";

  return (
    <>
      {/* Google Maps Places */}
      <Script
  src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
  strategy="afterInteractive"
  onLoad={() => setMapsReady(true)}
/>

      {/* Snap popup */}
      <Script
        src="https://app.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
        onLoad={() => setSnapReady(true)}
      />

      <main className="min-h-screen bg-[#F4FAFA] text-[#0B4B50] py-10 px-4 flex justify-center">
        <div className="w-full max-w-6xl space-y-6">
          <div>
            <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">KOJE24 • CHECKOUT</p>
            <h1 className="text-3xl md:text-4xl font-playfair font-semibold">
              Selesaikan Pesanan Kamu
            </h1>
          </div>

          {hydrated && items.length === 0 ? (
            <p className="text-center text-gray-500">Keranjang kosong. Mengarahkan kembali…</p>
          ) : (
            <div className="grid gap-8 md:grid-cols-[1.15fr_0.85fr]">
              {/* FORM */}
              <section className="bg-white border rounded-3xl shadow p-6 md:p-8 space-y-5">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <input
                    className="border rounded-lg px-3 py-2 w-full"
                    placeholder="Nama lengkap"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                  />

                  <input
                    className="border rounded-lg px-3 py-2 w-full"
                    placeholder="Nomor WhatsApp"
                    value={hp}
                    onChange={(e) => setHp(e.target.value)}
                  />

                  <input
                    className="border rounded-lg px-3 py-2 w-full"
                    placeholder="Email (untuk menerima invoice)"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <input
  ref={alamatRef}
  className="border rounded-lg px-3 py-2 w-full"
  placeholder="Alamat lengkap"
  value={alamat}
  onChange={(e) => setAlamat(e.target.value)}
/>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    className="w-full bg-[#0FA3A8] text-white py-2 rounded-lg text-sm font-medium"
                  >
                    📍 Hitung Ongkir Pakai Lokasi Saya
                  </button>

                  {distanceKm ? (
                    <p className="text-[13px] text-gray-600">
                      Jarak {distanceKm.toFixed(1)} km • Ongkir Rp{ongkir.toLocaleString("id-ID")}
                    </p>
                  ) : (
                    <p className="text-[12px] text-gray-500">Ongkir sementara Rp15.000</p>
                  )}

                  <textarea
                    className="border rounded-lg px-3 py-2 w-full h-18 resize-none"
                    placeholder="Catatan (opsional)"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                  />

                  <h2 className="font-playfair text-xl">Metode Pembayaran</h2>

                  <div className="rounded-xl bg-[#f7fbfb] border p-4 space-y-3">
                    {/* Transfer Bank (VA) */}
                    <label
                      className={`flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 ${
                        payment === "bank" ? "bg-white border border-[#0FA3A8]" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        checked={payment === "bank"}
                        onChange={() => setPayment("bank")}
                      />
                      <span>Transfer Bank</span>
                      {!snapReady && (
                        <span className="text-xs text-gray-500 ml-auto">loading…</span>
                      )}
                    </label>

                    {/* QRIS */}
                    <label
                      className={`flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 ${
                        payment === "qris" ? "bg-white border border-[#0FA3A8]" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        checked={payment === "qris"}
                        onChange={() => setPayment("qris")}
                      />
                      <span>QRIS</span>
                      {!snapReady && (
                        <span className="text-xs text-gray-500 ml-auto">loading…</span>
                      )}
                    </label>

                    {/* E-Wallet */}
                    <label
                      className={`flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 ${
                        payment === "ewallet" ? "bg-white border border-[#0FA3A8]" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        checked={payment === "ewallet"}
                        onChange={() => setPayment("ewallet")}
                      />
                      <span>E-Wallet</span>
                      {!snapReady && (
                        <span className="text-xs text-gray-500 ml-auto">loading…</span>
                      )}
                    </label>

                    {/* COD */}
                    <label
                      className={`flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 ${
                        payment === "cod" ? "bg-white border border-[#0FA3A8]" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        checked={payment === "cod"}
                        onChange={() => setPayment("cod")}
                      />
                      <span>COD (Bayar di tempat)</span>
                    </label>

                    {/* Info kecil */}
                    {payment !== "cod" && (
                      <div className="bg-white border rounded-xl p-4 mt-3 space-y-2">
                        <p className="text-sm">
                          Nomor Virtual Account / QR akan muncul setelah klik <b>Buat Pesanan</b>.
                        </p>
                        <p className="text-xs text-gray-500">
                          Pastikan popup tidak diblok browser. Jika tidak muncul, coba refresh.
                        </p>
                      </div>
                    )}
                  </div>

                  {errorMsg && <p className="text-red-500 text-sm pt-1">{errorMsg}</p>}

                  <button
                    disabled={disabled}
                    className="w-full bg-[#0FA3A8] text-white py-3 rounded-full font-semibold disabled:opacity-50"
                  >
                    {status === "submitting" ? "Memproses pesanan..." : "Buat Pesanan"}
                  </button>
                </form>
              </section>

              {/* RINGKASAN */}
              <aside className="bg-white border rounded-3xl shadow p-6 space-y-4 h-fit sticky top-6">
                <h2 className="font-playfair text-xl">Ringkasan Pesanan</h2>

                <div className="max-h-[260px] overflow-y-auto space-y-3 pr-1">
                  {items.map((it) => (
                    <div
                      key={it.id}
                      className="flex justify-between items-start border-b pb-2 text-sm gap-3"
                    >
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

                  {promoAmount > 0 && promoLabel && (
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
