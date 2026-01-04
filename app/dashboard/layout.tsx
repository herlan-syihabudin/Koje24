import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Search, 
  Bell, 
  Filter,
  Plus,
  Truck,
  CreditCard,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';

// Main App Component
export default function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Navigasi Data Structure
  const navigation = [
    { title: 'OVERVIEW', items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ]},
    { title: 'ORDERS', items: [
      { id: 'all_orders', label: 'Semua Order', icon: ShoppingCart },
      { id: 'pending', label: 'Pending', icon: Package },
      { id: 'paid', label: 'Paid', icon: ShieldCheck },
      { id: 'shipped', label: 'Dikirim', icon: Truck },
      { id: 'finished', label: 'Selesai', icon: PackageCheck },
    ]},
    { title: 'PRODUCTS', items: [
      { id: 'products_list', label: 'Produk', icon: Package },
      { id: 'stock', label: 'Stok', icon: BarChart3 },
      { id: 'price', label: 'Harga', icon: CreditCard },
    ]},
    { title: 'CUSTOMER', items: [
      { id: 'customers', label: 'Pelanggan', icon: Users },
      { id: 'order_history', label: 'Riwayat Order', icon: ShoppingCart },
    ]},
    { title: 'REPORTS', items: [
      { id: 'daily_report', label: 'Laporan Harian', icon: BarChart3 },
      { id: 'monthly_report', label: 'Laporan Bulanan', icon: BarChart3 },
    ]},
    { title: 'SYSTEM', items: [
      { id: 'payment_methods', label: 'Metode Pembayaran', icon: CreditCard },
      { id: 'shipping_settings', label: 'Ongkir & Kurir', icon: Truck },
      { id: 'admin_access', label: 'Admin & Akses', icon: ShieldCheck },
      { id: 'settings', label: 'Settings', icon: Settings },
    ]},
  ];

  // Render Content based on Active Menu
  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard': return <DashboardView />;
      case 'all_orders': return <OrdersView title="Semua Order" />;
      case 'products_list': return <ProductsView />;
      default: return (
        <div className="p-8 flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-400">Modul "{activeMenu}"</h2>
            <p className="text-gray-500">Fitur ini sedang dalam pengembangan.</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#0B4B50] text-white transition-all duration-300 flex flex-col`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0FA3A8] rounded-lg flex items-center justify-center font-bold">K</div>
          {sidebarOpen && <span className="text-xl font-bold tracking-tight">KOJE ADMIN</span>}
        </div>

        <nav className="flex-1 overflow-y-auto px-4 custom-scrollbar">
          {navigation.map((section, idx) => (
            <div key={idx} className="mb-6">
              {sidebarOpen && <p className="text-[10px] font-bold text-white/40 mb-2 px-2 tracking-widest">{section.title}</p>}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveMenu(item.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${
                      activeMenu === item.id 
                      ? 'bg-[#0FA3A8] text-white shadow-lg' 
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon size={20} />
                    {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button className="w-full flex items-center gap-3 p-2 text-red-300 hover:bg-red-500/10 rounded-xl transition-all">
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
          >
            <LayoutDashboard size={20} />
          </button>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-gray-100 px-3 py-1.5 rounded-lg gap-2 text-gray-400">
              <Search size={18} />
              <input type="text" placeholder="Cari order, produk..." className="bg-transparent outline-none text-sm text-gray-600 w-48" />
            </div>
            <div className="relative">
              <Bell size={20} className="text-gray-500" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
            <div className="flex items-center gap-3 border-l pl-6">
              <div className="text-right">
                <p className="text-xs font-bold text-gray-700 leading-tight">Herlan Admin</p>
                <p className="text-[10px] text-gray-400">Superadmin</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0FA3A8] to-[#0B4B50]"></div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

// --- VIEW COMPONENTS ---

function DashboardView() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0B4B50]">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm">Update data penjualan Koje hari ini.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Penjualan', val: 'Rp 2.450.000', color: 'bg-blue-500', icon: CreditCard },
          { label: 'Order Baru', val: '12 Order', color: 'bg-[#0FA3A8]', icon: ShoppingCart },
          { label: 'Produk Terjual', val: '48 Botol', color: 'bg-orange-500', icon: Package },
          { label: 'Pelanggan Baru', val: '8 Orang', color: 'bg-purple-500', icon: Users },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1">{s.label}</p>
              <h3 className="text-xl font-bold text-[#0B4B50]">{s.val}</h3>
            </div>
            <div className={`${s.color} p-3 rounded-2xl text-white shadow-lg shadow-${s.color.split('-')[1]}-200`}>
              <s.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-[#0B4B50]">Order Terkini</h3>
            <button className="text-xs text-[#0FA3A8] font-bold">Lihat Semua</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400">
                <tr>
                  <th className="px-6 py-3 tracking-wider">Order ID</th>
                  <th className="px-6 py-3 tracking-wider">Customer</th>
                  <th className="px-6 py-3 tracking-wider">Status</th>
                  <th className="px-6 py-3 tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {[1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-600">#KJ-00{i}29</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-700 text-xs">Customer Name {i}</p>
                      <p className="text-[10px] text-gray-400">Bekasi, Jawa Barat</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${i % 2 === 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {i % 2 === 0 ? 'PAID' : 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#0B4B50]">Rp 45.000</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best Selling */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-[#0B4B50] mb-6">Produk Terlaris</h3>
          <div className="space-y-6">
            {[
              { name: 'Golden Detox', stock: 24, sold: 140 },
              { name: 'Green Glow', stock: 12, sold: 98 },
              { name: 'Berry Blast', stock: 5, sold: 45 },
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center font-bold text-[#0FA3A8]">J{i+1}</div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-700">{p.name}</p>
                  <p className="text-[10px] text-gray-400">Sisa Stok: {p.stock}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#0FA3A8]">{p.sold}</p>
                  <p className="text-[10px] text-gray-400">Terjual</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersView({ title }) {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0B4B50]">{title}</h1>
          <p className="text-gray-500 text-sm">Manajemen status pesanan pelanggan.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-all">
            <Filter size={16} /> Filter
          </button>
          <button className="bg-[#0FA3A8] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-[#0FA3A8]/20 transition-all">
            <Plus size={16} /> Buat Manual
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari No. Order atau Nama..." 
              className="w-full bg-white border border-gray-200 pl-10 pr-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-[#0FA3A8]/10 text-sm"
            />
          </div>
        </div>
        <div className="p-12 text-center text-gray-400">
          <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-sm">Belum ada data order yang ditampilkan.</p>
        </div>
      </div>
    </div>
  );
}

function ProductsView() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#0B4B50]">Katalog Produk</h1>
        <button className="bg-[#0FA3A8] text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg">Tambah Produk</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-3xl border border-gray-100 overflow-hidden group">
            <div className="h-48 bg-gray-100 relative overflow-hidden flex items-center justify-center">
              <Package size={40} className="text-gray-300" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-[#0FA3A8]">Ready Stock</div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-[#0B4B50] mb-1">Koje Golden Detox</h3>
              <p className="text-xs text-gray-400 mb-4 line-clamp-2">Campuran nanas, jahe, dan kunyit untuk detoks tubuh maksimal.</p>
              <div className="flex justify-between items-center">
                <span className="text-[#0FA3A8] font-bold text-lg">Rp 18.000</span>
                <button className="p-2 bg-gray-50 hover:bg-[#0FA3A8] hover:text-white rounded-lg transition-all">
                  <Settings size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
