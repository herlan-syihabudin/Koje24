"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import Image from "next/image";
import "./print.css";

interface InvoiceData {
  invoiceId: string;
  timestamp: string;
  nama: string;
  alamat: string;
  hp: string;
  produkList: string;
  qtyTotal: number;
  subtotalCalc: number;
  effectiveOngkir: number;
  effectiveGrandTotal: number;
  status: string; // Paid / COD / Pending
  invoiceUrl: string;
}

export default function InvoicePage({ params }: { params: { invoiceId: string } }) {
  const [data, setData] = useState<InvoiceData | null>(null);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/invoice?invoiceId=${params.invoiceId}`);
      const json = await res.json();
      setData(json.data);
    }
    fetchData();
  }, [params.invoiceId]);

  if (!data) return <p className="text-center p-10">Loading invoice...</p>;

  const tanggal = data.timestamp
    ? new Date(data.timestamp).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  return (
    <div className="flex justify-center bg-[#f7fafa] p-4 print:bg-white">
      <div
        id="invoice"
        className="w-[900px] bg-white shadow-xl rounded-xl p-10 print:shadow-none print:w-full print:p-6 relative"
      >
        {/* WATERMARK PAID */}
        {data.status === "Paid" && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -rotate-30 text-[140px] font-bold text-[#0FA3A833] select-none print:text-[#0FA3A822]">
            PAID
          </div>
        )}

        {/* HEADER */}
        <div className="grid grid-cols-2 items-start">
          <div className="space-y-2">
            <Image
              src="/image/logo-koje24.png" // simpan file logo ini ke public/logo-koje-hijau.png
              alt="KOJE24"
              width={200}
              height={80}
              priority
            />
            <p className="text-sm text-gray-600 leading-tight">
              Natural Cold-Pressed Juice <br />
              Jl. Kopi Kenangan No. 24, Jakarta Selatan <br />
              Telp: 0811-2233-4455
            </p>
          </div>

          <div className="text-right space-y-1">
            <p className="text-2xl font-bold tracking-wide text-[#0B4B50]">INVOICE</p>
            <p className="text-gray-700 font-medium">#{data.invoiceId}</p>
            <p className="text-sm text-gray-500">Tanggal: {tanggal}</p>
            <span
              className={`inline-block px-4 py-1 text-sm rounded-full font-semibold ${
                data.status === "Paid"
                  ? "bg-green-100 text-green-700"
                  : data.status === "COD"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {data.status}
            </span>
          </div>
        </div>

        {/* PEMBELI */}
        <div className="mt-10">
          <p className="font-semibold text-gray-700">Pembeli</p>
          <p className="capitalize">{data.nama}</p>
          <p className="capitalize">{data.alamat}</p>
          <p>Telp: {data.hp}</p>
        </div>

        {/* TABEL */}
        <div className="mt-8 border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#0B4B50] text-white">
              <tr>
                <th className="text-left p-3">Deskripsi</th>
                <th className="text-center p-3 w-20">Qty</th>
                <th className="text-right p-3 w-32">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3">{data.produkList}</td>
                <td className="p-3 text-center">{data.qtyTotal}</td>
                <td className="p-3 text-right">
                  Rp{data.subtotalCalc.toLocaleString("id-ID")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SUMMARY */}
        <div className="flex justify-end mt-8">
          <div className="space-y-1 text-sm w-64">
            <div className="flex justify-between">
              <span>Subtotal Produk:</span>
              <span>Rp{data.subtotalCalc.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span>Ongkir:</span>
              <span>Rp{data.effectiveOngkir.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-red-600 border-t pt-2">
              <span>TOTAL DIBAYARKAN:</span>
              <span>Rp{data.effectiveGrandTotal.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        {/* QR + BARCODE */}
        <div className="grid grid-cols-2 gap-4 mt-12 items-end">
          <div>
            <p className="text-sm mb-2 text-gray-600">Scan untuk membuka invoice online:</p>
            <div className="bg-white p-2 border rounded-md inline-block">
              <QRCode value={data.invoiceUrl} size={110} />
            </div>
          </div>

          <div className="text-right">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              jsbarcode-format="CODE128"
              jsbarcode-value={data.invoiceId}
              jsbarcode-textmargin="0"
              jsbarcode-fontoptions="bold"
              className="w-full h-12"
            ></svg>
            <p className="text-xs mt-1">{data.invoiceId}</p>
          </div>
        </div>

        {/* FOOTER */}
        <p className="mt-10 text-center text-sm text-gray-600 border-t pt-4">
          Terima kasih telah berbelanja di <span className="font-bold text-[#0B4B50]">KOJE24</span> 💛
          Semoga sehat & berten energi setiap hari!
        </p>
      </div>
    </div>
  );
}
