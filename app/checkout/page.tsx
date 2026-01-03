"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import Script from "next/script";

type CheckoutState = "idle" | "submitting" | "error";

const BASE_LAT = -6.2903238;
const BASE_LNG = 107.087373;

/* =========================
   UTILS
========================= */
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
  return Math.max(10000, Math.round(raw / 100) * 100);
}

/* =========================
   PAGE
========================= */
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

  const [payment, setPayment] = useState<"bank" | "ewallet" | "cod">("bank");
  const [status, setStatus] = useState<CheckoutState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [ongkir, setOngkir] = useState<number>(15000);

  const alamatRef = useRef<HTMLInputElement | null>(null);

  const subtotal = items.reduce((a, b) => a + b.price * b.qty, 0);
  const promoAmount = getDiscount();
  const promoLabel = promo?.kode ?? "";
  const total = Math.max(0, subtotal + ongkir - promoAmount);

  /* =========================
     HYDRATE
  ========================= */
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && items.length === 0) {
      router.push("/#produk");
    }
  }, [hydrated, items.length, router]);

  /* =========================
     GPS ONGKIR
  ========================= */
  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
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
      },
      () => alert("Izin lokasi ditolak")
    );
  };

  /* =========================
     SUBMIT FINAL (SHEET)
  ========================= */
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
      JSON.stringify(
        items.map((x) => ({
          id: x.id,
          name: x.name,
          qty: x.qty,
          price: x.price,
        }))
      )
    );

    const res = await fetch("/api/order", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    if (!data?.success) throw new Error("Order gagal");

    clearCart();
    router.push("/");
  };

  /* =========================
     HANDLE SUBMIT
  ========================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !hp || !alamat || !email) {
      setErrorMsg("Lengkapi data terlebih dahulu");
      return;
    }

    // 🔥 MIDTRANS
    if (payment === "bank" || payment === "ewallet") {
      try {
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
          }),
        });

        const data = await res.json();
        if (!data?.token) throw new Error("Midtrans error");

        (window as any).snap.pay(data.token, {
          onSuccess: async () => {
            await submitOrderFinal();
          },
          onError: () => setErrorMsg("Pembayaran gagal"),
        });
      } catch {
        setErrorMsg("Gagal membuka pembayaran");
      }
      return;
    }

    // COD
    await submitOrderFinal();
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <>
      <Script
        src="https://app.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />

      <main className="min-h-screen bg-[#F4FAFA] py-10 px-4">
        <form
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto bg-white p-6 rounded-2xl space-y-4"
        >
          <input className="border p-2 w-full" placeholder="Nama" value={nama} onChange={(e) => setNama(e.target.value)} />
          <input className="border p-2 w-full" placeholder="WhatsApp" value={hp} onChange={(e) => setHp(e.target.value)} />
          <input className="border p-2 w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="border p-2 w-full" placeholder="Alamat" value={alamat} onChange={(e) => setAlamat(e.target.value)} />

          <button type="button" onClick={handleDetectLocation} className="bg-teal-500 text-white w-full py-2 rounded">
            Hitung Ongkir GPS
          </button>

          <div className="space-y-2">
            <label><input type="radio" checked={payment==="bank"} onChange={()=>setPayment("bank")} /> Transfer Bank</label><br/>
            <label><input type="radio" checked={payment==="ewallet"} onChange={()=>setPayment("ewallet")} /> E-Wallet</label><br/>
            <label><input type="radio" checked={payment==="cod"} onChange={()=>setPayment("cod")} /> COD</label>
          </div>

          {errorMsg && <p className="text-red-500">{errorMsg}</p>}

          <button className="bg-[#0FA3A8] text-white w-full py-3 rounded-full">
            Bayar Sekarang
          </button>
        </form>
      </main>
    </>
  );
}
