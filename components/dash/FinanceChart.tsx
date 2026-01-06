"use client";

import { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0FA3A8", "#F59E0B"];

type ChartItem = {
  name: string;
  value: number;
  count: number;
};

export default function FinanceChart({ data }: { data: ChartItem[] }) {
  const [hidden, setHidden] = useState<string[]>([]);

  const totalValue = useMemo(
    () => data.reduce((sum, d) => sum + d.value, 0),
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
      <div className="rounded-2xl border bg-white p-6 text-center text-xs text-gray-400">
        Belum ada data pembayaran
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-semibold">
          Perbandingan Metode Pembayaran
        </p>
        <p className="text-xs text-gray-500">
          Total: Rp {totalValue.toLocaleString("id-ID")}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-center">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={visibleData}
                dataKey="value"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
              >
                {visibleData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
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

        <div className="space-y-3">
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
                className={`cursor-pointer rounded-xl border p-3 transition
                  ${isHidden ? "opacity-40" : "hover:bg-gray-50"}`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          COLORS[i % COLORS.length],
                      }}
                    />
                    <span className="text-sm font-medium">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold">
                    {percent}%
                  </span>
                </div>

                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{item.count} transaksi</span>
                  <span>
                    Rp {item.value.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
