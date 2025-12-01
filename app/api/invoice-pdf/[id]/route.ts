import { NextResponse } from "next/server";
import { fetchInvoiceById } from "@/lib/invoice-db";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// FONT DEFAULT
Font.register({
  family: "Inter",
  fonts: [{ src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrKky2JgR3lOQ.ttf" }],
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const invoiceId = params.id;
  const data = await fetchInvoiceById(invoiceId);

  if (!data)
    return NextResponse.json({
      success: false,
      message: "Invoice tidak ditemukan",
    });

  const styles = StyleSheet.create({
    page: {
      padding: 32,
      fontFamily: "Inter",
      fontSize: 11,
    },
    title: {
      fontSize: 22,
      marginBottom: 16,
      textAlign: "right",
      fontWeight: 700,
    },
    section: {
      marginBottom: 14,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    label: { fontSize: 12, fontWeight: 600, marginBottom: 2 },
  });

  const Pdf = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>INVOICE #{data.invoiceId}</Text>

        {/* Pembeli */}
        <View style={styles.section}>
          <Text style={styles.label}>Pembeli</Text>
          <Text>{data.nama}</Text>
          <Text>{data.alamat}</Text>
          <Text>{data.hp}</Text>
        </View>

        {/* Produk */}
        <View style={styles.section}>
          <Text style={styles.label}>Rincian Pesanan</Text>
          <Text>{data.produkList}</Text>
        </View>

        {/* Total */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text>Subtotal Produk</Text>
            <Text>{data.subtotalCalc.toLocaleString("id-ID")}</Text>
          </View>
          <View style={styles.row}>
            <Text>Ongkir</Text>
            <Text>{data.effectiveOngkir.toLocaleString("id-ID")}</Text>
          </View>
          <View style={[styles.row, { marginTop: 8 }]}>
            <Text style={{ fontSize: 14, fontWeight: 700 }}>TOTAL</Text>
            <Text style={{ fontSize: 14, fontWeight: 700 }}>
              {data.effectiveGrandTotal.toLocaleString("id-ID")}
            </Text>
          </View>
        </View>

        <Text
          style={{
            textAlign: "center",
            marginTop: 32,
            fontSize: 11,
          }}
        >
          Terima kasih telah berbelanja di KOJE24 💛 Semoga sehat &
          berenergi setiap hari!
        </Text>
      </Page>
    </Document>
  );

  const pdfBuffer = await Pdf.render();

  return new Response(Buffer.from(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="KOJE24-${data.invoiceId}.pdf"`,
    },
  });
}
