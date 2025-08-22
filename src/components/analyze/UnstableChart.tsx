"use client";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { standardizeConcept } from "@/lib/conceptMapping";

export default function UnstableChart({ data }: { data: any[] }) {
  const unstableCount: Record<string, number> = {};
  
  data.forEach((row) => {
    row.unstable_concepts?.forEach((c: string) => {
      const standardized = standardizeConcept(c);
      if (standardized.length > 1) {
        unstableCount[standardized] = (unstableCount[standardized] || 0) + 1;
      }
    });
  });
  
  // 進一步合併相似概念
  const mergedConcepts: Record<string, number> = {};
  Object.entries(unstableCount).forEach(([concept, count]) => {
    // 將相似的幾何概念合併
    if (concept.includes('立體圖形') || concept.includes('幾何') || 
        concept.includes('三角形') || concept.includes('平行') || 
        concept.includes('圓形') || concept.includes('相似')) {
      const mainCategory = concept.includes('立體') ? '生活中的立體圖形' : '幾何圖形';
      mergedConcepts[mainCategory] = (mergedConcepts[mainCategory] || 0) + count;
    } else {
      mergedConcepts[concept] = (mergedConcepts[concept] || 0) + count;
    }
  });
  
  // 只顯示前4個需要加強的概念
  const chartData = Object.entries(mergedConcepts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 4)
    .map(([name, value]) => ({ name, value }));

  const COLORS = ["#f59e0b", "#ef4444", "#10b981", "#6366f1", "#a21caf", "#0ea5e9"];
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-slate-700/50">
      <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
          <span className="text-sm">⚠️</span>
        </div>
        <span>需加強的概念</span>
        <span className="text-xs bg-orange-500/20 text-orange-300 rounded-lg px-3 py-1 border border-orange-500/30">
          TOP {Math.min(chartData.length, 4)}
        </span>
      </h2>
      {chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
            <span className="text-2xl">📈</span>
          </div>
          <p className="text-slate-400 mb-2">暫無數據</p>
          <p className="text-slate-500 text-sm">開始對話後即可看到分析結果</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={110}
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              labelLine={false}
              isAnimationActive={true}
            >
              {chartData.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #475569', 
                borderRadius: '12px',
                color: '#f1f5f9'
              }}
              wrapperClassName="!rounded-xl !shadow-lg"
            />
            <Legend 
              wrapperStyle={{ color: '#cbd5e1' }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
