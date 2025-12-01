"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import QRCode from "react-qr-code";

interface InvoiceData {
  invoiceId: string;
  timestamp: string;
  nama: string;
  hp: string;
  alamat: string;
  produkList: string;
  qtyTotal: number;
  subtotalCalc: number;
  status: string;
  paymentLabel: string;
  effectiveOngkir: number;
  effectiveGrandTotal: number;
  invoiceUrl: string;
}

const formatTanggal = (timestamp: string) => {
  try {
    const [tgl, jam] = timestamp.split(",");
    return `${tgl.trim()} pukul ${jam.trim()}`;
  } catch {
    return timestamp;
  }
};

const formatCurrency = (value: number) =>
  value.toLocaleString("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 });

export default function InvoicePage() {
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("id");
  const [data, setData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!invoiceId) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/invoice?id=${invoiceId}`);
        const json = await res.json();
        if (json?.success) setData(json.data);
      } catch {}
      setLoading(false);
    };
    load();
  }, [invoiceId]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
        Memuat invoice…
      </div>
    );

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-lg">
        Invoice tidak ditemukan.
      </div>
    );

  const produkArray = data.produkList
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s);

  return (
    <main className="min-h-screen bg-[#F4FAFA] flex justify-center py-10 px-4">
      {/* === CONTAINER A4 FIX ALL DEVICES === */}
      <div
        className="bg-white border rounded-3xl shadow-xl p-10"
        style={{
          width: "210mm",
          minHeight: "297mm",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* HEADER */}
        <div className="flex justify-between flex-wrap gap-3">
          <div>
            <Image src="/logo.png" alt="KOJE24" width={130} height={50} />
            <p className="text-sm mt-2 font-medium">Jl. Kopi Kenangan No. 24, Jakarta Selatan</p>
            <p className="text-sm">Telp: 0811-2233-4455</p>
          </div>

          <div className="text-right">
            <h1 className="font-playfair text-3xl font-bold text-[#0B4B50] mb-1">INVOICE</h1>
            <p className="font-semibold text-gray-700">#{data.invoiceId}</p>
            <p className="text-sm text-gray-500 mt-1">{formatTanggal(data.timestamp)}</p>
            <span
              className={`inline-block mt-2 px-4 py-1 text-sm font-semibold rounded-full ${
                data.status === "PAID"
                  ? "bg-green-100 text-green-700"
                  : data.status === "Pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {data.paymentLabel}
            </span>
          </div>
        </div>

        {/* PEMBELI */}
        <div className="mt-10">
          <h2 className="font-semibold text-[#0B4B50]">Pembeli</h2>
          <p className="mt-1 capitalize">{data.nama}</p>
          <p className="text-gray-700">{data.alamat}</p>
          <p className="text-gray-700">Telp: {data.hp}</p>
        </div>

        {/* TABEL PRODUK */}
        <div className="mt-10 border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F4FAFA] text-[#0B4B50]">
              <tr>
                <th className="text-left p-3 font-semibold">Deskripsi</th>
                <th className="text-center p-3 font-semibold w-20">Qty</th>
                <th className="text-right p-3 font-semibold w-32">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {produkArray.map((item, i) => {
                const qtyMatch = item.match(/\((\d+)x\)/);
                const qty = qtyMatch ? parseInt(qtyMatch[1]) : 1;

                const priceMatch = item.match(/Rp([\d.]+)/);
                const subtotal = priceMatch ? parseInt(priceMatch[1].replace(/\./g, "")) : 0;

                return (
                  <tr key={i} className="border-t">
                    <td className="p-3">{item.replace(/\(\d+x\)/, "").trim()}</td>
                    <td className="text-center p-3">{qty}</td>
                    <td className="text-right p-3">{formatCurrency(subtotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* TOTAL */}
        <div className="mt-10 flex justify-end">
          <div className="text-sm space-y-1">
            <div className="flex justify-between gap-10">
              <span>Subtotal Produk:</span>
              <span>{formatCurrency(data.subtotalCalc)}</span>
            </div>
            <div className="flex justify-between gap-10">
              <span>Ongkir:</span>
              <span>{formatCurrency(data.effectiveOngkir)}</span>
            </div>
            <div className="flex justify-between gap-10 font-semibold text-lg pt-2">
              <span>Total Dibayarkan:</span>
              <span className="text-[#C62828]">{formatCurrency(data.effectiveGrandTotal)}</span>
            </div>
          </div>
        </div>

        {/* QR + BARCODE */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-12 gap-10">
          <div className="text-center">
            <p className="text-sm mb-2">Scan untuk membuka invoice online:</p>
            <QRCode value={data.invoiceUrl} size={140} />
          </div>

          {/* BARCODE AMAN TANPA LIBRARY */}
          <div className="text-center">
            <img
              src={`https://barcodeapi.org/api/128/${data.invoiceId}`}
              alt="barcode"
              className="h-16 mx-auto"
            />
            <p className="text-xs mt-1">{data.invoiceId}</p>
          </div>
        </div>

        <p className="mt-16 text-center text-sm text-gray-600">
          Terima kasih telah berbelanja di <span className="text-[#0FA3A8] font-semibold">KOJE24</span> 💛
          Semoga sehat & berenergi setiap hari!
        </p>
      </div>
    </main>
  );
}
