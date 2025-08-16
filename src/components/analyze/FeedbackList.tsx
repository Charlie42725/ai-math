"use client";

export default function FeedbackList({ data }: { data: any[] }) {
  // 扁平化所有建議
  const feedbacks = data.flatMap(row => row.ai_feedback?.map((f: string) => ({ id: row.id, text: f })) ?? []);
  return (
    <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-green-700 flex items-center gap-2">
        <span>AI 的學習建議</span>
        <span className="text-xs bg-green-100 text-green-600 rounded px-2 py-0.5">{feedbacks.length} 則</span>
      </h2>
      {feedbacks.length === 0 ? (
        <div className="text-gray-400 text-center py-12">暫無建議</div>
      ) : (
        <ul className="list-disc pl-6 space-y-2 animate-fadein">
          {feedbacks.slice(0, 8).map((f, idx) => (
            <li key={f.id + idx} className="text-gray-700 leading-relaxed text-base">
              <span className="inline-block align-middle mr-2 text-green-400">💡</span>{f.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
 