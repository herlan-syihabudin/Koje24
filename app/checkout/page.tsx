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

// ✅ Payment UI (tanpa kata midtrans)
type PaymentMethod = "transfer" | "qris" | "ewallet" | "cod";

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

  // ✅ UI Payment methods (no "midtrans")
  const [payment, setPayment] = useState<PaymentMethod>("transfer");

  const [status, setStatus] = useState<CheckoutState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [ongkir, setOngkir] = useState<number>(15000);

  const [buktiBayarFile, setBuktiBayarFile] = useState<File | null>(null);

  const alamatRef = useRef<HTMLInputElement | null>(null);

  const [mapsReady, setMapsReady] = useState(false);
  const [snapReady, setSnapReady] = useState(false);

  // cache payload untuk dipakai setelah pembayaran sukses
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

  // init autocomplete setelah script maps ready
  useEffect(() => {
    if (!mapsReady) return;
    if (typeof window === "undefined") return;

    const el = alamatRef.current;
    if (!el) return;

    if ((el as any)._autocomplete_done) return;
    (el as any)._autocomplete_done = true;

    try {
      const auto = new window.google.maps.places.Autocomplete(el, {
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

        setAlamat((prev) => (prev?.trim() ? prev : place.formatted_address || ""));
      });
    } catch {}
  }, [mapsReady]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;

    if (!nama.trim() || !hp.trim() || !alamat.trim()) {
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

    // ✅ bukti bayar hanya untuk transfer manual
    if (payment === "transfer" && !buktiBayarFile) {
      setErrorMsg("Upload bukti transfer dulu 🙏");
      return;
    }

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
      // ✅ ONLINE INSTAN (QRIS / E-WALLET) via Snap (tanpa sebut Midtrans)
      // =========================
      if (payment === "qris" || payment === "ewallet") {
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
            alamat,
            total: grandTotal,
            payment, // ✅ penting utk mapping
            cart: items.map((x) => ({ id: x.id, name: x.name, qty: x.qty, price: x.price })),
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

        return; // stop, jangan masuk manual order
      }

      // =========================
      // ✅ MANUAL (TRANSFER / COD) tetap seperti sekarang
      // =========================
      const fd = new FormData();
      fd.append("nama", nama);
      fd.append("hp", hp);
      fd.append("email", email);
      fd.append("alamat", alamat);
      fd.append("note", catatan);
      fd.append("payment", payment);
      fd.append("distanceKm", String(safeDistance));
      fd.append("shippingCost", String(safeOngkir));

      fd.append("promoAmount", String(promoAmount));
      fd.append("promoLabel", promoLabel);
      fd.append("grandTotal", String(grandTotal));
      fd.append(
        "cart",
        JSON.stringify(items.map((x) => ({ id: x.id, name: x.name, qty: x.qty, price: x.price })))
      );

      if (payment === "transfer" && buktiBayarFile) {
        fd.append("buktiBayar", buktiBayarFile);
      }

      const res2 = await fetch(`${window.location.origin}/api/order`, {
        method: "POST",
        body: fd,
      });

      if (!res2.ok) throw new Error("Order gagal");
      const out = await res2.json();
      if (!out?.success) throw new Error("API order gagal");

      clearCart();
      router.push("/");
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
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => setMapsReady(true)}
      />

      {/* Midtrans Snap (tetap production URL seperti kode lo sekarang) */}
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
                    {/* Transfer Bank (manual) */}
                    <label
                      className={`flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 ${
                        payment === "transfer" ? "bg-white border border-[#0FA3A8]" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        checked={payment === "transfer"}
                        onChange={() => setPayment("transfer")}
                      />
                      <span>Transfer Bank</span>
                    </label>

                    {/* QRIS (instan) */}
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

                    {/* E-Wallet (instan) */}
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

                    {/* Detail transfer */}
                    {payment === "transfer" && (
                      <div className="bg-white border rounded-xl p-4 mt-3 space-y-3">
                        <p className="text-sm font-medium">Rekening Transfer:</p>
                        <div className="text-sm flex justify-between gap-3">
                          <span>BCA — 5350429695 (KOJE)</span>
                          <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText("5350429695")}
                            className="text-[#0FA3A8] text-xs whitespace-nowrap"
                          >
                            Copy
                          </button>
                        </div>

                        <label className="block text-sm font-medium">Upload Bukti Transfer</label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => setBuktiBayarFile(e.target.files?.[0] || null)}
                          className="border rounded-lg px-3 py-2 w-full text-sm cursor-pointer"
                        />
                      </div>
                    )}

                    {/* Info kecil utk online (tanpa sebut midtrans) */}
                    {(payment === "qris" || payment === "ewallet") && (
                      <div className="bg-white border rounded-xl p-4 mt-3 space-y-2">
                        <p className="text-sm">
                          Pembayaran akan dibuka lewat popup aman. Pastikan popup tidak diblok browser.
                        </p>
                        <p className="text-xs text-gray-500">
                          Jika popup tidak muncul, coba refresh halaman.
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
