"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

export default function UnsubscribeClient() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  const [status, setStatus] = useState<
    "loading" | "success" | "error"
  >("loading")

  useEffect(() => {
    if (!email) {
      setStatus("error")
      return
    }

    fetch(`/api/unsubscribe?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"))
  }, [email])

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 420, textAlign: "center" }}>
        {status === "loading" && (
          <p>⏳ Memproses permintaan kamu...</p>
        )}

        {status === "success" && (
          <>
            <h2>Berhasil Unsubscribe</h2>
            <p>
              Kamu sudah berhenti menerima email dari KOJE24 🍹
            </p>
            <p style={{ fontSize: 14, color: "#666" }}>
              Kamu bisa subscribe lagi kapan saja.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h2>Terjadi Kesalahan</h2>
            <p>Permintaan tidak dapat diproses.</p>
          </>
        )}
      </div>
    </div>
  )
}
