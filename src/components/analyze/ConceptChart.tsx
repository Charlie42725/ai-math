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
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-slate-700/50">
      <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
          <span className="text-sm">📊</span>
        </div>
        <span>常用數學概念</span>
        <span className="text-xs bg-indigo-500/20 text-indigo-300 rounded-lg px-3 py-1 border border-indigo-500/30">
          TOP {Math.min(chartData.length, 5)}
        </span>
      </h2>
      {chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-slate-400 mb-2">暫無數據</p>
          <p className="text-slate-500 text-sm">開始對話後即可看到分析結果</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 60 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
            <XAxis 
              dataKey="name" 
              fontSize={12} 
              tick={{ fill: '#cbd5e1' }} 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis allowDecimals={false} fontSize={14} tick={{ fill: '#cbd5e1' }} />
            <Tooltip 
              wrapperClassName="!rounded-xl !shadow-lg !bg-slate-800 !border-slate-600" 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #475569', 
                borderRadius: '12px',
                color: '#f1f5f9'
              }}
            />
            <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]}>
              <LabelList dataKey="value" position="top" fill="#a5b4fc" fontWeight={700} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

