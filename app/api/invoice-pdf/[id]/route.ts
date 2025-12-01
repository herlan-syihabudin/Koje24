import { NextResponse } from "next/server";
import { pdf, Document, Page, Text, StyleSheet } from "@react-pdf/renderer";
import invoices from "@/data/invoices.json"; // kalau API fetch, samakan seperti yang di invoice page

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const invoiceId = params.id;
  const data = invoices.find((i) => i.invoiceId === invoiceId);

  if (!data) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const styles = StyleSheet.create({
    page: { padding: 40 },
    title: { fontSize: 22, marginBottom: 20 },
    label: { fontSize: 12, marginBottom: 4 },
  });

  // 🔥 JSX didefinisikan dulu dalam const
  const PdfDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>INVOICE #{data.invoiceId}</Text>
        <Text style={styles.label}>Nama: {data.nama}</Text>
        <Text style={styles.label}>HP: {data.hp}</Text>
        <Text style={styles.label}>Alamat: {data.alamat}</Text>
        <Text style={[styles.label, { marginTop: 12 }]}>
          Total: Rp {data.effectiveGrandTotal.toLocaleString("id-ID")}
        </Text>
      </Page>
    </Document>
  );

  // 🔥 Baru di-render ke PDF buffer
  const pdfFile = await pdf(PdfDocument).toBuffer();

  return new NextResponse(pdfFile, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=KOJE24-${invoiceId}.pdf`,
    },
  });
}
