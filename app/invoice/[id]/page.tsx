"use client";

import { useEffect, useState } from "react";
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

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

export default function InvoicePage() {
  const params = useParams();
  const invoiceId = params?.id as string;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/invoice/${invoiceId}`)
      .then((res) => res.json())
      .then((data) => setInvoice(data.data))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  if (loading) return <div className="p-10">Memuat invoice...</div>;
  if (!invoice) return <div className="p-10 text-red-600">Invoice tidak ditemukan.</div>;

  return (
    <div className="max-w-4xl mx-auto p-10 bg-white text-black invoice-paper">
      
      {/* ==== HEADER ==== */}
      <div className="flex justify-between mb-8">
        
        {/* Logo & Business Info */}
        <div>
          <img
            src="/image/logo-koje24.png"
            alt="KOJE24"
            className="h-16 w-auto object-contain mb-2"
          />
          <p className="text-sm leading-tight">
            <strong>Healthy Juice for Everyday Energy</strong> <br />
            Jl. Sirsak, Cijengkol, Kec. Setu, Kabupaten Bekasi, Jawa Barat 17320
          </p>
        </div>

        {/* Invoice Right Side */}
        <div className="text-right">
          <p className="text-3xl font-bold tracking-wide mb-2">INVOICE</p>

          {/* Barcode */}
          <img
            src={`https://barcodeapi.org/api/128/${invoice.invoiceId}`}
            alt="barcode"
            className="h-14 w-auto object-contain mx-auto"
          />

          {/* Date */}
          <p className="text-xs mt-2">
            Tanggal: {invoice.timestamp.replace(",", " — ")}
          </p>
        </div>
      </div>

      <div className="border-t border-black my-5"></div>

      {/* ==== PAYMENT & STATUS ==== */}
      <div className="flex justify-between text-sm mb-6">
        <p>Pembayaran: <strong>{invoice.paymentLabel}</strong></p>
        <p>Status: <strong>{invoice.status.toUpperCase()}</strong></p>
      </div>

      {/* ==== INVOICE TO ==== */}
      <p className="text-sm font-bold mb-1">Invoice To:</p>
      <p className="text-sm">Nama: {invoice.nama}</p>
      <p className="text-sm">Alamat: {invoice.alamat}</p>
      <p className="text-sm mb-6">Telp: {invoice.hp}</p>

      <div className="border-t border-black my-5"></div>

      {/* ==== TABLE PRODUK ==== */}
      <table className="w-full text-sm border border-black" cellPadding={6}>
        <thead>
          <tr>
            <th className="border border-black text-left">Deskripsi Produk</th>
            <th className="border border-black w-20 text-center">Qty</th>
            <th className="border border-black w-40 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black">{invoice.produkList}</td>
            <td className="border border-black text-center">{invoice.qtyTotal}</td>
            <td className="border border-black text-right">
              {formatCurrency(invoice.subtotalCalc)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ==== TOTAL ==== */}
      <div className="flex justify-end mt-6">
        <table className="text-sm">
          <tbody>
            <tr>
              <td className="py-1 pr-6">Subtotal Produk:</td>
              <td className="text-right">{formatCurrency(invoice.subtotalCalc)}</td>
            </tr>
            <tr>
              <td className="py-1 pr-6">Ongkir:</td>
              <td className="text-right">{formatCurrency(invoice.effectiveOngkir)}</td>
            </tr>
            <tr className="font-bold text-lg border-t border-black">
              <td className="py-2 pr-6">TOTAL DIBAYARKAN:</td>
              <td className="text-right">{formatCurrency(invoice.effectiveGrandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ==== FOOTER ==== */}
      <div className="border-t border-black text-center mt-10 pt-3 text-xs leading-tight">
        Invoice ini sah dan diproses otomatis sebagai tanda terima pembelian.
        <br />
        Terima kasih telah berbelanja di <strong>KOJE24</strong>.
      </div>

      {/* ==== PRINT MODE CLEAN ==== */}
      <style jsx global>{`
        @media print {
          .invoice-paper {
            padding: 0 !important;
            margin: 0 !important;
            background: #fff !important;
          }
          a,
          button,
          .whatsapp-float,
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
