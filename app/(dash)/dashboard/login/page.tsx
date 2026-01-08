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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Login gagal");
      }

      // 🔥 FULL reload (cookie pasti kebaca server)
      window.location.href = "/dashboard";
    } catch (error) {
      if (error instanceof Error) {
        setErr(error.message);
      } else {
        setErr("Login gagal");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* 🌿 Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#0FA3A8,_#062F32_70%)]" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      {/* 💎 Login Card */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-8 text-white">
          <p className="text-xs tracking-[0.35em] text-[#9FE6E8]">
            KOJE24 • ADMIN
          </p>

          <h1 className="text-3xl font-playfair font-semibold mt-2">
            Dashboard Login
          </h1>

          <p className="text-sm text-white/70 mt-1">
            Akses terbatas internal operasional
          </p>

          <form onSubmit={submit} className="space-y-4 mt-6">
            <input
              type="email"
              autoComplete="email"
              disabled={loading}
              className="w-full rounded-xl bg-white/20 px-4 py-3 text-sm placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#0FA3A8] disabled:opacity-60"
              placeholder="Email admin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              autoComplete="current-password"
              disabled={loading}
              className="w-full rounded-xl bg-white/20 px-4 py-3 text-sm placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#0FA3A8] disabled:opacity-60"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {err && (
              <div className="text-sm bg-red-500/20 border border-red-400/30 rounded-lg px-3 py-2">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-full bg-[#0FA3A8] hover:bg-[#12b7bc] py-3 font-semibold transition disabled:opacity-50"
            >
              {loading ? "Memverifikasi..." : "Masuk Dashboard"}
            </button>
          </form>

          <p className="text-[11px] text-white/50 mt-6 text-center">
            Sistem internal • Unauthorized access prohibited
          </p>
        </div>
      </div>
    </main>
  );
}
