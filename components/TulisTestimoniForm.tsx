"use client"
import { useState } from "react"

type FormState = {
  nama: string
  kota: string
  pesan: string
  rating: number
  varian: string
  img: string // ini akan diisi URL hasil upload blob
  active: string
  showOnHome: string
}

export default function TulisTestimoniForm({ onSuccess }: { onSuccess?: () => void }) {
  const [show, setShow] = useState(false)
  const [sending, setSending] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [lastSubmit, setLastSubmit] = useState<number | null>(null)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const [form, setForm] = useState<FormState>({
    nama: "",
    kota: "",
    pesan: "",
    rating: 5,
    varian: "",
    img: "",
    active: "false",
    showOnHome: "false",
  })

  const validate = () => {
    const err: Record<string, string> = {}
    if (form.nama.trim().length < 2) err.nama = "Nama minimal 2 karakter"
    if (form.kota.trim().length < 2) err.kota = "Kota minimal 2 karakter"
    if (form.pesan.trim().length < 10) err.pesan = "Minimal 10 karakter"
    if (!form.varian) err.varian = "Pilih varian"
    setErrors(err)
    return Object.keys(err).length === 0
  }

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
    setPreview(null)
    setFile(null)
    setHoverRating(null)
    setErrors({})
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

    // Anti spam
    if (lastSubmit && Date.now() - lastSubmit < 6000) {
      setStatusMsg("Tunggu sebentar ya…")
      return
    }

    setSending(true)

    try {
      // 🔥 Upload foto dulu kalau ada
      let imageUrl = ""
      if (file) {
        imageUrl = await uploadFileToBlob()
      }

      // 🔥 Auto-mod: hide rating jelek
      if (form.rating <= 3) {
        form.active = "false"
        form.showOnHome = "false"
      } else {
        form.active = "true"
        form.showOnHome = "true"
      }

      const payload = {
        ...form,
        img: imageUrl, // 🔥 URL foto final
      }

      // Kirim ke Google Sheet (API testimonial lu)
      await fetch("/api/testimonial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      setLastSubmit(Date.now())
      setStatusMsg("Terima kasih! Testimoni kamu sudah terkirim 🙌")

      onSuccess?.()

      setTimeout(() => {
        setShow(false)
        resetForm()
      }, 1000)
    } catch (err) {
      console.error(err)
      setStatusMsg("Terjadi kesalahan. Coba lagi ya 🙏")
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white w-[90%] max-w-md p-6 rounded-3xl shadow-xl relative">

            <button
              onClick={() => setShow(false)}
              className="absolute right-4 top-3 text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>

            <h3 className="text-xl font-semibold mb-3 text-[#0B4B50]">Tulis Testimoni Kamu 💬</h3>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* input + errors */}
              <input
                name="nama"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Nama"
                className="border w-full p-2 rounded-lg"
              />
              {errors.nama && <p className="text-xs text-red-500">{errors.nama}</p>}

              <input
                name="kota"
                value={form.kota}
                onChange={(e) => setForm({ ...form, kota: e.target.value })}
                placeholder="Kota"
                className="border w-full p-2 rounded-lg"
              />
              {errors.kota && <p className="text-xs text-red-500">{errors.kota}</p>}

              <textarea
                name="pesan"
                value={form.pesan}
                onChange={(e) => setForm({ ...form, pesan: e.target.value })}
                placeholder="Ceritakan pengalamanmu…"
                className="border w-full p-2 rounded-lg min-h-[80px]"
              />
              {errors.pesan && <p className="text-xs text-red-500">{errors.pesan}</p>}

              {/* Varian */}
              <select
                value={form.varian}
                onChange={(e) => setForm({ ...form, varian: e.target.value })}
                className="border w-full p-2 rounded-lg"
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

              {/* Rating bintang */}
              <div>
                <p className="text-sm text-gray-500 mb-1">Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setForm({ ...form, rating: star })}
                      className="text-xl"
                    >
                      <span className={
                        (hoverRating ?? form.rating) >= star
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }>
                        ★
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload File */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null
                    setFile(f)
                    if (f) {
                      setPreview(URL.createObjectURL(f))
                    }
                  }}
                  className="border w-full p-2 rounded-lg"
                />
                {preview && (
                  <img
                    src={preview}
                    className="mt-2 w-20 h-20 rounded-lg object-cover border"
                  />
                )}
              </div>

              {statusMsg && <p className="text-center text-gray-600 text-xs">{statusMsg}</p>}

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
