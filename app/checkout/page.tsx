"use client";

import React, { Suspense, useState, useEffect } from "react";
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

const SELLER_INFO = {
  name: "KOJE24 Official",
  address: "Jl. Kopi Kenangan No. 24, Jakarta Selatan",
  hp: "0811-2233-4455",
};

const formatRupiah = (v: number) =>
  v.toLocaleString("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 });

function InvoiceContent() {
  const { id } = useParams();
  const invoiceId = String(id);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const r = await fetch(`/api/invoice/${invoiceId}`, { cache: "no-store" });
      const j = await r.json();
      if (j?.success) setInvoice(j.data);
      setLoading(false);
    };
    load();
  }, [invoiceId]);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Memuat invoice…</div>;
  if (!invoice) return <div className="flex justify-center items-center min-h-screen">Invoice tidak ditemukan</div>;

  const formattedDate = new Date(invoice.timestamp).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex justify-center print:p-0">
      {/* === PRINT CSS & A4 MODE === */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background: white !important;
          }
          .a4 {
            width: 210mm !important;
            min-height: 297mm !important;
            padding: 16mm !important;
            margin: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="a4 bg-white w-full max-w-[210mm] mx-auto rounded-xl shadow-xl border p-6 sm:p-10">
        {/* WATERMARK PAID */}
        {invoice.status.toLowerCase() === "paid" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="font-extrabold text-[90px] sm:text-[130px] text-green-600 opacity-10 rotate-[-25deg] tracking-[0.18em]">
              PAID
            </span>
          </div>
        )}

        {/* HEADER */}
        <div className="flex justify-between items-start mb-8 gap-4">
          <div>
            <img src="/image/logo-koje24.png" className="h-14 w-auto" />
            <p className="text-xs text-gray-600 mt-2">
              {SELLER_INFO.address} • Telp: {SELLER_INFO.hp}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[#0B4B50]">INVOICE</p>
            <p className="font-semibold mt-1">#{invoice.invoiceId}</p>
            <p className="text-sm text-gray-600 mt-1">{formattedDate}</p>
          </div>
        </div>

        {/* PEMBELI */}
        <div className="mb-8">
          <p className="text-sm font-bold text-gray-700 mb-1">Pembeli:</p>
          <p className="text-base font-medium">{invoice.nama}</p>
          <p className="text-sm text-gray-700">{invoice.alamat}</p>
          <p className="text-sm text-gray-700">Telp: {invoice.hp}</p>
        </div>

        {/* PRODUK */}
        <div className="mb-8">
          <table className="w-full text-sm border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border py-2 px-3 text-left">Deskripsi</th>
                <th className="border py-2 w-20 text-center">Qty</th>
                <th className="border py-2 w-32 text-right px-3">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border py-2 px-3">{invoice.produkList}</td>
                <td className="border text-center">{invoice.qtyTotal}</td>
                <td className="border text-right px-3">{formatRupiah(invoice.subtotalCalc)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* TOTAL */}
        <div className="flex justify-end mb-8">
          <table className="text-sm w-full sm:w-auto">
            <tbody>
              <tr>
                <td className="py-1 px-3">Subtotal Produk:</td>
                <td className="py-1 px-3 text-right font-medium">{formatRupiah(invoice.subtotalCalc)}</td>
              </tr>
              <tr>
                <td className="py-1 px-3">Ongkir:</td>
                <td className="py-1 px-3 text-right font-medium">{formatRupiah(invoice.effectiveOngkir)}</td>
              </tr>
              <tr className="bg-gray-50 text-lg font-bold">
                <td className="py-2 px-3">TOTAL DIBAYARKAN:</td>
                <td className="py-2 px-3 text-right text-red-600">{formatRupiah(invoice.effectiveGrandTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* QR + BARCODE */}
        <div className="flex justify-between flex-wrap gap-6 mb-6">
          <div className="text-sm">
            <p>Scan untuk membuka invoice online:</p>
            <div className="mt-2 bg-white p-2 border inline-block rounded">
              <QRCode value={invoice.invoiceUrl} size={110} />
            </div>
          </div>
          <div className="flex flex-col items-center">
            <img
              src={`https://barcodeapi.org/api/128/${invoice.invoiceId}`}
              className="h-20"
            />
            <p className="text-xs mt-1">{invoice.invoiceId}</p>
          </div>
        </div>

        {/* FOOTER */}
        <p className="text-center text-gray-600 text-xs border-t pt-3">
          Terima kasih telah berbelanja di <b>KOJE24</b> 💛 Semoga sehat & berenergi setiap hari!
        </p>
      </div>

      {/* BUTTON CETAK */}
      <div className="text-center mt-6 no-print">
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-[#0FA3A8] text-white rounded-full text-sm"
        >
          Cetak & Unduh Invoice (PDF)
        </button>
      </div>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex justify-center items-center">Memuat invoice…</div>}>
      <InvoiceContent />
    </Suspense>
  );
}
