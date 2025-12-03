"use client";

import React from "react";
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

export default function InvoiceClientContent({ invoice }: { invoice: InvoiceData }) {
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

  return (
    <div className="print:p-0">
      {/* DOWNLOAD BUTTON (hilang saat PDF) */}
      <div className="w-full flex justify-end mb-5 no-print">
        <a
          href={`/api/invoice-pdf/${invoice.invoiceId}`}
          download={`invoice-${invoice.invoiceId}.pdf`}
          className="px-5 py-2 bg-black text-white rounded-md shadow hover:bg-gray-800 font-medium"
        >
          Download Invoice (PDF)
        </a>
      </div>

      {/* === INVOICE BOX === */}
      <div className="invoice-container bg-white max-w-4xl mx-auto p-0 text-black border border-black">
        {/* HEADER */}
        <div className="p-6 pb-3">
          <img src="/image/logo-koje24.png" alt="KOJE24" className="h-16 mb-2" />

          <p className="text-sm leading-tight">
            <strong>Healthy Juice for Everyday Energy</strong> <br />
            Jl. Sirsak, Cijengkol, Kec. Setu, Kabupaten Bekasi, Jawa Barat 17320 <br />
            Telp: 081122334455
          </p>

          {/* INVOICE + BARCODE */}
          <div className="flex justify-between items-start mt-5">
            <p className="text-3xl font-bold tracking-wide">INVOICE</p>

            <div className="text-right">
              <img
                src={`https://barcodeapi.org/api/128/${invoice.invoiceId}`}
                alt="barcode"
                className="h-12"
              />
              <p className="text-sm mt-1">Tanggal: {tanggal}</p>
            </div>
          </div>
        </div>

        {/* garis batas header */}
        <div className="border-t border-black w-full"></div>

        {/* DETAIL PEMBAYARAN & PENERIMA */}
        <div className="p-6 pb-2 text-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold mb-1">Invoice To:</p>
              <p className="font-medium">{invoice.nama}</p>
              <p>{invoice.alamat}</p>
              <p>Telp: {invoice.hp}</p>
            </div>

            <div className="text-right">
              <p>Pembayaran: <strong>{invoice.paymentLabel}</strong></p>
              <p>Status: <strong>{invoice.status.toUpperCase()}</strong></p>
            </div>
          </div>
        </div>

        {/* TABLE PRODUK */}
        <div className="px-6 mt-4">
          <table className="w-full text-sm border border-black" cellPadding={6}>
            <thead>
              <tr>
                <th className="border border-black text-left">Deskripsi</th>
                <th className="border border-black w-24 text-center">Qty</th>
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
        </div>

        {/* TOTAL */}
        <div className="p-6 pr-6 text-sm flex justify-end">
          <table>
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
                <td className="text-right text-red-600">
                  {formatCurrency(invoice.effectiveGrandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* BARCODE INTERNAL KECIL */}
        <div className="flex justify-center mb-4 mt-2">
          <img
            src={`https://barcodeapi.org/api/128/${invoice.invoiceId}`}
            alt="barcode"
            className="h-10"
          />
        </div>

        {/* FOOTER RESMI */}
        <div className="border-t border-black p-4 text-center text-xs">
          Invoice ini sah dan diproses otomatis sebagai tanda terima pembelian.
          <br />
          Terima kasih telah berbelanja di <strong>KOJE24</strong>.
        </div>
      </div>

      {/* PRINT STYLES */}
      <style jsx global>{`
        @media print {
          .no-print,
          .download-btn,
          header,
          footer,
          .whatsapp-float {
            display: none !important;
          }

          .invoice-container {
            border: none !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }

        @page {
          size: A4;
          margin: 18mm;
        }
      `}</style>
    </div>
  );
}
