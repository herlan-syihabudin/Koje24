"use client"
import { useState } from "react"

export default function TulisTestimoniForm({ onSuccess }) {
  const [show, setShow] = useState(false)
  const [sending, setSending] = useState(false)
  const [errors, setErrors] = useState({})
  const [lastSubmit, setLastSubmit] = useState(null)
  const [statusMsg, setStatusMsg] = useState(null)
  const [hoverRating, setHoverRating] = useState(null)
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)

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

  // =============================
  // VALIDATION
  // =============================
  const validate = () => {
    const err = {}
    if (form.nama.trim().length < 2) err.nama = "Nama minimal 2 karakter"
    if (form.kota.trim().length < 2) err.kota = "Kota minimal 2 karakter"
    if (form.pesan.trim().length < 10) err.pesan = "Minimal 10 karakter"
    if (!form.varian) err.varian = "Pilih varian"

    setErrors(err)
    return Object.keys(err).length === 0
  }

  // =============================
  // FILE UPLOAD (VERCEL BLOB)
  // =============================
  const uploadFileToBlob = async () => {
    if (!file) return ""

    const fd = new FormData()
    fd.append("file", file)

    const res = await fetch("/api/upload", { method: "POST", body: fd })
    const json = await res.json()
    return json.url || ""
  }

  // =============================
  // SUBMIT HANDLER
  // =============================
  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatusMsg(null)

    if (!validate()) return

    if (lastSubmit && Date.now() - lastSubmit < 6000) {
      setStatusMsg("Tunggu sebentar...")
      return
    }

    setSending(true)

    try {
      // Upload foto dulu
      let imageUrl = ""
      if (file) imageUrl = await uploadFileToBlob()

      // Logic hide otomatis
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
        className="px-5 py-2 bg-[#0FA3A8] text-white rounded-full shadow"
      >
        + Tulis Testimoni
      </button>

      {show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-[90%] max-w-md relative">

            <button onClick={() => setShow(false)} className="absolute right-4 top-3 text-xl text-gray-400">
              ✕
            </button>

            <h3 className="text-xl font-semibold mb-4 text-[#0B4B50]">Tulis Testimoni Kamu 💬</h3>

            <form onSubmit={handleSubmit} className="space-y-3">

              <input
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Nama"
                className="border p-2 rounded-lg w-full"
              />
              {errors.nama && <p className="text-xs text-red-500">{errors.nama}</p>}

              <input
                value={form.kota}
                onChange={(e) => setForm({ ...form, kota: e.target.value })}
                placeholder="Kota"
                className="border p-2 rounded-lg w-full"
              />
              {errors.kota && <p className="text-xs text-red-500">{errors.kota}</p>}

              <textarea
                value={form.pesan}
                onChange={(e) => setForm({ ...form, pesan: e.target.value })}
                placeholder="Ceritakan pengalamanmu…"
                className="border p-2 rounded-lg w-full"
              />
              {errors.pesan && <p className="text-xs text-red-500">{errors.pesan}</p>}

              <select
                value={form.varian}
                onChange={(e) => setForm({ ...form, varian: e.target.value })}
                className="border p-2 rounded-lg w-full"
              >
                <option value="">Pilih Varian</option>
                <option>Green Detox</option>
                <option>Yellow Immunity</option>
                <option>Beetroot</option>
                <option>Sunrise</option>
                <option>Carrot Boost</option>
                <option>Ginger Shot</option>
              </select>
              {errors.varian && <p className="text-xs text-red-500">{errors.varian}</p>}

              {/* Rating */}
              <div className="flex gap-1">
                {[1,2,3,4,5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setForm({ ...form, rating: star })}
                    className="text-xl"
                  >
                    <span className={(hoverRating ?? form.rating) >= star ? "text-yellow-400" : "text-gray-300"}>
                      ★
                    </span>
                  </button>
                ))}
              </div>

              {/* Upload foto */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null
                  setFile(f)
                  if (f) setPreview(URL.createObjectURL(f))
                }}
                className="border p-2 rounded-lg w-full"
              />

              {preview && (
                <img src={preview} className="w-20 h-20 rounded-lg object-cover mt-2 border" />
              )}

              {statusMsg && <p className="text-xs text-center text-gray-600">{statusMsg}</p>}

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-[#0FA3A8] text-white py-2 rounded-full"
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
