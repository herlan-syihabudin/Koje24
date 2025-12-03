"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import QRCode from "react-qr-code";

interface InvoiceData {
  invoiceId: string;
  timestamp: string;
  nama: string;
  hp: string;
  alamat: string;
  produkList: string; // contoh: "Golden Detox (2x), Yellow Immunity (1x), Paket Hemat (1x), Golden Detox (1x), Yellow Immunity (1x), Red Vitality (1x)"
  qtyTotal: number;
  subtotalCalc: number;
  status: string;
  paymentLabel: string;
  effectiveOngkir: number;
  effectiveGrandTotal: number;
  invoiceUrl?: string;
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

  // Ubah string produk menjadi array
  const rawItems = invoice.produkList.split(",").map((x) => x.trim());

  // Format array → name + qty
  const items = rawItems.map((line) => {
    const match = line.match(/(.+?)\s*\((\d+)x\)/);
    return match
      ? { name: match[1].trim(), qty: Number(match[2]) }
      : { name: line.trim(), qty: 1 };
  });

  // Hitung harga per unit berdasarkan subtotal / qtyTotal
  const unitPrice = invoice.subtotalCalc / invoice.qtyTotal;

  // Logika subtotal per item
  const calculateSubtotal = (name: string, qty: number) => {
    const isPaket = name.toLowerCase().includes("paket");
    if (isPaket && qty === 1) return qty * unitPrice; // subtotal paket
    if (!isPaket) return qty * unitPrice; // produk biasa
    return null; // isi paket -> tanda "—"
  };

  return (
    <div className="max-w-4xl mx-auto p-10 bg-white text-black invoice-paper">
      {/* === SYARAT & KETENTUAN (atas kiri) === */}
<p className="text-[10px] text-gray-600 mb-4 leading-tight print:block hidden">
  — <strong>Syarat & Ketentuan:</strong><br />
  1. Pembayaran dianggap sah setelah dana diterima oleh KOJE24.
<br />2. Barang yang sudah dibeli tidak dapat dikembalikan kecuali terdapat kerusakan.
</p>
      {/* HEADER */}
      <div className="flex justify-between mb-8">
        <div>
          <img src="/image/logo-koje24.png" alt="KOJE24" className="h-16 w-auto mb-2" />
          <p className="text-sm leading-tight">
            <strong>Healthy Juice for Everyday Energy</strong> <br />
            Jl. Sirsak, Cijengkol, Kec. Setu, Kabupaten Bekasi, Jawa Barat 17320
          </p>
        </div>

        <div className="text-right">
          <p className="text-3xl font-bold mb-1">INVOICE</p>

          <img
            src={`https://barcodeapi.org/api/128/${invoice.invoiceId}`}
            alt="barcode"
            className="h-14 w-auto mx-auto"
          />

          <p className="text-xs mt-2">
            Tanggal: {invoice.timestamp.replace(",", " — ")}
          </p>
        </div>
      </div>

      <div className="border-t border-black my-5"></div>

      {/* PAYMENT STATUS */}
      <div className="flex justify-between text-sm mb-6">
        <p>Pembayaran: <strong>{invoice.paymentLabel}</strong></p>
        <p>Status: <strong>{invoice.status.toUpperCase()}</strong></p>
      </div>

      {/* CUSTOMER */}
      <p className="text-sm font-bold mb-1">Invoice To:</p>
      <p className="text-sm">Nama: {invoice.nama}</p>
      <p className="text-sm">Alamat: {invoice.alamat}</p>
      <p className="text-sm mb-6">Telp: {invoice.hp}</p>

      <div className="border-t border-black my-5"></div>

      {/* TABLE */}
      <table className="w-full text-sm border border-black" cellPadding={6}>
        <thead>
          <tr>
            <th className="border border-black text-left">Deskripsi Produk</th>
            <th className="border border-black w-28 text-right">Harga</th>
            <th className="border border-black w-16 text-center">Qty</th>
            <th className="border border-black w-32 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p, idx) => {
            const subtotal = calculateSubtotal(p.name, p.qty);

            return (
              <tr key={idx}>
                <td className="border border-black">{p.name}</td>
                <td className="border border-black text-right">
                  {subtotal === null ? "—" : formatCurrency(unitPrice)}
                </td>
                <td className="border border-black text-center">{p.qty}</td>
                <td className="border border-black text-right">
                  {subtotal === null ? "—" : formatCurrency(subtotal)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* TOTAL */}
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

      {/* QR CODE */}
      <div className="flex justify-center mt-8">
        <QRCode value={invoice.invoiceUrl || window.location.href} size={120} />
      </div>

      {/* FOOTER */}
      <div className="border-t border-black text-center mt-8 pt-3 text-xs leading-tight">
        Invoice ini otomatis & sah tanpa tanda tangan atau stempel sebagai tanda terima pembelian.
        <br />Terima kasih telah berbelanja di <strong>KOJE24</strong>.
      </div>

      {/* PRINT CLEAN */}
      <style jsx global>{`
        @media print {
          .invoice-paper {
            padding: 0 !important;
            margin: 0 !important;
            background: #fff !important;
          }
          a, button, .whatsapp-float, .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
