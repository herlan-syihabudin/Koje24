"use client";

import { useEffect, useState } from "react";
import { Search, Users, UserCheck, UserPlus } from "lucide-react";

type Customer = {
  id: string;
  nama: string;
  email: string;
  telepon: string;
  kota: string;
  totalOrder: number;
  totalBelanja: number;
  status: "aktif" | "nonaktif";
};

// Loading Skeleton
function TableSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-100 rounded mb-2" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-12 bg-gray-50 rounded mb-1" />
      ))}
    </div>
  );
}

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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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
      <div>
        <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">CUSTOMERS</p>
        <h1 className="text-2xl font-semibold">Manajemen Pelanggan</h1>
        <p className="text-sm text-gray-600 mt-1">
          Data pelanggan KOJE24 dan riwayat interaksi.
        </p>
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
          
          {/* Search Bar */}
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
            <div className="p-6">
              <TableSkeleton />
            </div>
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
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium">{customer.nama}</td>
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
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-[10px] font-semibold ${
                          customer.status === "aktif"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {customer.status === "aktif" ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Info footer */}
        {!loading && filteredCustomers.length > 0 && (
          <div className="px-4 py-3 border-t bg-gray-50 text-xs text-gray-500">
            Menampilkan {filteredCustomers.length} dari {customers.length} pelanggan
          </div>
        )}
      </div>
    </div>
  );
}
