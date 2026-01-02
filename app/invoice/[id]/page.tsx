"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import QRCode from "react-qr-code";

/* =====================
   TYPES
===================== */
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
  promoRaw?: string;
}

/* =====================
   HELPERS
===================== */
const formatCurrency = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

function parsePromo(raw?: string): { label: string; amount: number } {
  if (!raw) return { label: "", amount: 0 };
  const text = raw.trim();
  const label = (text.match(/^([A-Z0-9]+)/i)?.[1] ?? "").toUpperCase();
  const amountMatch = text.match(/-?\s*Rp?\s*([\d\.]+)/i);
  const amount = amountMatch ? Number(amountMatch[1].replace(/\./g, "")) : 0;
  return { label, amount: isNaN(amount) ? 0 : amount };
}

/* =====================
   COMPONENT
===================== */
export default function InvoicePage() {
  const params = useParams();
  const invoiceId = params?.id as string;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPdf, setIsPdf] = useState(false);

  /* =====================
     DETECT PDF MODE
     (dipakai oleh html2pdf)
  ===================== */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search);
      if (q.get("pdf") === "1") {
        setIsPdf(true);
      }
    }
  }, []);

  /* =====================
     LOAD INVOICE DATA
  ===================== */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/invoice/${invoiceId}`);
        const json = await res.json();
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

  /* =====================
     PARSE ITEMS
  ===================== */
  const rawItems = invoice.produkList.split(",").map((x) => x.trim());
  const items = rawItems.map((line) => {
    const m = line.match(/(.+?)\s*\((\d+)x\)/);
    return m ? { name: m[1].trim(), qty: Number(m[2]) } : { name: line, qty: 1 };
  });

  const unitPrice =
    invoice.qtyTotal > 0
      ? invoice.subtotalCalc / invoice.qtyTotal
      : 0;

  const calcSubtotal = (name: string, qty: number) => {
    const isPaket = name.toLowerCase().includes("paket");
    if (unitPrice <= 0) return null;
    if (isPaket && qty === 1) return qty * unitPrice;
    if (!isPaket) return qty * unitPrice;
    return null;
  };

  const { label: promoLabel, amount: promoAmount } = parsePromo(
    invoice.promoRaw
  );
  const hasPromo = promoAmount > 0;

  return (
    <div className="invoice-wrapper">
      <div className="max-w-4xl mx-auto p-10 bg-white text-black invoice-paper">

        {/* =====================
            DOWNLOAD PDF
            (TIDAK MASUK PDF)
        ===================== */}
        {!isPdf && (
          <div className="w-full flex justify-end mb-4">
            <a
              href={`/api/invoice-file/${invoiceId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-teal-600 text-white rounded-md"
            >
              Download PDF
            </a>
          </div>
        )}

       {/* =====================
    HEADER
===================== */}
<div className="flex justify-between items-start mb-4">
  {/* LEFT */}
  <div>
    <img
      src="/image/logo-koje24.png"
      alt="KOJE24"
      className="h-16 w-auto mb-1"
    />

    <p className="text-sm leading-tight select-none pointer-events-none">
      <span className="text-xs text-gray-800 font-semibold tracking-wide">
        PT KOJE NATURAL INDONESIA
      </span>
      <br />
      <span className="italic text-xs text-gray-600">
        Healthy Juice for Everyday Energy
      </span>
      <br />
      <span className="not-address text-xs">
        Jl. Sirsak, Cijengkol, Kec. Setu, Kabupaten Bekasi
      </span>
      <br />
      <span className="font-medium text-xs">
        WhatsApp: 0822-1313-9580
      </span>
    </p>
  </div>

  {/* RIGHT */}
  <div className="text-right">
    <p className="text-3xl font-bold">INVOICE</p>
    <img
      src={`https://barcodeapi.org/api/128/${invoice.invoiceId}`}
      alt="barcode"
      className="h-14 w-auto ml-auto"
    />
    <p className="text-xs mt-1">
      Tanggal: {invoice.timestamp.replace(",", " — ")}
    </p>
  </div>
