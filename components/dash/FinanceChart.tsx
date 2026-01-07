"use client";

import { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0FA3A8", "#F59E0B", "#6366F1", "#10B981"];

type ChartItem = {
  name: string;
  value: number;
  count?: number;
};

export default function FinanceChart({ data = [] }: { data?: ChartItem[] }) {
  const [hidden, setHidden] = useState<string[]>([]);

  const totalValue = useMemo(
    () => data.reduce((sum, d) => sum + (Number(d.value) || 0), 0),
    [data]
  );

  const visibleData = useMemo(
    () => data.filter((d) => !hidden.includes(d.name)),
    [data, hidden]
  );

  function toggleLegend(name: string) {
    setHidden((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name]
    );
  }

  if (!data.length) {
    return (
      <p className="text-xs text-gray-400 text-center py-6">
        Belum ada data pembayaran
      </p>
    );
  }

  return (
    <>
      {/* TITLE */}
      <div>
        <p className="text-sm font-semibold">
          Perbandingan Metode Pembayaran
        </p>
        <p className="text-xs text-gray-500">
          Total: Rp {totalValue.toLocaleString("id-ID")}
        </p>
      </div>

      {/* DONUT */}
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={visibleData}
              dataKey="value"
              nameKey="name"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={4}
            >
              {visibleData.map((_, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(v: any) =>
                `Rp ${Number(v || 0).toLocaleString("id-ID")}`
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* LEGEND (NO CARD) */}
      <div className="space-y-2">
        {data.map((item, i) => {
          const percent =
            totalValue === 0
              ? 0
              : Math.round((item.value / totalValue) * 100);

          const isHidden = hidden.includes(item.name);

          return (
            <div
              key={item.name}
              onClick={() => toggleLegend(item.name)}
              className={`cursor-pointer flex justify-between items-center text-sm ${
                isHidden ? "opacity-40" : "hover:opacity-80"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: COLORS[i % COLORS.length],
                  }}
                />
                <span>{item.name}</span>
              </div>

              <span className="font-medium">{percent}%</span>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-gray-400">
        Klik legend untuk sembunyikan / tampilkan data
      </p>
    </>
  );
}
