"use client"
import { useState } from "react"

type FormState = {
  nama: string
  kota: string
  pesan: string
  rating: number
  varian: string
  img: string
  active: string
  showOnHome: string
}

export default function TulisTestimoniForm({ onSuccess }: { onSuccess?: () => void }) {
  const [show, setShow] = useState(false)
  const [sending, setSending] = useState(false)
  const [lastSubmit, setLastSubmit] = useState<number | null>(null)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  const [form, setForm] = useState<FormState>({
    nama: "",
    kota: "",
    pesan: "",
    rating: 5,
    varian: "",
    img: "",
    // 🔒 default: semua testimoni baru TIDAK langsung tampil
    active: "false",
    showOnHome: "false",
  })

  const API_URL = "/api/testimonial"

  const resetForm = () => {
    setForm({
      nama: "",
      kota: "",
      pesan: "",
      rating: 5,
      varian: "",
      img: "",
      active: "false",
      showOnHome: "false",
    })
    setErrors({})
    setStatusMsg(null)
    setHoverRating(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // khusus rating → number
    if (name === "rating") {
      setForm((prev) => ({ ...prev, rating: Number(value) }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!form.nama || form.nama.trim().length < 2) {
      newErrors.nama = "Nama minimal 2 karakter"
    }
    if (!form.kota || form.kota.trim().length < 2) {
      newErrors.kota = "Kota minimal 2 karakter"
    }
    if (!form.pesan || form.pesan.trim().length < 10) {
      newErrors.pesan = "Ceritakan pengalamanmu minimal 10 karakter"
    }
    if (!form.varian) {
      newErrors.varian = "Pilih salah satu varian"
    }
    if (form.rating < 1 || form.rating > 5) {
      newErrors.rating = "Rating antara 1 sampai 5"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusMsg(null)

    // anti spam: tunggu 8 detik antar submit
    if (lastSubmit && Date.now() - lastSubmit < 8000) {
      setStatusMsg("Tunggu sebentar sebelum mengirim testimoni lagi ya 😊")
      return
    }

    if (!validate()) return

    try {
      setSending(true)

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        throw new Error("Gagal mengirim testimoni")
      }

      setLastSubmit(Date.now())
      setStatusMsg("Terima kasih! Testimoni kamu sudah kami terima dan akan ditinjau dulu 🙌")
      onSuccess?.()
      // kasih sedikit delay biar user lihat teks sukses
      setTimeout(() => {
        setShow(false)
        resetForm()
      }, 900)
    } catch (err) {
      console.error(err)
      setStatusMsg("Ups, ada kendala saat mengirim. Coba lagi sebentar lagi ya 🙏")
    } finally {
      setSending(false)
    }
  }

  const currentRating = hoverRating ?? form.rating

  return (
    <>
      <button
        onClick={() => {
          resetForm()
          setShow(true)
        }}
        className="px-5 py-2 bg-[#0FA3A8] text-white rounded-full shadow hover:bg-[#0c8c91] transition"
      >
        + Tulis Testimoni
      </button>

      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-[90%] max-w-md p-6 relative shadow-xl mx-auto
                          animate-[fadeIn_0.2s_ease-out]">
            {/* tombol close */}
            <button
              onClick={() => setShow(false)}
              className="absolute right-4 top-3 text-gray-400 hover:text-gray-600 text-xl"
              type="button"
            >
              ✕
            </button>

            <h3 className="text-xl font-semibold mb-1 text-[#0B4B50]">Tulis Testimoni Kamu 💬</h3>
            <p className="text-xs text-gray-500 mb-4">
              Testimoni baru akan kami review dulu sebelum tampil di halaman utama.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Nama + Kota */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    name="nama"
                    value={form.nama}
                    onChange={handleChange}
                    required
                    placeholder="Nama"
                    className="w-full border border-[#e6eeee] rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0FA3A8]"
                  />
                  {errors.nama && <p className="text-xs text-red-500 mt-1">{errors.nama}</p>}
                </div>
                <div className="flex-1">
                  <input
                    name="kota"
                    value={form.kota}
                    onChange={handleChange}
                    required
                    placeholder="Kota"
                    className="w-full border border-[#e6eeee] rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0FA3A8]"
                  />
                  {errors.kota && <p className="text-xs text-red-500 mt-1">{errors.kota}</p>}
                </div>
              </div>

              {/* Pesan */}
              <div>
                <textarea
                  name="pesan"
                  value={form.pesan}
                  onChange={handleChange}
                  required
                  placeholder="Ceritakan pengalamanmu setelah minum KOJE24…"
                  className="w-full border border-[#e6eeee] rounded-lg p-2 text-sm min-h-[80px] focus:outline-none focus:ring-1 focus:ring-[#0FA3A8]"
                />
                {errors.pesan && <p className="text-xs text-red-500 mt-1">{errors.pesan}</p>}
              </div>

              {/* Varian + Rating */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <select
                    name="varian"
                    value={form.varian}
                    onChange={handleChange}
                    required
                    className="w-full border border-[#e6eeee] rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0FA3A8]"
                  >
                    <option value="">Pilih Varian</option>
                    <option>Green Detox</option>
                    <option>Yellow Immunity</option>
                    <option>Beetroot</option>
                    <option>Sunrise</option>
                    <option>Carrot Boost</option>
                    <option>Ginger Shot</option>
                  </select>
                  {errors.varian && <p className="text-xs text-red-500 mt-1">{errors.varian}</p>}
                </div>

                {/* Rating bintang */}
                <div className="flex flex-col items-start">
                  <span className="text-xs text-gray-500 mb-1">Rating</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        onClick={() => setForm((prev) => ({ ...prev, rating: star }))}
                        className="text-lg transition transform hover:scale-110"
                      >
                        <span className={star <= currentRating ? "text-yellow-400" : "text-gray-300"}>
                          ★
                        </span>
                      </button>
                    ))}
                    <span className="ml-1 text-xs text-gray-500">{currentRating}/5</span>
                  </div>
                  {errors.rating && <p className="text-xs text-red-500 mt-1">{errors.rating}</p>}
                </div>
              </div>

              {/* URL gambar + preview */}
              <div>
                <input
                  name="img"
                  value={form.img}
                  onChange={handleChange}
                  placeholder="URL foto (opsional, misalnya dari Instagram)"
                  className="w-full border border-[#e6eeee] rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0FA3A8]"
                />
                {form.img && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Preview:</span>
                    <img
                      src={form.img}
                      alt="Preview"
                      className="w-10 h-10 rounded-md object-cover border border-[#e6eeee]"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none"
                      }}
                    />
                  </div>
                )}
              </div>

              {/* status & submit */}
              {statusMsg && <p className="text-xs text-center text-gray-600 mt-1">{statusMsg}</p>}

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-[#0FA3A8] text-white rounded-full py-2 font-semibold text-sm mt-1
                           disabled:opacity-70 disabled:cursor-not-allowed hover:bg-[#0c8c91] transition"
              >
                {sending ? "Mengirim..." : "Kirim Testimoni"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
