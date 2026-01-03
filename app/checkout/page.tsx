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

/* ======================
   UTIL
====================== */
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

/* ======================
   PAGE
====================== */
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

  const [payment, setPayment] = useState<PaymentMethod>("bank");
  const [status, setStatus] = useState<CheckoutState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [ongkir, setOngkir] = useState<number>(15000);

  const alamatRef = useRef<HTMLInputElement | null>(null);
  const [snapReady, setSnapReady] = useState(false);

  // 🔒 CACHE ORDER PAYLOAD (AMAN UNTUK SNAP)
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

  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
  const promoAmount = getDiscount();
  const promoLabel = promo?.kode ?? "";
  const total = Math.max(0, subtotal + ongkir - promoAmount);

  useEffect(() => {
    setHydrated(true);
    setTimeout(() => alamatRef.current?.focus(), 200);
  }, []);

  useEffect(() => {
    if (hydrated && items.length === 0) {
      setTimeout(() => router.push("/#produk"), 1200);
    }
  }, [items.length, hydrated, router]);

  /* ======================
     GPS ONGKIR
  ====================== */
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Perangkat tidak mendukung GPS");
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
        alert("Ongkir berhasil dihitung 🚚");
      },
      () => alert("Izin lokasi ditolak"),
      { enableHighAccuracy: true }
    );
  };

  /* ======================
     SIMPAN ORDER
  ====================== */
  const createOrderAfterSuccess = async () => {
    const p = lastPayloadRef.current;
    if (!p) return;

    const fd = new FormData();
    Object.entries(p).forEach(([k, v]) => {
      if (k === "cart") fd.append("cart", JSON.stringify(v));
      else fd.append(k, String(v));
    });

    await fetch("/api/order", { method: "POST", body: fd });
  };

  /* ======================
     SUBMIT
  ====================== */
  const finalAlamat = alamat || alamatRef.current?.value || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;

    if (!nama || !hp || !finalAlamat) {
      setErrorMsg("Lengkapi nama, WhatsApp, dan alamat");
      return;
    }
    if (!email.includes("@")) {
      setErrorMsg("Email tidak valid");
      return;
    }

    const safeDistance = distanceKm || 3;
    const safeOngkir = distanceKm ? ongkir : calcOngkir(3);
    const grandTotal = Math.max(0, subtotal + safeOngkir - promoAmount);

    setStatus("submitting");
    setErrorMsg("");

    // ✅ FIX PENTING DI SINI
    lastPayloadRef.current = {
      nama,
      hp,
      email,
      alamat: finalAlamat, // 🔥 FIX
      note: catatan,
      payment,
      distanceKm: safeDistance,
      shippingCost: safeOngkir,
      promoAmount,
      promoLabel,
      grandTotal,
      cart: items.map((x) => ({
        id: x.id,
        name: x.name,
        qty: x.qty,
        price: x.price,
      })),
    };

    try {
      if (payment !== "cod") {
        if (!snapReady || !window.snap) {
          setStatus("idle");
          setErrorMsg("Pembayaran belum siap");
          return;
        }

        const res = await fetch("/api/midtrans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama,
            hp,
            email,
            alamat: finalAlamat,
            total: grandTotal,
            payment,
            cart: items,
          }),
        });

        const data = await res.json();
        if (!data?.token) throw new Error("Token gagal");

        window.snap.pay(data.token, {
          onSuccess: async () => {
            await createOrderAfterSuccess();
            clearCart();
            router.push("/?payment=success");
          },
          onPending: () => router.push("/?payment=pending"),
          onError: () => setErrorMsg("Pembayaran gagal"),
          onClose: () => setStatus("idle"),
        });
        return;
      }

      await createOrderAfterSuccess();
      clearCart();
      router.push("/?payment=cod");
    } catch (e) {
      console.error(e);
      setErrorMsg("Terjadi kesalahan sistem");
      setStatus("idle");
    }
  };

  /* ======================
     RENDER
  ====================== */
  return (
    <>
      <Script
        src="https://app.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
        onLoad={() => setSnapReady(true)}
      />

      {/* === UI TETAP SAMA SEPERTI PUNYA LU === */}
      {/* (Tidak diubah sama sekali) */}
    </>
  );
}
