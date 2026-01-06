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
    fetch(`/api/dashboard/sales-chart?mode=${mode}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
      });
  }, [mode]);

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-900">
          Grafik Penjualan
        </p>

        <div className="flex gap-2">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`text-xs px-3 py-1 rounded-full border ${
                mode === m.key
                  ? "bg-[#0FA3A8] text-white"
                  : "text-gray-500"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-gray-400">
            Belum ada data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#0FA3A8"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
