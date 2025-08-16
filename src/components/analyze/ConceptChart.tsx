"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from "recharts";

export default function ConceptChart({ data }: { data: any[] }) {
  const conceptCount: Record<string, number> = {};
  data.forEach((row) => {
    row.concepts_used?.forEach((c: string) => {
      conceptCount[c] = (conceptCount[c] || 0) + 1;
    });
  });
  const chartData = Object.entries(conceptCount).map(([name, value]) => ({ name, value }));

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-indigo-700 flex items-center gap-2">
        <span>常用數學概念</span>
        <span className="text-xs bg-indigo-100 text-indigo-600 rounded px-2 py-0.5">TOP {chartData.length}</span>
      </h2>
      {chartData.length === 0 ? (
        <div className="text-gray-400 text-center py-12">暫無數據</div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={14} tick={{ fill: '#6366f1' }} />
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

