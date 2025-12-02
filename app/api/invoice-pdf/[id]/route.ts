import { NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const invoiceId = params.id;

  try {
    // 🔥 Ambil data invoice dari API internal
    const apiRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/invoice/${invoiceId}`, {
      cache: "no-store",
    });
    const apiData = await apiRes.json();

    if (!apiData.success) {
      return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
    }

    const invoice = apiData.data;

    // =============== PDF CONTENT ===============
    let pdf = `
      KOJE24 — Invoice Resmi

      Invoice #: ${invoice.invoiceId}
      Tanggal: ${invoice.timestamp}

      Pembeli:
      ${invoice.nama}
      ${invoice.alamat}
      Telp: ${invoice.hp}

      ------------------------------------------
      Produk    : ${invoice.produkList}
      Qty       : ${invoice.qtyTotal}
      Subtotal  : Rp ${invoice.subtotalCalc.toLocaleString("id-ID")}
      Ongkir    : Rp ${invoice.effectiveOngkir.toLocaleString("id-ID")}
      ------------------------------------------
      TOTAL     : Rp ${invoice.effectiveGrandTotal.toLocaleString("id-ID")}
      ------------------------------------------

      Terima kasih telah berbelanja di KOJE24 💛
    `;

    const stream = Readable.from(pdf);

    return new NextResponse(stream as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice-${invoice.invoiceId}.pdf`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal generate PDF" }, { status: 500 });
  }
}
