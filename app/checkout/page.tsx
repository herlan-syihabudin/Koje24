"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import Script from "next/script";

declare const google: any;

type CheckoutState = "idle" | "submitting" | "error";

const BASE_LAT = -6.2903238;
const BASE_LNG = 107.087373;

// hitung jarak km (haversine)
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

// hitung ongkir Jakarta Timur
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
  const total = Math.max(0, subtotal + (items.length ? ongkir : 0) - promoAmount);

  useEffect(() => {
    setHydrated(true);
    window.scrollTo({ top: 0 });
  }, []);

  // redirect kalau keranjang kosong
  useEffect(() => {
    if (!hydrated) return;
    if (items.length === 0) {
      const t = setTimeout(() => router.push("/#produk"), 1600);
      return () => clearTimeout(t);
    }
  }, [items.length, hydrated, router]);

  // GOOGLE AUTOCOMPLETE
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

        setAlamat((prev) => prev || place.formatted_address);
      });
    } catch {}
  }, []);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Perangkat tidak mendukung GPS lokasi.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const dKm = haversineDistance(BASE_LAT, BASE_LNG, latitude, longitude);

        setDistanceKm(dKm);
        setOngkir(calcOngkir(dKm));
        alert("GPS berhasil! Ongkir sudah dihitung otomatis 🚚");
      },
      () => alert("Izin GPS ditolak. Aktifkan lokasi ya 🙏"),
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;

    if (!nama.trim() || !hp.trim() || !alamat.trim()) {
      setErrorMsg("Lengkapi nama, nomor WhatsApp, dan alamat ya 🙏");
      return;
    }

    if (!distanceKm) {
      setDistanceKm(3);
      setOngkir(calcOngkir(3));
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
      fd.append("cart", JSON.stringify(cartMapped));
      if (buktiBayarFile) fd.append("buktiBayar", buktiBayarFile);

      const res = await fetch("/api/order", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok || !data?.success) throw new Error(data?.message || "Gagal membuat invoice");

      clearCart();

      // 🔥 NEW: pertama redirect ke halaman invoice
      router.push(data.invoiceUrl);

      // ⏳ NEW: lalu otomatis buka WhatsApp setelah 0.8 detik
      if (data.waUrl) {
        setTimeout(() => {
          window.location.href = data.waUrl;
        }, 800);
      }

    } catch {
      setStatus("error");
      setErrorMsg("Ada kendala saat membuat invoice — coba sebentar lagi 🙏");
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
        <div className="w-full max-w-5xl">
          <div className="mb-8">
            <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">KOJE24 • CHECKOUT</p>
            <h1 className="text-3xl md:text-4xl font-playfair font-semibold">Selesaikan Pesanan Kamu</h1>
          </div>
