import { NextRequest, NextResponse } from "next/server";
import html_to_pdf from "html-pdf-node";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id?.trim();
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Invoice ID kosong" },
        { status: 400 }
      );
    }

    // 🔥 Ambil data invoice dari API internal
    const apiRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/invoice/${id}`, {
      cache: "no-store",
    });
    const result = await apiRes.json();

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "Invoice tidak ditemukan" },
        { status: 404 }
      );
    }

    const invoice = result.data;

    // 🧾 HTML PDF
    const html = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #0B4B50; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; }
          th { background: #f5f5f5; text-align: left; }
          .total { font-size: 20px; font-weight: bold; color: #C62828; }
        </style>
      </head>
      <body>
        <h1>INVOICE KOJE24</h1>

        <p><b>No Invoice:</b> ${invoice.invoiceId}</p>
        <p><b>Tanggal:</b> ${invoice.timestamp}</p>

        <h3>Pembeli</h3>
        <p>${invoice.nama}<br>${invoice.alamat}<br>Telp: ${invoice.hp}</p>

        <table>
          <tr>
            <th>Produk</th>
            <th>Qty</th>
            <th>Subtotal</th>
          </tr>
          <tr>
            <td>${invoice.produkList}</td>
            <td>${invoice.qtyTotal}</td>
            <td>Rp ${invoice.subtotalCalc.toLocaleString("id-ID")}</td>
          </tr>
          <tr>
            <td colspan="2"><b>Ongkir</b></td>
            <td>Rp ${invoice.effectiveOngkir.toLocaleString("id-ID")}</td>
          </tr>
          <tr>
            <td colspan="2" class="total">TOTAL DIBAYARKAN</td>
            <td class="total">Rp ${invoice.effectiveGrandTotal.toLocaleString("id-ID")}</td>
          </tr>
        </table>

        <br><br>
        <p>Terima kasih telah berbelanja di KOJE24 💛</p>
      </body>
      </html>
    `;

    const pdfBuffer = await html_to_pdf.generatePdf(
      { content: html },
      { format: "A4", printBackground: true }
    );

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=KOJE24-inv-${invoice.invoiceId}.pdf`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Gagal generate PDF" },
      { status: 500 }
    );
  }
}
