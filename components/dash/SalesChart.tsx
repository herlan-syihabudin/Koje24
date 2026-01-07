"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MODES = [
  { key: "daily", label: "Harian" },
  { key: "weekly", label: "Mingguan" },
  { key: "monthly", label: "Bulanan" },
];

export default function SalesChart() {
  const [mode, setMode] = useState("daily");
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/dashboard/sales-chart?mode=${mode}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
      });
  }, [mode]);

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-900">
          Grafik Penjualan
        </p>

        <div className="flex gap-1">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`text-[11px] px-2 py-0.5 rounded-full border transition ${
                mode === m.key
                  ? "bg-[#0FA3A8] text-white border-[#0FA3A8]"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* CHART */}
      <div className="h-[240px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-gray-400">
            Belum ada data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
  <AreaChart
    data={data}
    margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
  >
    <defs>
      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0FA3A8" stopOpacity={0.35} />
        <stop offset="100%" stopColor="#0FA3A8" stopOpacity={0.05} />
      </linearGradient>
    </defs>

    <XAxis
      dataKey="label"
      tick={{ fontSize: 11 }}
    />

    <YAxis
      width={90}
      tick={{ fontSize: 11 }}
      tickFormatter={(v) => `Rp ${v / 1000}k`}
      axisLine={false}
      tickLine={false}
    />

    <Tooltip
      formatter={(v: any) =>
        `Rp ${Number(v || 0).toLocaleString("id-ID")}`
      }
    />

    <Area
      type="monotone"
      dataKey="total"
      stroke="#0FA3A8"
      strokeWidth={3}
      fill="url(#salesGradient)"
      dot={{ r: 3 }}
      activeDot={{ r: 6 }}
    />
  </AreaChart>
</ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
