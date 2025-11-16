export interface SheetsOrder {
  timestamp: string
  invoiceId: string
  nama: string
  hp: string
  alamat: string
  produk: string
  qty: number | string // ← DITAMBAHKAN INI
  total: number
  status: string
  paymentMethod: string
  bankInfo: string
  linkInvoice: string
}
