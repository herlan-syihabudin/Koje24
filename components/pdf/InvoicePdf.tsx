import { Document, Page, Text, StyleSheet, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 12, gap: 6 },
  title: { fontSize: 22, marginBottom: 20, fontWeight: 700 },
  row: { marginBottom: 4 }
});

export default function InvoicePdf({ data }: { data: any }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>INVOICE #{data.invoiceId}</Text>

        <View style={styles.row}>
          <Text>Nama: {data.nama}</Text>
          <Text>HP: {data.hp}</Text>
          <Text>Alamat: {data.alamat}</Text>
        </View>

        <View style={{ marginTop: 12 }}>
          <Text>Total Dibayarkan:</Text>
          <Text style={{ fontSize: 16, marginTop: 4, fontWeight: 700 }}>
            Rp {data.effectiveGrandTotal?.toLocaleString("id-ID")}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
