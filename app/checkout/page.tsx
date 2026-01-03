"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import Script from "next/script";

declare const google: any;
declare global {
  interface Window {
    snap: any;
  }
}

type CheckoutState = "idle" | "submitting" | "error";

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

  const [payment, setPayment] = useState<"transfer" | "qris" | "cod">("transfer");
  const [status, setStatus] = useState<CheckoutState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [ongkir, setOngkir] = useState<number>(15000);
  const alamatRef = useRef<HTMLInputElement | null>(null);

  const subtotal = items.reduce((acc, it) => acc + it.price * it.qty, 0);
  const promoAmount = getDiscount();
  const promoLabel = promo?.kode ?? "";
  const total = Math.max(0, subtotal + ongkir - promoAmount);

  useEffect(() => {
    setHydrated(true);
    setTimeout(() => {
      alamatRef.current?.focus();
    }, 200);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (items.length === 0) {
      setTimeout(() => router.push("/#produk"), 1200);
    }
  }, [hydrated, items.length, router]);

  useEffect(() => {
    const el = alamatRef.current;
    if (!el || !(window as any).google?.maps?.places) return;
    if ((el as any)._auto) return;
    (el as any)._auto = true;

    const auto = new google.maps.places.Autocomplete(el, {
      componentRestrictions: { country: "id" },
      fields: ["formatted_address", "geometry"],
    });

    auto.addListener("place_changed", () => {
      const p = auto.getPlace();
      if (!p?.geometry?.location) return;
      const d = haversine(
        BASE_LAT,
        BASE_LNG,
        p.geometry.location.lat(),
        p.geometry.location.lng()
      );
      setDistanceKm(d);
      setOngkir(calcOngkir(d));
      setAlamat(p.formatted_address || "");
    });
  }, []);

  const handleDetectLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const d = haversine(
          BASE_LAT,
          BASE_LNG,
          pos.coords.latitude,
          pos.coords.longitude
        );
        setDistanceKm(d);
        setOngkir(calcOngkir(d));
      },
      () => alert("Izin lokasi ditolak"),
      { enableHighAccuracy: true }
    );
  };

  const submitOrderFinal = async () => {
    const fd = new FormData();
    fd.append("nama", nama);
    fd.append("hp", hp);
    fd.append("email", email);
    fd.append("alamat", alamat);
    fd.append("note", catatan);
    fd.append("payment", payment);
    fd.append("distanceKm", String(distanceKm || 0));
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

    await fetch("/api/order", { method: "POST", body: fd });
    clearCart();
    router.push("/");
  };

  const payWithMidtrans = async () => {
    const res = await fetch("/api/midtrans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama,
        hp,
        email,
        alamat,
        total,
        payment,
        cart: items,
      }),
    });

    const data = await res.json();
    if (!data?.token) throw new Error("Midtrans gagal");

    window.snap.pay(data.token, {
      onSuccess: async () => {
        await submitOrderFinal();
      },
      onPending: () => {
        alert("Menunggu pembayaran");
      },
      onError: () => {
        setErrorMsg("Pembayaran gagal");
        setStatus("idle");
      },
      onClose: () => {
        setStatus("idle");
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !hp || !alamat || !email.includes("@")) {
      setErrorMsg("Lengkapi data dengan benar");
      return;
    }

    if (!distanceKm) {
      setDistanceKm(3);
      setOngkir(calcOngkir(3));
    }

    try {
      setStatus("submitting");
      setErrorMsg("");

      if (payment === "transfer" || payment === "qris") {
        await payWithMidtrans();
        return;
      }

      await submitOrderFinal();
    } catch {
      setErrorMsg("Terjadi kesalahan");
      setStatus("idle");
    }
  };

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="lazyOnload"
      />
      <Script
        src="https://app.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />

      {/* ⬇️ UI TETAP – TIDAK DIUBAH */}
      {/* (SELURUH JSX FORM & RINGKASAN PESANAN LU PASTE APA ADANYA DI SINI) */}
    </>
  );
}
