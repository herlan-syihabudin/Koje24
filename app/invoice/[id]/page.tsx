'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from "next/navigation";  // ⬅️ Ambil ID dari URL

// Definisikan tipe data invoice (sesuai output API Fetcher)
interface InvoiceData {
  invoiceId: string;
  timestamp: string;
  nama: string;
  hp: string;
  alamat: string;
  produkList: string; // Detail produk (masih berupa string gabungan)
  qtyTotal: number;
  subtotalCalc: number;
  status: string; // Status: Pending, Paid, COD
  paymentLabel: string;
  effectiveOngkir: number;
  effectiveGrandTotal: number;
  invoiceUrl: string;
}

// Data Dummy Informasi Penjual
const SELLER_INFO = {
  name: "KOJE24 Official",
  address: "Jl. Kopi Kenangan No. 24, Jakarta Selatan",
  hp: "0811-2233-4455",
};

// Fungsi utilitas untuk format mata uang Rupiah
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function InvoicePage() {
  const { id } = useParams();              // ⬅️ Ambil param /invoice/[id]
  const invoiceId = String(id);            // ⬅️ Convert aman ke string

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
        const res = await fetch(`${baseUrl}/api/invoice/${invoiceId}`, {
          cache: "no-store",
        });

        const result = await res.json();
        if (res.ok && result.success) {
          setInvoice(result.data);
        } else {
          setError(result.message || "Gagal memuat data invoice.");
        }
      } catch {
        setError("Terjadi kesalahan koneksi saat memuat data.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  // ==== LOADING ====
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-8">
        <div className="animate-pulse text-xl text-gray-600">
          Memuat Invoice #{invoiceId}...
        </div>
      </div>
    );
  }

  // ==== ERROR ====
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-8">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full border-t-4 border-red-500">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Kesalahan Pemuatan Invoice</h2>
          <p className="text-gray-700">Invoice ID: <span className="font-mono text-sm bg-gray-100 p-1 rounded">#{invoiceId}</span></p>
          <p className="text-gray-600 mt-3">Pesan: {error}</p>
          <p className="text-xs text-gray-400 mt-4">Pastikan Invoice ID benar dan Google Sheet API berjalan.</p>
        </div>
      </div>
    );
  }

  // ==== EMPTY ====
  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-8">
        <p className="text-xl text-gray-700">Invoice tidak ditemukan.</p>
      </div>
    );
  }

  // ==== STYLE UNTUK PRINT ====
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid": return "text-green-700 bg-green-100 border-green-300";
      case "cod": return "text-blue-700 bg-blue-100 border-blue-300";
      case "pending":
      default: return "text-red-700 bg-red-100 border-red-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <style jsx global>{`
        @media print {
          body { background: #fff !important; }
          .invoice-box { box-shadow: none !important; border: none !important; padding: 0 !important; max-width: none !important; }
          .print\\:hidden { display: none !important; }
        }
        .invoice-box {
          font-family: 'Inter', sans-serif;
          max-width: 900px;
          margin: auto;
          padding: 30px;
          border: 1px solid #eee;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          font-size: 14px;
          line-height: 24px;
          color: #555;
          background: #fff;
          border-radius: 12px;
        }
        .item-table th, .item-table td {
          border: 1px solid #e5e7eb;
          padding: 12px;
        }
        .item-table th {
          background-color: #f3f4f6;
          color: #1f2937;
          font-weight: 600;
        }
      `}</style>

      <div className="invoice-box">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-gray-200">
          <div>
            <span className="text-4xl font-extrabold text-[#007bff]">KOJE24</span>
            <h1 className="text-2xl font-semibold text-gray-800 mt-2">Faktur Penjualan (Invoice)</h1>
          </div>
          <div className="text-right mt-4 sm:mt-0">
            <strong className="text-2xl text-gray-900 block mb-1">#{invoice.invoiceId}</strong>
            <p className="text-sm">Tanggal Order: {new Date(invoice.timestamp).toLocaleDateString('id-ID')}</p>
            <p className={`font-bold text-base mt-2 px-4 py-1 rounded-full inline-block border ${getStatusStyle(invoice.status)}`}>
              Status: {invoice.status.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Penerima & Penjual */}
        <div className="flex flex-col md:flex-row justify-between mb-10 text-sm">
          <div className="w-full md:w-1/2 mb-6 md:mb-0">
            <h3 className="text-base font-semibold text-gray-700 mb-2">Dari (Penjual)</h3>
            <p className="font-medium text-gray-800">{SELLER_INFO.name}</p>
            <p className="text-gray-600">{SELLER_INFO.address}</p>
            <p className="text-gray-600">Telp: {SELLER_INFO.hp}</p>
          </div>
          <div className="w-full md:w-1/2 md:pl-8">
            <h3 className="text-base font-semibold text-gray-700 mb-2">Untuk (Pembeli)</h3>
            <p className="font-medium text-gray-800">{invoice.nama}</p>
            <p className="text-gray-600">{invoice.alamat}</p>
            <p className="text-gray-600">Telp: {invoice.hp}</p>
          </div>
        </div>

        {/* Tabel Produk */}
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Rincian Pesanan</h3>
        <table className="item-table w-full mb-8 rounded-lg overflow-hidden">
          <thead>
            <tr>
              <th className="w-[5%] text-center">No</th>
              <th>Deskripsi Produk</th>
              <th className="w-[10%] text-center">Qty Total</th>
              <th className="w-[20%] text-right">Subtotal Produk</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-gray-50 transition duration-100">
              <td className="text-center">1</td>
              <td className="font-medium text-gray-800">{invoice.produkList}</td>
              <td className="text-center font-medium">{invoice.qtyTotal}</td>
              <td className="text-right font-semibold text-gray-800">{formatCurrency(invoice.subtotalCalc)}</td>
            </tr>
          </tbody>
        </table>

        {/* Total */}
        <div className="flex justify-end">
          <div className="w-full sm:w-[55%] md:w-[45%] lg:w-[40%]">
            <table className="w-full text-gray-700 text-sm">
              <tbody>
                <tr>
                  <td className="p-2">Subtotal Produk:</td>
                  <td className="text-right p-2 font-medium">{formatCurrency(invoice.subtotalCalc)}</td>
                </tr>
                <tr>
                  <td className="p-2 border-b border-gray-200">Biaya Pengiriman (Ongkir):</td>
                  <td className="text-right p-2 border-b border-gray-200 font-medium">{formatCurrency(invoice.effectiveOngkir)}</td>
                </tr>
                <tr className="bg-blue-50/50">
                  <td className="p-3 font-bold text-lg text-gray-800">TOTAL DIBAYARKAN:</td>
                  <td className="text-right p-3 font-bold text-xl text-red-600">
                    {formatCurrency(invoice.effectiveGrandTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Metode Pembayaran */}
        <div className="mt-12 pt-6 border-t border-dashed border-gray-300">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Metode Pembayaran</h3>
          <div className="text-sm text-gray-600 p-4 border rounded-lg bg-yellow-50/50">
            <p className="mb-2">Silakan transfer sesuai total di atas.</p>
            <p className="font-bold text-gray-800">Metode: <span className="text-blue-600">{invoice.paymentLabel.toUpperCase()}</span></p>
            <p className="mt-1">
              Catatan: Pembayaran via {invoice.paymentLabel.toUpperCase()} akan diproses setelah konfirmasi pembayaran.
            </p>
          </div>

          {/* Tombol Print */}
          <button
            onClick={() => window.print()}
            className="mt-6 px-6 py-2 bg-[#007bff] text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 print:hidden"
          >
            Cetak & Unduh Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
