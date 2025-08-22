"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from "recharts";
import { standardizeConcept } from "@/lib/conceptMapping";

export default function ConceptChart({ data }: { data: any[] }) {
  const conceptCount: Record<string, number> = {};
  
  data.forEach((row) => {
    row.concepts_used?.forEach((c: string) => {
      const standardized = standardizeConcept(c);
      if (standardized.length > 1) {
        conceptCount[standardized] = (conceptCount[standardized] || 0) + 1;
      }
    });
  });
  
  // 進一步合併相似概念
  const mergedConcepts: Record<string, number> = {};
  Object.entries(conceptCount).forEach(([concept, count]) => {
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
  
  // 只顯示前5個最常用概念
  const chartData = Object.entries(mergedConcepts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-indigo-700 flex items-center gap-2">
        <span>常用數學概念</span>
        <span className="text-xs bg-indigo-100 text-indigo-600 rounded px-2 py-0.5">TOP {Math.min(chartData.length, 5)}</span>
      </h2>
      {chartData.length === 0 ? (
        <div className="text-gray-400 text-center py-12">暫無數據</div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              fontSize={12} 
              tick={{ fill: '#6366f1' }} 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis allowDecimals={false} fontSize={14} tick={{ fill: '#6366f1' }} />
            <Tooltip wrapperClassName="!rounded-xl !shadow-lg" />
            <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]}>
              <LabelList dataKey="value" position="top" fill="#4f46e5" fontWeight={700} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

