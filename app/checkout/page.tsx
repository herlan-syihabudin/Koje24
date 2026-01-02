"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import Script from "next/script";

declare const google: any;
declare const window: any;

type CheckoutState = "idle" | "submitting" | "error";

const BASE_LAT = -6.2903238;
const BASE_LNG = 107.087373;

/* =====================
   HELPER
===================== */
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

/* =====================
   COMPONENT
===================== */
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

  const [payment, setPayment] = useState<
    "transfer" | "qris" | "midtrans" | "cod"
  >("transfer");

  const [status, setStatus] = useState<CheckoutState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [ongkir, setOngkir] = useState<number>(15000);
  const [buktiBayarFile, setBuktiBayarFile] = useState<File | null>(null);
  const alamatRef = useRef<HTMLInputElement | null>(null);

  const subtotal = items.reduce((acc, it) => acc + it.price * it.qty, 0);
  const promoAmount = getDiscount();
  const promoLabel = promo?.kode ?? "";
  const total = Math.max(0, subtotal + ongkir - promoAmount);

  /* =====================
     INIT
  ===================== */
  useEffect(() => {
    setHydrated(true);
    setTimeout(() => {
      alamatRef.current?.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 200);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (items.length === 0) {
      const t = setTimeout(() => router.push("/#produk"), 1200);
      return () => clearTimeout(t);
    }
  }, [items.length, hydrated, router]);

  /* =====================
     GOOGLE AUTOCOMPLETE
  ===================== */
  useEffect(() => {
    const el = alamatRef.current;
    if (!el || !google?.maps?.places) return;
    if ((el as any)._done) return;
    (el as any)._done = true;

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
      setAlamat(place.formatted_address || "");
    });
  }, []);

  const handleDetectLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dKm = haversine(
          BASE_LAT,
          BASE_LNG,
          pos.coords.latitude,
          pos.coords.longitude
        );
        setDistanceKm(dKm);
        setOngkir(calcOngkir(dKm));
        alert("📍 Lokasi terdeteksi, ongkir dihitung");
      },
      () => alert("Izin lokasi ditolak"),
      { enableHighAccuracy: true }
    );
  };

  /* =====================
     SUBMIT
  ===================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;

    if (!nama || !hp || !alamat || !email.includes("@")) {
      setErrorMsg("Lengkapi data (nama, WA, email, alamat)");
      return;
    }

    /* =====================
       MIDTRANS FLOW
    ===================== */
    if (payment === "midtrans") {
      try {
        setStatus("submitting");

        const res = await fetch("/api/midtrans/snap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama,
            email,
            hp,
            alamat,
            items,
            ongkir,
            promoAmount,
            promoLabel,
            total,
          }),
        });

        const data = await res.json();
        if (!data?.token) throw new Error("Snap token error");

        window.snap.pay(data.token, {
          onSuccess: () => {
            clearCart();
            router.push("/");
          },
          onPending: () => alert("Menunggu pembayaran"),
          onError: () => alert("Pembayaran gagal"),
          onClose: () => setStatus("idle"),
        });

        return;
      } catch {
        setStatus("error");
        setErrorMsg("Gagal memproses pembayaran online");
        return;
      }
    }

    /* =====================
       TRANSFER / QRIS / COD
    ===================== */
    if (
      (payment === "transfer" || payment === "qris") &&
      !buktiBayarFile
    ) {
      setErrorMsg("Upload bukti pembayaran");
      return;
    }

    try {
      setStatus("submitting");

      const fd = new FormData();
      fd.append("nama", nama);
      fd.append("hp", hp);
      fd.append("email", email);
      fd.append("alamat", alamat);
      fd.append("note", catatan);
      fd.append("payment", payment);
      fd.append("shippingCost", String(ongkir));
      fd.append("promoAmount", String(promoAmount));
      fd.append("promoLabel", promoLabel);
      fd.append("grandTotal", String(total));
      fd.append(
        "cart",
        JSON.stringify(items.map((x) => ({
          id: x.id,
          name: x.name,
          qty: x.qty,
          price: x.price,
        })))
      );

      if (buktiBayarFile) fd.append("buktiBayar", buktiBayarFile);

      const res = await fetch("/api/order", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error();
      clearCart();
      router.push("/");
    } catch {
      setStatus("error");
      setErrorMsg("Gagal memproses pesanan");
    }
  };

  /* =====================
     RENDER
  ===================== */
  return (
    <>
      {/* GOOGLE MAPS */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="lazyOnload"
      />

      {/* MIDTRANS SNAP */}
      <Script
        src="https://app.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />

      <main className="min-h-screen bg-[#F4FAFA] py-10 px-4 flex justify-center">
        <div className="w-full max-w-6xl space-y-6">
          <h1 className="text-3xl font-playfair font-semibold">
            Selesaikan Pesanan
          </h1>

          <form
            onSubmit={handleSubmit}
            className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]"
          >
            {/* FORM */}
            <section className="bg-white border rounded-3xl p-6 space-y-4">
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
                placeholder="Email"
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
                className="bg-[#0FA3A8] text-white py-2 rounded-lg"
              >
                📍 Hitung Ongkir Otomatis
              </button>

              <textarea
                className="border rounded-lg px-3 py-2 w-full"
                placeholder="Catatan"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
              />

              <h2 className="font-semibold">Metode Pembayaran</h2>

              {(["transfer", "qris", "midtrans", "cod"] as const).map((p) => (
                <label key={p} className="flex gap-2">
                  <input
                    type="radio"
                    checked={payment === p}
                    onChange={() => setPayment(p)}
                  />
                  <span>
                    {p === "midtrans"
                      ? "Online Payment (Midtrans)"
                      : p === "cod"
                      ? "COD"
                      : p}
                  </span>
                </label>
              ))}

              {(payment === "transfer" || payment === "qris") && (
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) =>
                    setBuktiBayarFile(e.target.files?.[0] || null)
                  }
                />
              )}

              {errorMsg && (
                <p className="text-red-600 text-sm">{errorMsg}</p>
              )}

              <button
                disabled={status === "submitting"}
                className="bg-[#0FA3A8] text-white py-3 rounded-full font-semibold"
              >
                {status === "submitting"
                  ? "Memproses..."
                  : "Buat Pesanan"}
              </button>
            </section>

            {/* SUMMARY */}
            <aside className="bg-white border rounded-3xl p-6 space-y-3">
              <h2 className="font-semibold">Ringkasan</h2>
              <div>Subtotal: Rp{subtotal.toLocaleString("id-ID")}</div>
              <div>Ongkir: Rp{ongkir.toLocaleString("id-ID")}</div>
              {promoAmount > 0 && (
                <div className="text-green-600">
                  {promoLabel}: -Rp{promoAmount.toLocaleString("id-ID")}
                </div>
              )}
              <div className="font-bold text-lg">
                Total: Rp{total.toLocaleString("id-ID")}
              </div>
            </aside>
          </form>
        </div>
      </main>
    </>
  );
}
