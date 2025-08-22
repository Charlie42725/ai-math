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
    <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-orange-700 flex items-center gap-2">
        <span>需加強的概念</span>
        <span className="text-xs bg-orange-100 text-orange-600 rounded px-2 py-0.5">TOP {Math.min(chartData.length, 4)}</span>
      </h2>
      {chartData.length === 0 ? (
        <div className="text-gray-400 text-center py-12">暫無數據</div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={110}
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              isAnimationActive={true}
            >
              {chartData.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip wrapperClassName="!rounded-xl !shadow-lg" />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
