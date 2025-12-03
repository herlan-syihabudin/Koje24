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
  produkList: string;
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

  const rawItems = invoice.produkList.split(",").map((x) => x.trim());
  const items = rawItems.map((line) => {
    const match = line.match(/(.+?)\s*\((\d+)x\)/);
    return match
      ? { name: match[1].trim(), qty: Number(match[2]) }
      : { name: line.trim(), qty: 1 };
  });

  const unitPrice = invoice.subtotalCalc / invoice.qtyTotal;
  const calculateSubtotal = (name: string, qty: number) => {
    const isPaket = name.toLowerCase().includes("paket");
    if (isPaket && qty === 1) return qty * unitPrice;
    if (!isPaket) return qty * unitPrice;
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto p-10 bg-white text-black invoice-paper">

      {/* === DOWNLOAD BUTTON (web only) === */}
      <div className="w-full flex justify-end mb-4 no-pdf">
        <a
          href={`/api/invoice-pdf/${invoice.invoiceId}`}
          className="px-5 py-2 bg-[#C62828] text-white rounded shadow hover:bg-[#a71e1e] transition text-sm font-semibold"
        >
          ⬇ Download Invoice
        </a>
      </div>

      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <img src="/image/logo-koje24.png" alt="KOJE24" className="h-16 w-auto mb-1" />
          <p className="text-sm leading-tight">
            <strong>Healthy Juice for Everyday Energy</strong> <br />
            Jl. Sirsak, Cijengkol, Kec. Setu, Kabupaten Bekasi, Jawa Barat 17320
          </p>
        </div>

        <div className="text-right">
          <p className="text-3xl font-bold mb-1 tracking-wide">INVOICE</p>
          <img
            src={`https://barcodeapi.org/api/128/${invoice.invoiceId}`}
            alt="barcode"
            className="h-14 w-auto mx-auto"
          />
          <p className="text-xs mt-1">
            Tanggal: {invoice.timestamp.replace(",", " — ")}
          </p>
        </div>
      </div>

      <div className="border-t border-black mb-4"></div>

      {/* ===== PAYMENT STATUS ===== */}
      <div className="flex justify-between text-sm mb-6">
        <p>Pembayaran: <strong>{invoice.paymentLabel}</strong></p>
        <p>Status: <strong>{invoice.status.toUpperCase()}</strong></p>
      </div>

      {/* ===== CUSTOMER ===== */}
      <p className="text-sm font-bold mb-1">Invoice To:</p>
      <p className="text-sm">Nama: {invoice.nama}</p>
      <p className="text-sm">Alamat: {invoice.alamat}</p>
      <p className="text-sm mb-4">Telp: {invoice.hp}</p>

      {/* ===== PRODUCT TABLE (tanpa garis horizontal tambahan) ===== */}
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

      {/* ===== TOTAL ===== */}
      <div className="flex justify-end mt-5">
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

      {/* ===== QR CODE ===== */}
      <div className="flex justify-center mt-8">
        <QRCode value={invoice.invoiceUrl || window.location.href} size={110} />
      </div>

      {/* ===== SYARAT & KETENTUAN ===== */}
      <div className="text-[10px] text-gray-600 mt-6 leading-tight text-left">
        — <strong>Syarat & Ketentuan:</strong><br />
        1. Invoice ini otomatis & sah tanpa tanda tangan atau stempel.<br />
        2. Pembayaran dianggap sah setelah dana diterima oleh KOJE24.<br />
        3. Barang yang sudah dibeli tidak dapat dikembalikan kecuali terdapat kerusakan.
      </div>

      {/* ===== FOOTER ===== */}
      <div className="border-t border-black text-center mt-4 pt-3 text-xs leading-tight">
        Terima kasih telah berbelanja di <strong>KOJE24</strong>.
      </div>

      {/* ===== PRINT MODE ===== */}
      <style jsx global>{`
        @media print {
          .invoice-paper {
            margin: 0 !important;
            padding: 0 !important;
            zoom: 93%;
          }
          a, button, .no-pdf {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
