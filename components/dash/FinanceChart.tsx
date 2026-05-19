"use client";

import { useMemo, useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Extended color palette
const COLORS = [
  "#0FA3A8", "#F59E0B", "#6366F1", "#10B981",
  "#EF4444", "#8B5CF6", "#EC4899", "#F97316",
  "#06B6D4", "#84CC16"
];

type ChartItem = {
  name: string;
  value: number;
  count?: number;
};

// ========== LOADING SKELETON ==========
function ChartSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-32 mb-4"></div>
      <div className="h-40 bg-gray-100 rounded-xl mb-4"></div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========== AI INSIGHT CARD ==========
function AIInsight({ 
  insight, 
  recommendation,
  severity = 'info' 
}: { 
  insight: string; 
  recommendation?: string;
  severity?: 'warning' | 'info' | 'success';
}) {
  const colors = {
    warning: 'bg-orange-50 border-orange-200 text-orange-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  };
  
  const icons = {
    warning: '⚠️',
    info: '💡',
    success: '✅'
  };

  return (
    <div className={`rounded-xl border p-3 ${colors[severity]}`}>
      <div className="flex items-start gap-2">
        <span className="text-lg">{icons[severity]}</span>
        <div className="flex-1">
          <p className="text-xs font-medium">{insight}</p>
          {recommendation && (
            <p className="text-[11px] opacity-80 mt-1">→ {recommendation}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== MAIN COMPONENT ==========
export default function FinanceChart({ 
  data = [], 
  loading = false,
  previousData = [] // untuk trend analysis
}: { 
  data?: ChartItem[];
  loading?: boolean;
  previousData?: ChartItem[];
}) {
  const [hidden, setHidden] = useState<string[]>([]);
  const [showInsights, setShowInsights] = useState(true);

  // ========== ALL HOOKS DI ATAS (no conditional) ==========
  const totalValue = useMemo(
    () => data.reduce((sum, d) => sum + (Number(d.value) || 0), 0),
    [data]
  );

  const totalCount = useMemo(
    () => data.reduce((sum, d) => sum + (d.count || 0), 0),
    [data]
  );

  const visibleData = useMemo(
    () => data.filter((d) => !hidden.includes(d.name)),
    [data, hidden]
  );

  // AI: Detect anomaly (COD terlalu tinggi)
  const codAnomaly = useMemo(() => {
    const codItem = data.find(d => d.name.toLowerCase().includes('cod'));
    if (!codItem) return null;
    
    const codPercent = (codItem.value / totalValue) * 100;
    return {
      isHigh: codPercent > 60,
      percent: codPercent,
      warning: codPercent > 70 ? 'critical' : codPercent > 60 ? 'high' : 'normal'
    };
  }, [data, totalValue]);

  // AI: Get dominant method
  const dominantMethod = useMemo(() => {
    if (!data.length) return null;
    return data.reduce((max, item) => 
      item.value > max.value ? item : max, data[0]
    );
  }, [data]);

  // AI: Trend analysis (bandingin dengan previous data)
  const trends = useMemo(() => {
    if (!previousData.length || !data.length) return null;
    
    const currentTotal = totalValue;
    const prevTotal = previousData.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
    const percentChange = prevTotal === 0 ? 0 : ((currentTotal - prevTotal) / prevTotal) * 100;
    
    const methodsTrend = data.map(current => {
      const prev = previousData.find(p => p.name === current.name);
      const prevPercent = prev ? (prev.value / prevTotal) * 100 : 0;
      const currentPercent = (current.value / currentTotal) * 100;
      return {
        name: current.name,
        trend: currentPercent - prevPercent,
        isUp: currentPercent > prevPercent
      };
    });
    
    return {
      percentChange,
      isUp: percentChange > 0,
      methodsTrend
    };
  }, [data, previousData, totalValue]);

  // AI: Recommendation generator
  const recommendation = useMemo(() => {
    if (!dominantMethod) return null;
    
    const recommendations = [];
    
    // COD terlalu tinggi
    if (codAnomaly?.isHigh) {
      recommendations.push({
        text: 'Promosikan diskon 5% untuk transfer/QRIS',
        severity: 'warning' as const
      });
    }
    
    // Dominan method insight
    if (dominantMethod.name.toLowerCase().includes('transfer') || 
        dominantMethod.name.toLowerCase().includes('qris')) {
      recommendations.push({
        text: '✅ Metode digital sudah dominan, pertahankan promo',
        severity: 'success' as const
      });
    }
    
    // Trend turun
    if (trends && trends.percentChange < -10) {
      recommendations.push({
        text: '📉 Pendapatan turun signifikan, cek campaign marketing',
        severity: 'warning' as const
      });
    }
    
    return recommendations.length > 0 ? recommendations[0] : null;
  }, [dominantMethod, codAnomaly, trends]);

  function toggleLegend(name: string) {
    setHidden((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name]
    );
  }

  // ========== RENDER CONDITIONS (setelah semua hooks) ==========
  
  // 🔥 1. LOADING STATE (pakai prop loading)
  if (loading) {
    return <ChartSkeleton />;
  }

  // 🔥 2. EMPTY STATE (data kosong)
  if (!data.length || totalValue === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-400">Belum ada data pembayaran</p>
        <p className="text-xs text-gray-300 mt-1">Transaksi akan muncul di sini</p>
      </div>
    );
  }

  // ========== RENDER ==========
  return (
    <div className="space-y-4">
      {/* TITLE & INSIGHT TOGGLE */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Perbandingan Metode Pembayaran
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Total: Rp {totalValue.toLocaleString("id-ID")}
            {totalCount > 0 && ` • ${totalCount.toLocaleString("id-ID")} transaksi`}
          </p>
        </div>
        <button
          onClick={() => setShowInsights(!showInsights)}
          className="text-xs text-[#0FA3A8] hover:underline"
        >
          {showInsights ? 'Hide AI 🤖' : 'Show AI 🤖'}
        </button>
      </div>

      {/* AI INSIGHTS PANEL */}
      {showInsights && (
        <div className="space-y-2">
          {/* Trend arrow */}
          {trends && (
            <div className="flex items-center gap-2 text-xs bg-gray-50 rounded-lg px-3 py-2">
              <span className="font-medium">Trend Pendapatan:</span>
              {trends.isUp ? (
                <span className="text-green-600">📈 +{trends.percentChange.toFixed(1)}%</span>
              ) : (
                <span className="text-red-600">📉 {trends.percentChange.toFixed(1)}%</span>
              )}
              <span className="text-gray-400 text-[10px]">
                vs periode sebelumnya
              </span>
            </div>
          )}

          {/* Dominant method insight */}
          {dominantMethod && (
            <AIInsight
              insight={`Metode dominan: ${dominantMethod.name} (${((dominantMethod.value / totalValue) * 100).toFixed(1)}% dari total)`}
              recommendation={recommendation?.text}
              severity={codAnomaly?.isHigh ? 'warning' : 'info'}
            />
          )}

          {/* COD anomaly warning */}
          {codAnomaly?.isHigh && (
            <AIInsight
              insight={`⚠️ COD mencapai ${codAnomaly.percent.toFixed(1)}% dari total pembayaran`}
              recommendation="Risiko gagal bayar tinggi. Aktifkan reminder otomatis atau promo transfer/QRIS."
              severity="warning"
            />
          )}

          {/* Methods trend detail */}
          {trends?.methodsTrend && trends.methodsTrend.some(t => Math.abs(t.trend) > 5) && (
            <div className="text-[10px] text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              <p className="font-medium mb-1">Perubahan preferensi:</p>
              <div className="flex flex-wrap gap-2">
                {trends.methodsTrend.filter(t => Math.abs(t.trend) > 5).map(t => (
                  <span key={t.name} className="inline-flex items-center gap-1">
                    {t.name}
                    {t.isUp ? (
                      <span className="text-green-600">↑ {t.trend.toFixed(1)}%</span>
                    ) : (
                      <span className="text-red-600">↓ {Math.abs(t.trend).toFixed(1)}%</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* DONUT CHART - Responsive height */}
      <div className="h-40 sm:h-44 md:h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={visibleData}
              dataKey="value"
              nameKey="name"
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={3}
              stroke="white"
              strokeWidth={2}
            >
              {visibleData.map((entry, index) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={COLORS[index % COLORS.length]}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value: number, name: string, props: any) => {
                const percent = ((value / totalValue) * 100).toFixed(1);
                return [
                  `Rp ${value.toLocaleString("id-ID")} (${percent}%)`,
                  props.payload.name
                ];
              }}
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
                padding: '8px 12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              itemStyle={{ padding: '2px 0' }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* LEGEND WITH PERCENTAGE BAR */}
      <div className="space-y-2 mt-2">
        {data.map((item, i) => {
          const percent = totalValue === 0 ? 0 : (item.value / totalValue) * 100;
          const isHidden = hidden.includes(item.name);
          const trend = trends?.methodsTrend?.find(t => t.name === item.name);

          return (
            <div
              key={item.name}
              onClick={() => toggleLegend(item.name)}
              className={`group cursor-pointer transition-all duration-200 ${
                isHidden ? "opacity-40" : "hover:opacity-80"
              }`}
            >
              <div className="flex justify-between items-center text-sm mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full ring-1 ring-white shadow-sm"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-gray-700">{item.name}</span>
                  {item.count && (
                    <span className="text-[10px] text-gray-400">
                      ({item.count} tx)
                    </span>
                  )}
                  {/* Trend arrow mini */}
                  {trend && Math.abs(trend.trend) > 3 && (
                    <span className={`text-[10px] ${trend.isUp ? 'text-green-500' : 'text-red-500'}`}>
                      {trend.isUp ? '↑' : '↓'} {Math.abs(trend.trend).toFixed(0)}%
                    </span>
                  )}
                </div>
                <span className="font-medium text-gray-800">
                  {percent.toFixed(1)}%
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: COLORS[i % COLORS.length],
                    opacity: isHidden ? 0.3 : 1
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* HINT */}
      <p className="text-[10px] text-gray-400 text-center pt-2 border-t">
        💡 Klik legend untuk sembunyikan / tampilkan data • AI Insight aktif
      </p>
    </div>
  );
}
