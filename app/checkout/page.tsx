"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import QRCode from "react-qr-code"; // ⬅️ pastikan sudah: npm install react-qr-code

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

const SELLER_INFO = {
  name: "KOJE24 Official",
  address: "Jl. Kopi Kenangan No. 24, Jakarta Selatan",
  hp: "0811-2233-4455",
};

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

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
        const res = await fetch(`/api/invoice/${invoiceId}`, {
          cache: "no-store",
        });
        const result = await res.json();
        if (res.ok && result.success) {
          setInvoice(result.data);
        } else {
          setError(result.message || "Invoice tidak ditemukan.");
        }
      } catch {
        setError("Terjadi kesalahan koneksi.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-lg">
        Memuat Invoice #{invoiceId}...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-red-600">
        {error}
      </div>
    );

  if (!invoice)
    return (
      <div className="flex items-center justify-center min-h-screen text-lg">
        Invoice tidak ditemukan.
      </div>
    );

  const getStatusStyle = (s: string) => {
    const x = s.toLowerCase();
    if (x === "paid") return "bg-green-100 text-green-700 border-green-300";
    if (x === "cod") return "bg-blue-100 text-blue-700 border-blue-300";
    return "bg-yellow-100 text-yellow-700 border-yellow-300";
  };

  // Format tanggal tetap pakai locale ID
  const formattedDate = new Date(invoice.timestamp).toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 print:p-0">
      {/* CSS khusus untuk print */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          .invoice-container {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            width: 100% !important;
            border-radius: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="invoice-container bg-white w-full max-w-3xl sm:max-w-4xl mx-auto rounded-lg sm:rounded-xl shadow-xl p-6 sm:p-10 border border-gray-200 relative">
        {/* === WATERMARK PAID DI TENGAH === */}
        {invoice.status.toLowerCase() === "paid" && (
          <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center">
            <span className="font-extrabold text-[72px] sm:text-[120px] text-green-600 opacity-10 sm:opacity-20 rotate-[-25deg] tracking-[0.2em]">
              PAID
            </span>
          </div>
        )}

        {/* === HEADER === */}
        <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0 mb-8">
          {/* KIRI: LOGO + ALAMAT */}
          <div className="flex flex-col gap-2">
            <img
              src="/image/logo-koje24.png"
              alt="KOJE24"
              className="h-12 sm:h-14 w-auto mb-1"
            />
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {SELLER_INFO.address}
              <br />
              Telp: {SELLER_INFO.hp}
            </p>
          </div>

          {/* KANAN: INFO INVOICE */}
          <div className="text-right space-y-1">
            <p className="text-2xl sm:text-3xl font-semibold tracking-wide text-[#0B4B50]">
              INVOICE
            </p>
            <p className="text-base sm:text-xl font-bold mt-1">
              #{invoice.invoiceId}
            </p>
            <p className="text-xs sm:text-sm mt-1 text-gray-600">
              Tanggal: {formattedDate}
            </p>
            <span
              className={`mt-3 inline-block px-3 sm:px-4 py-1 border rounded-full text-xs sm:text-sm font-semibold ${getStatusStyle(
                invoice.status
              )}`}
            >
              {invoice.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* === BILL TO === */}
        <div className="relative mb-6">
          <h3 className="text-xs sm:text-sm font-bold text-gray-700 mb-1">
            Pembeli
          </h3>
          <p className="text-sm sm:text-base text-gray-800 font-medium">
            {invoice.nama}
          </p>
          <p className="text-xs sm:text-sm text-gray-600">{invoice.alamat}</p>
          <p className="text-xs sm:text-sm text-gray-600">
            Telp: {invoice.hp}
          </p>
        </div>

        {/* === TABLE / DETAIL PRODUK === */}
        <div className="relative mb-6">
          <div className="hidden sm:block">
            {/* MODE TABEL utk layar >= sm */}
            <table className="w-full text-sm border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 py-2 text-left px-3">
                    Deskripsi
                  </th>
                  <th className="border border-gray-300 py-2 w-24 text-center">
                    Qty
                  </th>
                  <th className="border border-gray-300 py-2 w-40 text-right px-3">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 py-2 px-3">
                    {invoice.produkList}
                  </td>
                  <td className="border border-gray-200 text-center">
                    {invoice.qtyTotal}
                  </td>
                  <td className="border border-gray-200 text-right px-3">
                    {formatCurrency(invoice.subtotalCalc)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* MODE CARD LIST untuk HP */}
          <div className="sm:hidden border border-gray-200 rounded-lg p-3 space-y-1 text-sm">
            <p className="text-[11px] font-semibold text-gray-500 mb-1">
              Rincian Pesanan
            </p>
            <p className="font-medium text-gray-800">{invoice.produkList}</p>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Qty: {invoice.qtyTotal}</span>
              <span>{formatCurrency(invoice.subtotalCalc)}</span>
            </div>
          </div>
        </div>

        {/* === TOTAL SECTION === */}
        <div className="relative flex justify-end mb-8">
          <table className="text-sm w-full sm:w-auto sm:text-right">
            <tbody>
              <tr>
                <td className="py-1 px-2 sm:px-4 text-gray-600">
                  Subtotal Produk:
                </td>
                <td className="py-1 px-2 sm:px-4 font-medium text-right">
                  {formatCurrency(invoice.subtotalCalc)}
                </td>
              </tr>
              <tr>
                <td className="py-1 px-2 sm:px-4 text-gray-600">Ongkir:</td>
                <td className="py-1 px-2 sm:px-4 font-medium text-right">
                  {formatCurrency(invoice.effectiveOngkir)}
                </td>
              </tr>
              <tr className="text-base sm:text-lg font-bold bg-gray-50">
                <td className="py-2 px-2 sm:px-4">TOTAL DIBAYARKAN:</td>
                <td className="py-2 px-2 sm:px-4 text-red-600 text-right">
                  {formatCurrency(invoice.effectiveGrandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* === QR & BARCODE === */}
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mt-4 mb-8">
          <div className="text-xs sm:text-sm text-gray-700">
            <p>Scan untuk membuka invoice online:</p>
            <div className="mt-2 inline-block bg-white p-2 border rounded-md">
              <QRCode value={invoice.invoiceUrl} size={90} />
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end">
            <img
              src={`https://barcodeapi.org/api/128/${invoice.invoiceId}`}
              alt="barcode"
              className="h-14 sm:h-16"
            />
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
              {invoice.invoiceId}
            </p>
          </div>
        </div>

        {/* === FOOTER === */}
        <p className="relative text-center text-gray-600 text-[11px] sm:text-sm border-t pt-3 sm:pt-4">
          Terima kasih telah berbelanja di <strong>KOJE24</strong> 💛  
          Semoga sehat & berenergi setiap hari!
        </p>
      </div>

      {/* PRINT BUTTON (TIDAK STICKY, SESUAI PERMINTAAN A) */}
      <div className="text-center mt-6 no-print">
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-[#0FA3A8] text-white rounded-full shadow-md hover:bg-[#0b7f83] transition text-sm sm:text-base"
        >
          Cetak & Unduh Invoice
        </button>
      </div>
    </div>
  );
}
