"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0FA3A8", "#F59E0B"];

export default function FinanceChart() {
  const [chart, setChart] = useState<any[]>([]);
  const [methods, setMethods] = useState<any>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/dashboard/finance", { cache: "no-store" })
      .then((res) => res.json())
      .then((res) => {
        if (!res.success) return;

        setChart(res.chart);
        setMethods(res.methods);
        setTotal(res.summary.totalRevenue);
      });
  }, []);

  if (!chart.length || !methods) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-xs text-gray-400 text-center">
        Belum ada data pembayaran
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-6 space-y-5">
      {/* TITLE */}
      <div>
        <p className="text-sm font-semibold">Perbandingan Metode Pembayaran</p>
        <p className="text-xs text-gray-500">
          Berdasarkan transaksi berstatus <strong>PAID</strong>
        </p>
      </div>

      {/* CHART */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chart}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
            >
              {chart.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>

            <Tooltip
              formatter={(v: number) =>
                `Rp ${v.toLocaleString("id-ID")}`
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* LEGEND */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        {Object.values(methods).map((m: any, i: number) => {
          const percent =
            total > 0 ? Math.round((m.amount / total) * 100) : 0;

          return (
            <div
              key={m.name}
              className="flex items-start gap-3 border rounded-xl p-3"
            >
              <span
                className="w-3 h-3 rounded-full mt-1"
                style={{ backgroundColor: COLORS[i] }}
              />

              <div className="space-y-0.5">
                <p className="font-medium">{m.name}</p>
                <p className="text-xs text-gray-500">
                  {m.count} transaksi
                </p>
                <p className="text-sm font-semibold">
                  Rp {m.amount.toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-gray-400">
                  {percent}% dari total
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
