"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { RefreshCw } from "lucide-react";

const MODES = [
  { key: "daily", label: "Harian" },
  { key: "weekly", label: "Mingguan" },
  { key: "monthly", label: "Bulanan" },
];

// Loading Skeleton
function ChartSkeleton() {
  return (
    <div className="h-[260px] animate-pulse">
      <div className="h-full bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#0FA3A8] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-400">Memuat data...</p>
        </div>
      </div>
    </div>
  );
}

// Y-Axis formatter yang lebih baik
function formatYAxis(value: number) {
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}rb`;
  return `Rp ${value}`;
}

export default function SalesChart() {
  const [mode, setMode] = useState("daily");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/dashboard/sales-chart?mode=${mode}`, {
        signal: controller.signal,
      });

      if (!res.ok) throw new Error("HTTP error " + res.status);

      const json = await res.json();

      if (json.success) {
        setData(json.data);
      } else {
        throw new Error(json.message || "Gagal memuat data");
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Fetch aborted");
        return;
      }
      console.error("Failed to fetch sales chart:", err);
      setError(err.message || "Gagal memuat data penjualan");
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  // Calculate total and max for insights
  const totalSales = data.reduce((sum, d) => sum + (d.total || 0), 0);
  const maxSale = Math.max(...data.map(d => d.total || 0), 0);
  const bestDay = data.find(d => d.total === maxSale);

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm h-full flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Grafik Penjualan
          </p>
          {!loading && data.length > 0 && (
            <p className="text-[10px] text-gray-400 mt-0.5">
              Total: Rp {totalSales.toLocaleString("id-ID")}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mode buttons */}
          <div className="flex gap-1">
            {MODES.map((m) => (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                disabled={loading}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
                  mode === m.key
                    ? "bg-[#0FA3A8] text-white border-[#0FA3A8]"
                    : "text-gray-500 hover:bg-gray-100 border-gray-200"
                } disabled:opacity-50`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Refresh button */}
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-1.5 rounded-full hover:bg-gray-100 transition disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* CHART */}
      <div className="flex-1 min-h-[200px]">
        {loading ? (
          <ChartSkeleton />
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center gap-2">
            <p className="text-xs text-red-500">{error}</p>
            <button
              onClick={fetchData}
              className="text-xs text-[#0FA3A8] hover:underline"
            >
              Coba lagi
            </button>
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-gray-400">
            Belum ada data penjualan
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0FA3A8" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0FA3A8" stopOpacity={0.05} />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "#6B7280" }}
                  interval="preserveStartEnd"
                />

                <YAxis
                  width={70}
                  tick={{ fontSize: 10, fill: "#6B7280" }}
                  tickFormatter={formatYAxis}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  formatter={(value: number) => [
                    `Rp ${value.toLocaleString("id-ID")}`,
                    "Penjualan"
                  ]}
                  labelFormatter={(label) => `📅 ${label}`}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "11px",
                    padding: "8px 12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#0FA3A8"
                  strokeWidth={2.5}
                  fill="url(#salesGradient)"
                  dot={{ r: 3, fill: "#0FA3A8", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#0FA3A8", stroke: "white", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Insight footer */}
            {bestDay && maxSale > 0 && (
              <div className="mt-2 pt-2 border-t text-[10px] text-gray-400 flex justify-between">
                <span>📊 Puncak: {bestDay.label}</span>
                <span>💰 Rp {maxSale.toLocaleString("id-ID")}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
