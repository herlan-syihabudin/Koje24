"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCartStore } from "@/stores/cartStore";

declare global {
  interface Window {
    snap?: any;
  }
}

type CheckoutState = "idle" | "submitting" | "error";
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
  return Math.max(10000, Math.round((base + distanceKm * perKm) / 100) * 100);
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
  const [catatan, setCatatan] = useState("");

  const alamatRef = useRef<HTMLInputElement | null>(null);

  const [payment, setPayment] = useState<PaymentMethod>("bank");
  const [status, setStatus] = useState<CheckoutState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [ongkir, setOngkir] = useState<number>(15000);

  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
  const promoAmount = getDiscount();
  const total = Math.max(0, subtotal + ongkir - promoAmount);

  useEffect(() => {
    setHydrated(true);
    setTimeout(() => alamatRef.current?.focus(), 200);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (items.length === 0) {
      setTimeout(() => router.push("/#produk"), 1200);
    }
  }, [items.length, hydrated, router]);

  // ✅ GPS browser → ongkir presisi
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Perangkat tidak mendukung GPS.");
      return;
    }

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
        alert("Lokasi berhasil! Ongkir sudah dihitung 🚚");
      },
      () => alert("Izin lokasi ditolak 🙏"),
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;

    const alamatFinal = alamatRef.current?.value || "";

    if (!nama || !hp || !alamatFinal) {
      setErrorMsg("Lengkapi nama, WhatsApp, dan alamat ya 🙏");
      return;
    }

    if (!email.includes("@")) {
      setErrorMsg("Email tidak valid 🙏");
      return;
    }

    try {
      setStatus("submitting");
      setErrorMsg("");

      const safeDistance = distanceKm || 3;
      const safeOngkir = distanceKm ? ongkir : calcOngkir(3);
      const grandTotal = subtotal + safeOngkir - promoAmount;

      if (payment !== "cod") {
        const res = await fetch("/api/midtrans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama,
            hp,
            email,
            alamat: alamatFinal,
            total: grandTotal,
            payment,
          }),
        });

        const data = await res.json();
        if (!data?.token) throw new Error("Token gagal");

        window.snap.pay(data.token, {
          onSuccess: () => {
            clearCart();
            router.push("/?payment=success");
          },
          onPending: () => router.push("/?payment=pending"),
          onError: () => setErrorMsg("Pembayaran gagal"),
        });
        return;
      }

      clearCart();
      router.push("/?payment=cod");
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan sistem 🙏");
      setStatus("idle");
    }
  };

  return (
    <>
      {/* Midtrans Snap */}
      <Script
        src="https://app.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />

      <main className="min-h-screen bg-[#F4FAFA] py-10 px-4 flex justify-center">
        <form
          onSubmit={handleSubmit}
          className="bg-white max-w-xl w-full p-6 rounded-2xl space-y-4 shadow"
        >
          <input className="border p-2 w-full" placeholder="Nama" value={nama} onChange={e => setNama(e.target.value)} />
          <input className="border p-2 w-full" placeholder="WhatsApp" value={hp} onChange={e => setHp(e.target.value)} />
          <input className="border p-2 w-full" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input ref={alamatRef} className="border p-2 w-full" placeholder="Alamat lengkap" />

          <button type="button" onClick={handleDetectLocation} className="bg-teal-500 text-white py-2 w-full rounded">
            📍 Hitung Ongkir Pakai Lokasi Saya
          </button>

          <p className="text-sm text-gray-600">
            Ongkir: Rp{ongkir.toLocaleString("id-ID")}
          </p>

          {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

          <button
            disabled={status === "submitting"}
            className="bg-teal-600 text-white py-3 w-full rounded font-semibold"
          >
            {status === "submitting" ? "Memproses..." : "Buat Pesanan"}
          </button>
        </form>
      </main>
    </>
  );
}
