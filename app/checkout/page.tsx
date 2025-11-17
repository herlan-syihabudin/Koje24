"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    nama: "",
    hp: "",
    alamat: "",
    produk: "Green Detox",
    qty: 1,
    price: 20000,
  })

  const total = form.qty * form.price

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        total,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (data.success && data.invoiceUrl) {
      router.push(data.invoiceUrl)
    } else {
      alert("Gagal membuat invoice")
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full space-y-4"
      >
        <h2 className="text-xl font-bold text-[#0B4B50] mb-4">
          Checkout Pemesanan
        </h2>

        <input
          required
          placeholder="Nama Lengkap"
          className="w-full p-3 border rounded-xl"
          onChange={(e) => setForm({ ...form, nama: e.target.value })}
        />

        <input
          required
          placeholder="Nomor HP"
          className="w-full p-3 border rounded-xl"
          onChange={(e) => setForm({ ...form, hp: e.target.value })}
        />

        <textarea
          required
          placeholder="Alamat Lengkap"
          className="w-full p-3 border rounded-xl"
          onChange={(e) => setForm({ ...form, alamat: e.target.value })}
        />

        <div className="border-t pt-3">
          <p className="font-semibold">{form.produk}</p>
          <p className="text-gray-600 text-sm">
            {form.qty} x Rp{form.price.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="flex justify-between text-lg border-t pt-4">
          <span>Total</span>
          <span className="font-bold text-[#0B4B50]">
            Rp{total.toLocaleString("id-ID")}
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0B4B50] text-white py-3 rounded-xl hover:bg-[#093d42] transition"
        >
          {loading ? "Memproses..." : "Buat Invoice"}
        </button>
      </form>
    </main>
  )
}
