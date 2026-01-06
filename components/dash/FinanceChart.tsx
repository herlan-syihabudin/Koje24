"use client";

import { useEffect, useMemo, useState } from "react";
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
  count: number;
};

export default function FinanceChart() {
  const [data, setData] = useState<ChartItem[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/finance-chart", { cache: "no-store" })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
      });
  }, []);

  // total nominal
  const totalValue = useMemo(
    () => data.reduce((sum, d) => sum + d.value, 0),
    [data]
  );

  // data yang tampil (legend bisa di klik)
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

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      {/* HEADER */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-900">
          Perbandingan Metode Pembayaran
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Total: Rp {totalValue.toLocaleString("id-ID")}
        </p>
      </div>

      {data.length === 0 ? (
        <div className="h-60 flex items-center justify-center text-xs text-gray-400">
          Belum ada data
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 items-center">
          {/* CHART */}
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visibleData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
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
                  formatter={(v: number) =>
                    `Rp ${v.toLocaleString("id-ID")}`
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* LEGEND DETAIL */}
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
                    ${
                      isHidden
                        ? "opacity-40 bg-gray-50"
                        : "hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            COLORS[i % COLORS.length],
                        }}
                      />
                      <p className="text-sm font-medium text-gray-800">
                        {item.name}
                      </p>
                    </div>

                    <p className="text-sm font-semibold">
                      {percent}%
                    </p>
                  </div>

                  <div className="mt-1 flex justify-between text-xs text-gray-500">
                    <span>
                      {item.count} transaksi
                    </span>
                    <span>
                      Rp {item.value.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              );
            })}

            <p className="text-[11px] text-gray-400 mt-2">
              Klik legend untuk menyembunyikan / menampilkan data
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
