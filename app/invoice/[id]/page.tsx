"use client";

import React, { useState, useEffect } from "react";
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
  const isPrintMode =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("print") === "1";

  const params = useParams();
  const invoiceId = params?.id ? String(params.id) : "";

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!invoiceId) return;
    let active = true;

    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/invoice/${invoiceId}`, { cache: "no-store" });
        const result = await res.json();

        if (!active) return;

        if (res.ok && result.success) setInvoice(result.data);
        else setError(result.message || "Invoice tidak ditemukan.");
      } catch {
        if (active) setError("Terjadi kesalahan koneksi.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchInvoice();
    return () => {
      active = false;
    };
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

  const parsedDate = parseTimestamp(invoice.timestamp);
  const tanggal = parsedDate
    ? parsedDate.toLocaleString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : invoice.timestamp;

  const getStatusStyle = (s: string) => {
    const x = s.toLowerCase();
    if (x.includes("paid")) return "bg-green-100 text-green-700 border-green-300";
    if (x.includes("cod")) return "bg-blue-100 text-blue-700 border-blue-300";
    if (x.includes("pending") || x.includes("belum"))
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    return "bg-gray-200 text-gray-700 border-gray-300";
  };

  return (
  <div
    className={`min-h-screen p-4 sm:p-8 print:p-0 ${
      isPrintMode ? "bg-white" : "bg-gray-100"
    }`}
  >
    {/* DOWNLOAD BUTTON */}
    <div className="w-full flex justify-end mb-5 no-print">
      <a
        href={`/api/invoice-pdf/${invoice.invoiceId}`}
        download={`invoice-${invoice.invoiceId}.pdf`}
        className="download-btn px-5 py-2 bg-[#C62828] text-white rounded-full shadow-md hover:bg-[#b12121] transition text-sm sm:text-base font-semibold"
      >
        ⬇ Download Invoice (PDF)
      </a>
    </div>

    {/* INVOICE BOX */}
    <div className="invoice-container bg-white max-w-4xl mx-auto rounded-lg shadow-xl p-10 border border-gray-200 relative">
      {invoice.status.toLowerCase().includes("paid") && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="font-extrabold text-[130px] text-green-600 opacity-15 rotate-[-25deg] tracking-wider">
            PAID
          </span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between mb-8 items-start">
        <div>
          <img src="/image/logo-koje24.png" alt="KOJE24" className="h-14 w-auto mb-2" />
          <p className="text-sm text-gray-600 mt-1">
            Jl. Kopi Kenangan No. 24, Jakarta Selatan
            <br />
            Telp: 0811-2233-4455
          </p>
        </div>

        <div className="text-right">
          <p className="text-3xl font-semibold tracking-wide text-[#0B4B50]">INVOICE</p>
          <p className="text-xl font-bold mt-1">#{invoice.invoiceId}</p>
          <p className="text-sm mt-1">Tanggal: {tanggal}</p>
          <span
            className={`mt-3 inline-block px-4 py-1 border rounded-full text-sm font-semibold ${getStatusStyle(
              invoice.status
            )}`}
          >
            {invoice.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* BILLING */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-1">Pembeli</h3>
        <p className="text-gray-800 font-medium">{invoice.nama}</p>
        <p className="text-gray-600">{invoice.alamat}</p>
        <p className="text-gray-600">Telp: {invoice.hp}</p>
      </div>

      {/* LIST PRODUK */}
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
            <td className="border border-gray-200 text-right px-3">
              {formatCurrency(invoice.subtotalCalc)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* TOTAL */}
      <div className="flex justify-end mb-8">
        <table className="text-sm">
          <tbody>
            <tr>
              <td className="py-1 px-4">Subtotal Produk:</td>
              <td className="text-right font-medium py-1 px-4">
                {formatCurrency(invoice.subtotalCalc)}
              </td>
            </tr>
            <tr>
              <td className="py-1 px-4">Ongkir:</td>
              <td className="text-right font-medium py-1 px-4">
                {formatCurrency(invoice.effectiveOngkir)}
              </td>
            </tr>
            <tr className="text-lg font-bold bg-gray-50">
              <td className="py-2 px-4">TOTAL DIBAYARKAN:</td>
              <td className="text-right text-red-600 py-2 px-4">
                {formatCurrency(invoice.effectiveGrandTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* QR & Barcode (hilang jika PDF) */}
      <div className="flex justify-between items-center mt-6 mb-10 no-print">
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

      {/* FOOTER (hilang jika PDF) */}
      <p className="text-center text-gray-600 text-sm border-t pt-4 no-print">
        Terima kasih telah berbelanja di <strong>KOJE24</strong> 💛
        Semoga sehat & berenergi setiap hari!
      </p>
    </div>

    {/* === PRINT MODE ULTRA CLEAN A4 === */}
    <style jsx global>{`
      @media print {
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
        }

        .no-print,
        .download-btn,
        button,
        a,
        header,
        footer,
        .navbar,
        .whatsapp-float {
          display: none !important;
          visibility: hidden !important;
        }

        .invoice-container {
          background: #ffffff !important;
          border: none !important;
          box-shadow: none !important;
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 28px !important;
        }

        table, tr, th, td {
          border-color: #000 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        img, svg {
          max-width: 100% !important;
          height: auto !important;
        }

        * {
          overflow: visible !important;
        }
      }

      @page {
        size: A4;
        margin: 0;
      }
    `}</style>
  </div>
);
}
