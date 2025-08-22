"use client";

export default function FeedbackList({ data }: { data: any[] }) {
  // 扁平化所有建議並去重
  const allFeedbacks = data.flatMap(row => 
    row.ai_feedback?.map((f: string) => ({ id: row.id, text: f })) ?? []
  );
  
  // 去重複的建議（相似內容只保留一個）
  const uniqueFeedbacks = allFeedbacks.filter((feedback, index, arr) => 
    index === arr.findIndex(f => 
      f.text.slice(0, 20) === feedback.text.slice(0, 20) // 前20字相同視為重複
    )
  );
  
  // 只顯示前6個最重要的建議
  const feedbacks = uniqueFeedbacks.slice(0, 6);
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-slate-700/50">
      <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
          <span className="text-sm">💡</span>
        </div>
        <span>AI 的學習建議</span>
        <span className="text-xs bg-green-500/20 text-green-300 rounded-lg px-3 py-1 border border-green-500/30">
          {feedbacks.length} 則
        </span>
      </h2>
      {feedbacks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
            <span className="text-2xl">💡</span>
          </div>
          <p className="text-slate-400 mb-2">暫無建議</p>
          <p className="text-slate-500 text-sm">開始對話後即可看到學習建議</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((f, idx) => (
            <div 
              key={f.id + idx} 
              className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/50 
                         hover:bg-slate-700/50 transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <span className="text-green-400 text-sm">💡</span>
                </div>
                <p className="text-slate-200 leading-relaxed">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
 