</div>

        <div className="border-t border-black mb-4" />

        {/* =====================
            INFO
        ===================== */}
        <div className="flex justify-between text-sm mb-6">
          <p>
            Pembayaran: <strong>{invoice.paymentLabel}</strong>
          </p>
          <p>
            Status: <strong>{invoice.status.toUpperCase()}</strong>
          </p>
        </div>

        <p className="text-sm font-bold">Invoice To:</p>
        <p className="text-sm">Nama: {invoice.nama}</p>
        <p className="text-sm">Alamat: {invoice.alamat}</p>
        <p className="text-sm mb-4">Telp: {invoice.hp}</p>

        {/* =====================
            TABLE
        ===================== */}
        <table className="w-full text-sm border border-black" cellPadding={6}>
          <thead>
            <tr>
              <th className="border border-black text-left">Produk</th>
              <th className="border border-black text-right">Harga</th>
              <th className="border border-black text-center">Qty</th>
              <th className="border border-black text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p, i) => {
              const sub = calcSubtotal(p.name, p.qty);
              return (
                <tr key={i}>
                  <td className="border border-black">{p.name}</td>
                  <td className="border border-black text-right">
                    {sub ? formatCurrency(unitPrice) : "—"}
                  </td>
                  <td className="border border-black text-center">{p.qty}</td>
                  <td className="border border-black text-right">
                    {sub ? formatCurrency(sub) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* =====================
            TOTAL
        ===================== */}
        <div className="flex justify-end mt-5">
          <table className="text-sm">
            <tbody>
              <tr>
                <td className="pr-6">Subtotal:</td>
                <td className="text-right">
                  {formatCurrency(invoice.subtotalCalc)}
                </td>
              </tr>

              {hasPromo && (
                <tr>
                  <td className="pr-6">
                    Promo {promoLabel && `(${promoLabel})`}
                  </td>
                  <td className="text-right text-red-600">
                    -{formatCurrency(promoAmount)}
                  </td>
                </tr>
              )}

              <tr>
                <td className="pr-6">Ongkir:</td>
                <td className="text-right">
                  {formatCurrency(invoice.effectiveOngkir)}
                </td>
              </tr>

              <tr className="font-bold border-t border-black">
                <td className="pr-6 pt-2">TOTAL:</td>
                <td className="text-right pt-2">
                  {formatCurrency(invoice.effectiveGrandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* =====================
            QR
        ===================== */}
        <div className="flex justify-center mt-8">
          <QRCode
            size={110}
            value={
              invoice.invoiceUrl ||
              (typeof window !== "undefined" ? window.location.href : "")
            }
          />
        </div>

        {/* =====================
    FOOTER
===================== */}
<div className="text-[10px] text-gray-600 mt-6 leading-relaxed">
  <p>
    Invoice ini dibuat secara otomatis oleh sistem KOJE24 dan sah tanpa tanda
    tangan maupun stempel.
  </p>

  <p className="mt-1">
    Terima kasih telah memilih hidup sehat bersama <strong>KOJE24</strong>.
    Jangan lupa simpan produk di lemari pendingin untuk menjaga kualitas.
  </p>

  <p className="mt-1">
    Untuk komplain produk, harap sertakan video unboxing maksimal 1x24 jam
    setelah pesanan diterima.
  </p>
</div>
         {/* =====================
    HALAL CERTIFICATION
===================== */}
<div className="mt-6 flex flex-col items-center text-[9px] text-gray-500">
  <img
    src="/image/halal-black.png"
    alt="Sertifikasi Halal Indonesia"
    style={{
      height: 44,
      opacity: 0.9,
      marginBottom: 4,
    }}
  />
  <span className="text-center">
    Diproduksi sesuai standar <b>Sertifikasi Halal Indonesia</b>
  </span>
</div>

        {/* =====================
            PRINT SAFETY
        ===================== */}
        <style jsx global>{`
          @media print {
            a,
            button {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
