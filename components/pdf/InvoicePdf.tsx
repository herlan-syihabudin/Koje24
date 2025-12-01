import { Document, Page, Text, StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: { padding: 40 },
  title: { fontSize: 22, marginBottom: 20 },
  label: { fontSize: 12, marginBottom: 4 },
});

export default function InvoicePdf(data: any) {
  return (
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
}
