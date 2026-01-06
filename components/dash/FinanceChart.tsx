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
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/finance-chart", { cache: "no-store" })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
      });
  }, []);

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-gray-900 mb-4">
        Perbandingan Metode Pembayaran
      </p>

      {data.length === 0 ? (
        <div className="h-60 flex items-center justify-center text-xs text-gray-400">
          Belum ada data
        </div>
      ) : (
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `Rp ${v.toLocaleString("id-ID")}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
