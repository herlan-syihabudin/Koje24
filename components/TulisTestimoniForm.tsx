"use client"
import { useState, useEffect } from "react"

type Props = {
  onSuccess?: () => void
}

export default function TulisTestimoniForm({ onSuccess }: Props) {
  const [show, setShow] = useState(false)
  const [sending, setSending] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [lastSubmit, setLastSubmit] = useState<number | null>(null)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const [form, setForm] = useState({
    nama: "",
    kota: "",
    pesan: "",
    rating: 5,
    varian: "",
    img: "",
    active: false,
    showOnHome: false,
  })

  /* ==============================
      LOCK BODY WHEN MODAL OPEN
  ===============================*/
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => (document.body.style.overflow = "")
  }, [show])

  const validate = () => {
    const err: Record<string, string> = {}
    if (form.nama.trim().length < 2) err.nama = "Nama minimal 2 karakter"
    if (form.kota.trim().length < 2) err.kota = "Kota minimal 2 karakter"
    if (form.pesan.trim().length < 10) err.pesan = "Minimal 10 karakter"
    if (!form.varian) err.varian = "Pilih varian"

    setErrors(err)
    return Object.keys(err).length === 0
  }

  const uploadFileToBlob = async () => {
    if (!file) return ""

    const fd = new FormData()
    fd.append("file", file)

    const res = await fetch("/api/upload", { method: "POST", body: fd })
    const json = await res.json()
    return json.url || ""
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setStatusMsg(null)

    if (!validate()) return

    if (lastSubmit && Date.now() - lastSubmit < 6000) {
      setStatusMsg("Tunggu sebentar sebelum mengirim lagi…")
      return
    }

    setSending(true)

    try {
      let imageUrl = ""
      if (file) imageUrl = await uploadFileToBlob()

      const newForm = {
        ...form,
        active: form.rating > 3,
        showOnHome: form.rating > 3,
        img: imageUrl,
      }

      await fetch("/api/testimonial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newForm),
      })

      setLastSubmit(Date.now())
      setStatusMsg("Terima kasih! Testimoni kamu terkirim 🙌")

      onSuccess?.()

      setTimeout(() => {
        setShow(false)
      }, 900)
    } catch (err) {
      console.error(err)
      setStatusMsg("Terjadi kesalahan, coba lagi.")
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="px-5 py-2 bg-[#0FA3A8] text-white rounded-full shadow-md hover:shadow-lg text-sm md:text-base transition-all"
      >
        + Tulis Testimoni
      </button>

      {show && (
        <div
          className="
            fixed inset-0 z-[9999]
            bg-black/60 backdrop-blur-sm
            flex items-center justify-center
            overflow-y-auto
            py-10 px-4
          "
        >
          <div
            className="
              relative w-full max-w-md
              bg-white rounded-3xl shadow-xl
              p-6
            "
            style={{ maxHeight: "90vh", overflowY: "auto" }}
          >
            {/* TOMBOL X SELALU TERLIHAT */}
            <button
              onClick={() => setShow(false)}
              className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-[#0FA3A8]"
            >
              ✕
            </button>

            <h3 className="text-xl font-semibold mb-1 text-[#0B4B50]">
              Tulis Testimoni Kamu 💬
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Ceritakan pengalamanmu setelah minum KOJE24. Ulasan bintang 4–5
              bisa tampil di beranda.
            </p>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-3 pb-3">

              {/* NAMA */}
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Nama Lengkap
                </label>
                <input
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Contoh: Herlan S."
                  className="mt-1 border border-[#e2e8f0] p-2 rounded-lg w-full text-sm outline-none focus:border-[#0FA3A8] focus:ring-1 focus:ring-[#0FA3A8]/40"
                />
                {errors.nama && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.nama}</p>
                )}
              </div>

              {/* KOTA */}
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Kota / Domisili
                </label>
                <input
                  value={form.kota}
                  onChange={(e) => setForm({ ...form, kota: e.target.value })}
                  placeholder="Contoh: Bekasi"
                  className="mt-1 border border-[#e2e8f0] p-2 rounded-lg w-full text-sm outline-none focus:border-[#0FA3A8] focus:ring-1 focus:ring-[#0FA3A8]/40"
                />
                {errors.kota && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.kota}</p>
                )}
              </div>

              {/* PESAN */}
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Ceritakan Pengalamanmu
                </label>
                <textarea
                  value={form.pesan}
                  onChange={(e) => setForm({ ...form, pesan: e.target.value })}
                  placeholder="Contoh: Setelah rutin minum KOJE24, badan terasa lebih segar dan ringan..."
                  rows={3}
                  className="mt-1 border border-[#e2e8f0] p-2 rounded-lg w-full text-sm outline-none resize-none focus:border-[#0FA3A8] focus:ring-1 focus:ring-[#0FA3A8]/40"
                />
                {errors.pesan && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.pesan}</p>
                )}
              </div>

              {/* VARIAN */}
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Varian Favorit
                </label>
                <select
                  value={form.varian}
                  onChange={(e) => setForm({ ...form, varian: e.target.value })}
                  className="mt-1 border border-[#e2e8f0] p-2 rounded-lg w-full text-sm outline-none bg-white focus:border-[#0FA3A8] focus:ring-1 focus:ring-[#0FA3A8]/40"
                >
                  <option value="">Pilih Varian</option>
                  <option>Green Detox</option>
                  <option>Yellow Immunity</option>
                  <option>Beetroot</option>
                  <option>Sunrise</option>
                  <option>Carrot Boost</option>
                  <option>Ginger Shot</option>
                </select>
                {errors.varian && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.varian}</p>
                )}
              </div>

              {/* RATING */}
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Rating Kepuasan
                </label>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setForm({ ...form, rating: star })}
                      className="text-xl"
                    >
                      <span
                        className={
                          (hoverRating ?? form.rating) >= star
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }
                      >
                        ★
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* FOTO OPSIONAL */}
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Foto (opsional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null
                    setFile(f)
                    if (f) setPreview(URL.createObjectURL(f))
                  }}
                  className="mt-1 border border-[#e2e8f0] p-2 rounded-lg w-full text-sm"
                />

                {preview && (
                  <img
                    src={preview}
                    className="w-20 h-20 rounded-lg object-cover mt-2 border border-[#e2e8f0]"
                    alt="Preview"
                  />
                )}
              </div>

              {statusMsg && (
                <p className="text-[11px] text-center text-gray-600 mt-1">
                  {statusMsg}
                </p>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={sending}
                className="w-full bg-[#0FA3A8] hover:bg-[#0B4B50] text-white py-2.5 rounded-full text-sm font-medium mt-2 transition-all disabled:opacity-60"
              >
                {sending ? "Mengirim…" : "Kirim Testimoni"}
              </button>

            </form>
          </div>
        </div>
      )}
    </>
  )
}
