"use client";

import { useEffect, useState } from "react";
import { Search, Users, UserCheck, UserPlus, Download, Eye, FileText } from "lucide-react";
import { toast } from "sonner";

type Customer = {
  id: string;
  nama: string;
  email: string;
  telepon: string;
  kota: string;
  totalOrder: number;
  totalBelanja: number;
  status: "aktif" | "nonaktif";
  firstOrderDate?: string;
  lastOrderDate?: string;
};

type OrderHistory = {
  invoice: string;
  tanggal: string;
  total: number;
  status: string;
};

// Stat Card
function StatCard({ title, value, icon: Icon }: { title: string; value: number; icon: any }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{title}</p>
        <Icon className="w-4 h-4 text-[#0FA3A8]" />
      </div>
      <p className="text-2xl font-semibold mt-2">{value.toLocaleString("id-ID")}</p>
    </div>
  );
}

// Customer Detail Modal
function CustomerDetailModal({ 
  customer, 
  onClose, 
  onExportOrder 
}: { 
  customer: Customer | null; 
  onClose: () => void;
  onExportOrder: (email: string, nama: string) => void;
}) {
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setLoading(true);
      fetch(`/api/dashboard/customers/${customer.id}/orders`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setOrders(data.orders);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [customer]);

  if (!customer) return null;

  const totalOrder = orders.length;
  const totalBelanja = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Detail Pelanggan</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">✕</button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Tombol Export di Modal */}
          <div className="flex justify-end">
            <button
              onClick={() => onExportOrder(customer.email, customer.nama)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0FA3A8] text-white rounded-xl text-sm font-semibold hover:bg-[#0D8B8F] transition"
            >
              <FileText className="w-4 h-4" />
              Export PDF (Riwayat Order)
            </button>
          </div>

          {/* Info Customer */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Nama</p>
              <p className="font-semibold">{customer.nama}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm">{customer.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Telepon</p>
              <p>{customer.telepon}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Kota</p>
              <p>{customer.kota}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Order</p>
              <p className="font-semibold">{customer.totalOrder} x</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Belanja</p>
              <p className="font-semibold text-[#0FA3A8]">Rp {customer.totalBelanja.toLocaleString("id-ID")}</p>
            </div>
          </div>

          {/* Ringkasan Repeat Order */}
          {totalOrder > 1 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="text-sm text-orange-700">
                🎯 <strong>Repeat Customer!</strong> Telah melakukan {totalOrder} kali transaksi dengan total belanja Rp {totalBelanja.toLocaleString("id-ID")}
              </p>
            </div>
          )}

          {/* Riwayat Order */}
          <div>
            <h3 className="font-semibold mb-3">Riwayat Order ({totalOrder} transaksi)</h3>
            {loading ? (
              <div className="text-center py-4">Memuat...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-4 text-gray-400">Belum ada order</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Invoice</th>
                      <th className="px-3 py-2 text-left">Tanggal</th>
                      <th className="px-3 py-2 text-right">Total</th>
                      <th className="px-3 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.invoice} className="border-t">
                        <td className="px-3 py-2 font-mono text-xs">{order.invoice}</td>
                        <td className="px-3 py-2">{order.tanggal}</td>
                        <td className="px-3 py-2 text-right">Rp {order.total.toLocaleString("id-ID")}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            order.status === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Export semua customer ke PDF
async function exportAllCustomers() {
  try {
    toast.info("Sedang memproses export...");
    const res = await fetch("/api/dashboard/customers/export-all");
    if (!res.ok) throw new Error("Export gagal");
    
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `semua_pelanggan_${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Export semua pelanggan berhasil");
  } catch (error) {
    toast.error("Gagal export data pelanggan");
  }
}

// Export 1 customer (riwayat order)
async function exportCustomerOrders(customerId: string, customerName: string) {
  try {
    toast.info("Sedang memproses export...");
    const res = await fetch(`/api/dashboard/customers/${encodeURIComponent(customerId)}/export`);
    if (!res.ok) throw new Error("Export gagal");
    
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `riwayat_${customerName.replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Export riwayat order berhasil");
  } catch (error) {
    toast.error("Gagal export riwayat order");
  }
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    aktif: 0,
    baru: 0,
  });

  useEffect(() => {
    fetch("/api/dashboard/customers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCustomers(data.customers);
          setStats(data.stats);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.nama.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.telepon.includes(search)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 pb-8">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">CUSTOMERS</p>
          <h1 className="text-2xl font-semibold">Manajemen Pelanggan</h1>
          <p className="text-sm text-gray-600 mt-1">
            Data pelanggan KOJE24 dan riwayat interaksi.
          </p>
        </div>
        
        {/* Tombol Export Semua Customer */}
        <button
          onClick={exportAllCustomers}
          className="flex items-center gap-2 px-4 py-2 bg-[#0FA3A8] text-white rounded-xl text-sm font-semibold hover:bg-[#0D8B8F] transition"
        >
          <Download className="w-4 h-4" />
          Export Semua Customer
        </button>
      </div>

      {/* STATS */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Pelanggan" value={stats.total} icon={Users} />
        <StatCard title="Pelanggan Aktif" value={stats.aktif} icon={UserCheck} />
        <StatCard title="Pelanggan Baru (30 hari)" value={stats.baru} icon={UserPlus} />
      </div>

      {/* SEARCH & TABLE */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Daftar Pelanggan</h2>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, email, atau telepon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#0FA3A8]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center">Memuat data...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="px-4 py-12 text-center text-gray-400">
              {search ? "Tidak ada pelanggan yang cocok" : "Belum ada data pelanggan"}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">Nama</th>
                  <th className="px-4 py-3 text-left">Kontak</th>
                  <th className="px-4 py-3 text-left">Kota</th>
                  <th className="px-4 py-3 text-right">Total Order</th>
                  <th className="px-4 py-3 text-right">Total Belanja</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="font-medium text-[#0FA3A8] hover:underline"
                      >
                        {customer.nama}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <div>{customer.telepon}</div>
                      <div className="text-xs text-gray-400">{customer.email}</div>
                    </td>
                    <td className="px-4 py-3">{customer.kota}</td>
                    <td className="px-4 py-3 text-right">{customer.totalOrder} x</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      Rp {customer.totalBelanja.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-semibold ${
                        customer.status === "aktif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {customer.status === "aktif" ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="p-1 rounded-lg hover:bg-gray-100 transition"
                        title="Lihat detail"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && filteredCustomers.length > 0 && (
          <div className="px-4 py-3 border-t bg-gray-50 text-xs text-gray-500">
            Menampilkan {filteredCustomers.length} dari {customers.length} pelanggan
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      <CustomerDetailModal 
        customer={selectedCustomer} 
        onClose={() => setSelectedCustomer(null)}
        onExportOrder={exportCustomerOrders}
      />
    </div>
  );
}
