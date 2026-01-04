"use client";

import { useState } from "react";

export default function DashboardLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setErr("");

    try {
      const res = await fetch("/api/dashboard/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      // ❗️ WAJIB CEK success (BUKAN ok)
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Login gagal");
      }

      // ✅ WAJIB FULL RELOAD agar cookie terbaca server
      window.location.href = "/dashboard";
    } catch (e: any) {
      setErr(e?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F4FAFA] text-[#0B4B50] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border rounded-3xl shadow p-6">
        <p className="text-xs tracking-[0.25em] text-[#0FA3A8]">
          KOJE24 • ADMIN
        </p>

        <h1 className="text-2xl font-playfair font-semibold mt-1">
          Dashboard Login
        </h1>

        <form onSubmit={submit} className="space-y-4 mt-6">
          <input
            className="border rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#0FA3A8]"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <input
            className="border rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#0FA3A8]"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {err && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {err}
            </p>
          )}

          <button
            disabled={loading}
            className="w-full bg-[#0FA3A8] text-white py-3 rounded-full font-semibold transition disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk Dashboard"}
          </button>
        </form>

        <p className="text-[11px] text-gray-500 mt-4 text-center">
          Akses terbatas untuk admin KOJE24.
        </p>
      </div>
    </main>
  );
}
