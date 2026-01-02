"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCartStore } from "@/stores/cartStore";

declare global {
  interface Window {
    google: any;
    snap: any;
  }
}

type CheckoutState = "idle" | "submitting" | "error";

const BASE_LAT = -6.2903238;
const BASE_LNG = 107.087373;

/* =======================
   UTILS
======================= */
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

/* =======================
   PAGE
======================= */
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
  const [ongkir, setOngkir] = useState(15000);
  const [buktiBayarFile, setBuktiBayarFile] = useState<File | null>(null);

  const alamatRef = useRef<HTMLInputElement | null>(null);

  // ✅ READY FLAGS (anti blank)
  const [mapsReady, setMapsReady] = useState(false);
  const [snapReady, setSnapReady] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((a, b) => a + b.price * b.qty, 0),
    [items]
  );

  const promoAmount = getDiscount();
  const promoLabel = promo?.kode ?? "";
  const total = Math.max(0, subtotal + ongkir - promoAmount);

  /* =======================
     EFFECTS
  ======================= */
  useEffect(() => {
    setHydrated(true);
    const t = setTimeout(() => alamatRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (items.length !== 0) return;
    const t = setTimeout(() => router.push("/#produk"), 1200);
    return () => clearTimeout(t);
  }, [hydrated, items.length, router]);

  /**
   * ✅ GOOGLE AUTOCOMPLETE (SAFE)
   * - hanya jalan setelah script onLoad → mapsReady true
   */
  useEffect(() => {
    if (!mapsReady) return;

    const el = alamatRef.current;
    if (!el) return;

    if ((el as any)._auto) return;
    (el as any)._auto = true;

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
        setAlamat(place.formatted_address || "");
      });
    } catch {
      // kalau error, biarkan user input manual
    }
  }, [mapsReady]);

  const detectLocation = () => {
    if (typeof window === "undefined") return;

    if (!navigator.geolocation) {
      alert("Perangkat tidak mendukung GPS.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (p) => {
        const d = haversine(
          BASE_LAT,
          BASE_LNG,
          p.coords.latitude,
          p.coords.longitude
        );
        setDistanceKm(d);
        setOngkir(calcOngkir(d));
        alert("Lokasi berhasil dideteksi 🚚");
      },
      () => alert("Izin lokasi ditolak"),
      { enableHighAccuracy: true }
    );
  };

  /* =======================
     SUBMIT
  ======================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;

    // basic validation
    if (!nama.trim() || !hp.trim() || !alamat.trim()) {
      setErrorMsg("Lengkapi nama, nomor WhatsApp, dan alamat ya 🙏");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Masukkan email yang valid ya 🙏");
      return;
    }

    setStatus("submitting");
    setErrorMsg("");

    try {
      /* ========= MIDTRANS ========= */
      if (payment === "midtrans") {
        if (!snapReady || !window.snap) {
          setStatus("idle");
          setErrorMsg("Sistem pembayaran belum siap. Coba refresh ya 🙏");
          return;
        }

        const res = await fetch("/api/midtrans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama,
            hp,
            email,
            alamat,
            total,
            cart: items.map((x) => ({
              id: x.id,
              name: x.name,
              qty: x.qty,
              price: x.price,
            })),
          }),
        });

        const data = await res.json();
        if (!res.ok || !data?.token) throw new Error("Midtrans gagal");

        window.snap.pay(data.token, {
          onSuccess: () => {
            clearCart();
            router.push("/?payment=success");
          },
          onPending: () => {
            router.push("/?payment=pending");
          },
          onError: () => {
            setErrorMsg("Pembayaran gagal 🙏");
            setStatus("idle");
          },
          onClose: () => {
            setStatus("idle");
          },
        });

        return;
      }

      /* ========= MANUAL ========= */
      if (["transfer", "qris"].includes(payment) && !buktiBayarFile) {
        setErrorMsg("Upload bukti pembayaran dulu 🙏");
        setStatus("idle");
        return;
      }

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
        JSON.stringify(
          items.map((x) => ({
            id: x.id,
            name: x.name,
            qty: x.qty,
            price: x.price,
          }))
        )
      );
      if (buktiBayarFile) fd.append("buktiBayar", buktiBayarFile);

      const res2 = await fetch("/api/order", { method: "POST", body: fd });
      if (!res2.ok) throw new Error("Order gagal");

      clearCart();
      router.push("/");
    } catch {
      setErrorMsg("Terjadi kesalahan sistem 🙏");
      setStatus("idle");
    }
  };

  const disabled = status === "submitting";

  /* =======================
     RENDER
  ======================= */
  return (
    <>
      {/* Google Maps */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => setMapsReady(true)}
        onError={() => setMapsReady(false)}
      />

      {/* MIDTRANS */}
      <Script
        src="https://app.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
        onLoad={() => setSnapReady(true)}
        onError={() => setSnapReady(false)}
      />

      {/* =========================
          ✅ UI KAMU TARO DI SINI
          (layout checkout sebelumnya)
          - input pakai state: nama, hp, email, alamat, catatan
          - alamat input kasih ref={alamatRef}
          - tombol submit pakai onSubmit={handleSubmit}
          - tombol detect location pakai onClick={detectLocation}
          - radio payment include "midtrans"
          - disable submit: disabled
          - tampilkan errorMsg
         ========================= */}

      {/* Contoh minimal biar gak blank */}
      <main className="min-h-screen p-6">
        <form onSubmit={handleSubmit} className="space-y-3 max-w-lg">
          <input
            ref={alamatRef}
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            placeholder="Alamat"
            className="border p-2 w-full"
          />

          <button
            type="button"
            onClick={detectLocation}
            className="border px-3 py-2"
          >
            Hitung ongkir pakai GPS
          </button>

          <div className="text-sm">
            Ongkir: Rp{ongkir.toLocaleString("id-ID")} • Total: Rp
            {total.toLocaleString("id-ID")}
          </div>

          {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

          <button
            disabled={disabled}
            className="bg-black text-white px-4 py-2 disabled:opacity-50"
          >
            {status === "submitting" ? "Memproses..." : "Buat Pesanan"}
          </button>
        </form>
      </main>
    </>
  );
}
