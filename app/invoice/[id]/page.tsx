'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from "next/navigation";
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

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

// 🔥 FIX timestamp format "30/11/2025, 14.00.54"
const parseTimestamp = (ts: string) => {
  if (!ts) return null;
  const [tanggal, waktu] = ts.split(", ");
  const [dd, mm, yyyy] = tanggal.split("/");
  const waktuFix = waktu.replace(/\./g, ":");
  const iso = `${yyyy}-${mm}-${dd}T${waktuFix}`;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
};

export default function InvoicePage() {
  const { id } = useParams();
  const invoiceId = String(id);

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!invoiceId) return;
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/invoice/${invoiceId}`, { cache: "no-store" });
        const result = await res.json();
        if (res.ok && result.success) setInvoice(result.data);
        else setError(result.message);
      } catch {
        setError("Terjadi kesalahan koneksi.");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [invoiceId]);

  if (loading) return <div className="flex items-center justify-center min-h-screen text-lg">Memuat Invoice #{invoiceId}...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-lg text-red-600">{error}</div>;
  if (!invoice) return <div className="flex items-center justify-center min-h-screen text-lg">Invoice tidak ditemukan.</div>;

  const parsedDate = parseTimestamp(invoice.timestamp);
  const tanggal = parsedDate
    ? parsedDate.toLocaleString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : invoice.timestamp;

  const getStatusStyle = (s: string) => {
    const x = s.toLowerCase();
    if (x === "paid") return "bg-green-100 text-green-700 border-green-300";
    if (x === "cod") return "bg-blue-100 text-blue-700 border-blue-300";
    return "bg-yellow-100 text-yellow-700 border-yellow-300";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 print:p-0">
      <style jsx global>{`
        @media print {
          body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
          .invoice-container { box-shadow: none !important; border: none !important; margin: 0 !important; width: 100% !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="invoice-container bg-white max-w-4xl mx-auto rounded-lg shadow-xl p-10 border border-gray-200 relative">
        
        {/* === WATERMARK PAID TENGAH === */}
        {invoice.status.toLowerCase() === "paid" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="font-extrabold text-[130px] text-green-600 opacity-15 rotate-[-25deg] tracking-wider">
              PAID
            </span>
          </div>
        )}

        {/* === HEADER === */}
        <div className="flex justify-between mb-8 items-start">
          <div>
            <img
              src="/image/logo-koje24.png"
              alt="KOJE24"
              className="h-14 w-auto mb-2"
            />
            <p className="text-sm text-gray-600 mt-1">
              Jl. Kopi Kenangan No. 24, Jakarta Selatan<br />
              Telp: 0811-2233-4455
            </p>
          </div>

          <div className="text-right">
            <p className="text-3xl font-semibold tracking-wide text-[#0B4B50]">INVOICE</p>
            <p className="text-xl font-bold mt-1">#{invoice.invoiceId}</p>
            <p className="text-sm mt-1">Tanggal: {tanggal}</p>
            <span
              className={`mt-3 inline-block px-4 py-1 border rounded-full text-sm font-semibold ${getStatusStyle(invoice.status)}`}
            >
              {invoice.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* === BILL TO === */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-700 mb-1">Pembeli</h3>
          <p className="text-gray-800 font-medium">{invoice.nama}</p>
          <p className="text-gray-600">{invoice.alamat}</p>
          <p className="text-gray-600">Telp: {invoice.hp}</p>
        </div>

        {/* === TABLE === */}
        <table className="w-full text-sm border border-gray-300 mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 py-2 text-left px-3">Deskripsi</th>
              <th className="border border-gray-300 py-2 w-24 text-center">Qty</th>
              <th className="border border-gray-300 py-2 w-40 text-right px-3">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-200 py-2 px-3">{invoice.produkList}</td>
              <td className="border border-gray-200 text-center">{invoice.qtyTotal}</td>
              <td className="border border-gray-200 text-right px-3">{formatCurrency(invoice.subtotalCalc)}</td>
            </tr>
          </tbody>
        </table>

        {/* === TOTAL SECTION === */}
        <div className="flex justify-end mb-8">
          <table className="text-sm">
            <tbody>
              <tr>
                <td className="py-1 px-4">Subtotal Produk:</td>
                <td className="text-right font-medium py-1 px-4">{formatCurrency(invoice.subtotalCalc)}</td>
              </tr>
              <tr>
                <td className="py-1 px-4">Ongkir:</td>
                <td className="text-right font-medium py-1 px-4">{formatCurrency(invoice.effectiveOngkir)}</td>
              </tr>
              <tr className="text-lg font-bold bg-gray-50">
                <td className="py-2 px-4">TOTAL DIBAYARKAN:</td>
                <td className="text-right text-red-600 py-2 px-4">{formatCurrency(invoice.effectiveGrandTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* === QR & BARCODE === */}
        <div className="flex justify-between items-center mt-6 mb-10">
          <div className="text-sm text-gray-700">
            Scan untuk membuka invoice online:
            <QRCode value={invoice.invoiceUrl} size={90} className="mt-2" />
          </div>
          <img
            src={`https://barcodeapi.org/api/128/${invoice.invoiceId}`}
            alt="barcode"
            className="h-16"
          />
        </div>

        {/* === FOOTER === */}
        <p className="text-center text-gray-600 text-sm border-t pt-4">
          Terima kasih telah berbelanja di <strong>KOJE24</strong> 💛  
          Semoga sehat & berenergi setiap hari!
        </p>
      </div>

      {/* PRINT BUTTON */}
      <div className="text-center mt-6 no-print">
        <button
  onClick={() =>
    window.location.href = `/api/invoice-pdf/${invoice.invoiceId}`
  }
  className="px-6 py-2 bg-[#C62828] text-white rounded-full shadow-md hover:bg-[#b12121] transition mt-3 text-sm sm:text-base"
>
  📄 Download PDF Resmi (A4)
</button>
      </div>
    </div>
  );
}
