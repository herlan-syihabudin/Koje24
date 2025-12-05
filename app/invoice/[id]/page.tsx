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
  // kolom "Promo" dari Sheet2 (Transaksi), misal: "KOJE10K (-Rp10.000)"
  promoRaw?: string;
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

// 🔍 parsing promo: "KOJE10K (-Rp10.000)" => { label: "KOJE10K", amount: 10000 }
function parsePromo(promoRaw?: string): { label: string; amount: number } {
  if (!promoRaw) return { label: "", amount: 0 };

  const text = promoRaw.trim();
  if (!text) return { label: "", amount: 0 };

  // ambil kode (kata pertama huruf/angka)
  const codeMatch = text.match(/^([A-Z0-9]+)/i);
  const label = codeMatch ? codeMatch[1].toUpperCase() : text;

  // ambil angka diskon (cari "- Rp10.000" dll)
  const amountMatch = text.match(/-?\s*Rp?\s*([\d\.]+)/i);
  let amount = 0;
  if (amountMatch && amountMatch[1]) {
    const digits = amountMatch[1].replace(/\./g, "");
    const parsed = Number(digits);
    if (!Number.isNaN(parsed)) amount = parsed;
  }

  return { label, amount };
}

export default function InvoicePage() {
  const params = useParams();
  const invoiceId = params?.id as string;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/invoice/${invoiceId}`);
        const json = await res.json();
        // asumsi API: { success: boolean, data: InvoiceData }
        if (json?.data) setInvoice(json.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [invoiceId]);

  if (loading) return <div className="p-10">Memuat invoice...</div>;
  if (!invoice)
    return <div className="p-10 text-red-600">Invoice tidak ditemukan.</div>;

  const rawItems = invoice.produkList.split(",").map((x) => x.trim());
  const items = rawItems.map((line) => {
    const match = line.match(/(.+?)\s*\((\d+)x\)/);
    return match
      ? { name: match[1].trim(), qty: Number(match[2]) }
      : { name: line.trim(), qty: 1 };
  });

  const unitPrice =
    invoice.qtyTotal > 0 ? invoice.subtotalCalc / invoice.qtyTotal : 0;

  const calculateSubtotal = (name: string, qty: number) => {
    const isPaket = name.toLowerCase().includes("paket");
    if (unitPrice <= 0) return null;

    if (isPaket && qty === 1) return qty * unitPrice;
    if (!isPaket) return qty * unitPrice;
    return null; // paket multi qty kita biarkan "—" (totalnya sudah masuk subtotal global)
  };

  // 🔥 promo
  const { label: promoLabel, amount: promoAmount } = parsePromo(
    invoice.promoRaw
  );
  const hasPromo = promoAmount > 0;

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
          <img
            src="/image/logo-koje24.png"
            alt="KOJE24"
            className="h-16 w-auto mb-1"
          />
          <p className="text-sm leading-tight">
            <strong>Healthy Juice for Everyday Energy</strong> <br />
            Jl. Sirsak, Cijengkol, Kec. Setu, Kabupaten Bekasi, Jawa Barat
            17320
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

      <div className="border-t border-black mb-4" />

      {/* ===== PAYMENT STATUS ===== */}
      <div className="flex justify-between text-sm mb-6">
        <p>
          Pembayaran: <strong>{invoice.paymentLabel}</strong>
        </p>
        <p>
          Status: <strong>{invoice.status.toUpperCase()}</strong>
        </p>
      </div>

      {/* ===== CUSTOMER ===== */}
      <p className="text-sm font-bold mb-1">Invoice To:</p>
      <p className="text-sm">Nama: {invoice.nama}</p>
      <p className="text-sm">Alamat: {invoice.alamat}</p>
      <p className="text-sm mb-4">Telp: {invoice.hp}</p>

      {/* ===== PRODUCT TABLE ===== */}
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
              <td className="text-right">
                {formatCurrency(invoice.subtotalCalc)}
              </td>
            </tr>

            {hasPromo && (
              <tr>
                <td className="py-1 pr-6">
                  Promo{promoLabel ? ` (${promoLabel})` : ""}
                </td>
                <td className="text-right text-red-600">
                  -{formatCurrency(promoAmount)}
                </td>
              </tr>
            )}

            <tr>
              <td className="py-1 pr-6">Ongkir:</td>
              <td className="text-right">
                {formatCurrency(invoice.effectiveOngkir)}
              </td>
            </tr>
            <tr className="font-bold text-lg border-t border-black">
              <td className="py-2 pr-6">TOTAL DIBAYARKAN:</td>
              <td className="text-right">
                {formatCurrency(invoice.effectiveGrandTotal)}
              </td>
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
        — <strong>Syarat & Ketentuan:</strong>
        <br />
        1. Invoice ini otomatis & sah tanpa tanda tangan atau stempel.
        <br />
        2. Pembayaran dianggap sah setelah dana diterima oleh KOJE24.
        <br />
        3. Barang yang sudah dibeli tidak dapat dikembalikan kecuali terdapat
        kerusakan.
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
          a,
          button,
          .no-pdf {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
