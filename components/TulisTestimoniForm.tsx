"use client"
import { useState } from "react"

export default function TulisTestimoniForm({ onSuccess }: { onSuccess?: () => void }) {
  const [show, setShow] = useState(false)
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({ nama: "", kota: "", pesan: "", rating: 5, varian: "", img: "" })
  const API_URL = "/api/testimonial"

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value })
  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setSending(true)
    await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    setForm({ nama: "", kota: "", pesan: "", rating: 5, varian: "", img: "" })
    setSending(false); setShow(false); onSuccess?.()
  }

  return (
    <>
      <button onClick={() => setShow(true)} className="px-5 py-2 bg-[#0FA3A8] text-white rounded-full shadow hover:bg-[#0c8c91]">
        + Tulis Testimoni
      </button>
      {show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative shadow-lg">
            <button onClick={() => setShow(false)} className="absolute right-4 top-3 text-gray-400 hover:text-gray-600 text-xl">✕</button>
            <h3 className="text-xl font-semibold mb-4 text-[#0B4B50]">Tulis Testimoni Kamu 💬</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex gap-3">
                <input name="nama" value={form.nama} onChange={handleChange} required placeholder="Nama" className="flex-1 border border-[#e6eeee] rounded-lg p-2" />
                <input name="kota" value={form.kota} onChange={handleChange} required placeholder="Kota" className="flex-1 border border-[#e6eeee] rounded-lg p-2" />
              </div>
              <textarea name="pesan" value={form.pesan} onChange={handleChange} required placeholder="Bagikan pengalamanmu…" className="w-full border border-[#e6eeee] rounded-lg p-2" />
              <div className="flex gap-3">
                <select name="varian" value={form.varian} onChange={handleChange} required className="flex-1 border border-[#e6eeee] rounded-lg p-2">
                  <option value="">Pilih Varian</option>
                  <option>Green Detox</option><option>Yellow Immunity</option><option>Beetroot</option>
                  <option>Sunrise</option><option>Carrot Boost</option><option>Ginger Shot</option>
                </select>
                <input type="number" name="rating" min={1} max={5} value={form.rating} onChange={handleChange}
                  className="w-20 border border-[#e6eeee] rounded-lg p-2 text-center" />
              </div>
              <input name="img" value={form.img} onChange={handleChange} placeholder="URL Foto (opsional)" className="w-full border border-[#e6eeee] rounded-lg p-2" />
              <button type="submit" disabled={sending} className="w-full bg-[#0FA3A8] text-white rounded-full py-2 font-semibold">
                {sending ? "Mengirim..." : "Kirim Testimoni"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
