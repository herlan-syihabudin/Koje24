'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from "next/navigation";

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
}

const SELLER_INFO = {
  name: "KOJE24 Official",
  address: "Jl. Kopi Kenangan No. 24, Jakarta Selatan",
  hp: "0811-2233-4455",
};

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
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
        setLoading(true);
        setError(null);
        const baseUrl = window.location.origin;
        const res = await fetch(`${baseUrl}/api/invoice/${invoiceId}`, { cache: "no-store" });
        const result = await res.json();
        if (res.ok && result.success) setInvoice(result.data);
        else setError(result.message || "Gagal memuat data invoice.");
      } catch {
        setError("Terjadi kesalahan koneksi saat memuat data.");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [invoiceId]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-8">
        <div className="animate-pulse text-xl text-gray-600">
          Memuat Invoice #{invoiceId}...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-8">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full border-t-4 border-red-500">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Kesalahan Pemuatan Invoice</h2>
          <p className="text-gray-700">Invoice ID: #{invoiceId}</p>
          <p className="text-gray-600 mt-3">Pesan: {error}</p>
        </div>
      </div>
    );

  if (!invoice)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-8">
        <p className="text-xl text-gray-700">Invoice tidak ditemukan.</p>
      </div>
    );

  const formattedDate = invoice.timestamp
    ? new Date(invoice.timestamp.replace(" ", "T")).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid": return "text-green-700 bg-green-100 border-green-300";
      case "cod": return "text-blue-700 bg-blue-100 border-blue-300";
      default: return "text-red-700 bg-red-100 border-red-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <style jsx global>{`
        @media print {
          body { background: #fff !important; }
          .invoice-box { box-shadow: none !important; border: none !important; }
          .print\\:hidden { display: none !important; }
        }
        .invoice-box {
          max-width: 900px;
          margin: auto;
          padding: 34px;
          background: #fff;
          border-radius: 14px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          font-family: 'Inter', sans-serif;
        }
      `}</style>

      <div className="invoice-box">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 pb-5 border-b border-gray-200 gap-6">
          <div>
            <span className="text-4xl font-extrabold tracking-wide text-[#007bff]">KOJE24</span>
            <h1 className="text-2xl font-semibold text-gray-800 mt-1">Faktur Penjualan (Invoice)</h1>
          </div>
          <div className="text-right space-y-1">
            <p className="text-xs text-gray-500 tracking-wide">Invoice ID</p>
            <p className="text-2xl font-bold tracking-wide text-gray-900">#{invoice.invoiceId}</p>
            <p className="text-sm text-gray-600">{formattedDate}</p>
            <span className={`mt-2 inline-block px-4 py-1 text-sm font-semibold rounded-full border shadow-sm ${getStatusStyle(invoice.status)}`}>
              {invoice.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* PENERIMA DAN PENJUAL */}
        <div className="grid md:grid-cols-2 gap-10 mb-10 text-sm">
          <div>
            <h3 className="text-base font-semibold text-gray-700 mb-2">Dari (Penjual)</h3>
            <p className="font-medium text-gray-900">{SELLER_INFO.name}</p>
            <p className="text-gray-600">{SELLER_INFO.address}</p>
            <p className="text-gray-600">Telp: {SELLER_INFO.hp}</p>
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-700 mb-2">Untuk (Pembeli)</h3>
            <p className="font-medium text-gray-900 capitalize">{invoice.nama}</p>
            <p className="text-gray-600 capitalize">{invoice.alamat}</p>
            <p className="text-gray-600">Telp: {invoice.hp}</p>
          </div>
        </div>

        {/* TABEL PRODUK */}
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Rincian Pesanan</h3>
        <table className="w-full mb-8 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100 text-gray-800 text-sm">
              <th className="p-3 w-[5%] text-center">No</th>
              <th className="p-3">Deskripsi Produk</th>
              <th className="p-3 w-[10%] text-center">Qty</th>
              <th className="p-3 w-[20%] text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50 transition">
              <td className="p-3 text-center">1</td>
              <td className="p-3 font-medium text-gray-800">{invoice.produkList}</td>
              <td className="p-3 text-center font-medium">{invoice.qtyTotal}</td>
              <td className="p-3 text-right font-semibold text-gray-800">
                {formatCurrency(invoice.subtotalCalc)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* TOTAL */}
        <div className="flex justify-end">
          <div className="w-full sm:w-[55%] md:w-[45%] lg:w-[38%]">
            <table className="w-full text-gray-700 text-sm">
              <tbody>
                <tr>
                  <td className="p-2">Subtotal Produk:</td>
                  <td className="text-right p-2 font-medium">
                    {formatCurrency(invoice.subtotalCalc)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border-b border-gray-200">Biaya Pengiriman:</td>
                  <td className="text-right p-2 border-b border-gray-200 font-medium">
                    {formatCurrency(invoice.effectiveOngkir)}
                  </td>
                </tr>
                <tr className="bg-blue-50/40">
                  <td className="p-3 font-bold text-base text-gray-900">TOTAL DIBAYARKAN:</td>
                  <td className="text-right p-3 font-black text-2xl text-[#d92d20] tracking-wide">
                    {formatCurrency(invoice.effectiveGrandTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* PEMBAYARAN */}
        <div className="mt-12 pt-6 border-t border-dashed border-gray-300 space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Metode Pembayaran</h3>

          <div className="text-sm text-gray-700 p-5 border rounded-xl bg-yellow-50/60 flex gap-3 items-start">
            <div className="text-yellow-700 text-lg">💳</div>
            <div>
              <p className="font-medium mb-1">Silakan lakukan pembayaran sesuai total di atas.</p>
              <p className="font-bold text-gray-900">
                Metode: <span className="text-blue-700">{invoice.paymentLabel.toUpperCase()}</span>
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Pembayaran via {invoice.paymentLabel.toUpperCase()} akan diproses setelah konfirmasi.
              </p>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="print:hidden mt-6 px-8 py-3 bg-[#007bff] text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition flex items-center gap-2"
          >
            🖨 Cetak & Unduh Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
