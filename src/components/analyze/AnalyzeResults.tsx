"use client";
import { useEffect, useState } from "react";

// 分析結果型別
interface AnalyzeResult {
  id: string;
  user_id: string;
  conversation_id: string;
  message_index: number;
  text: string;
  is_attempt: boolean | null;
  unit: string | null;
  grade: string | null;
  question_id: string | null;
  final_answer: string | null;
  confidence: number | null;
  created_at?: string;
}

export default function AnalyzeResults() {
  const [results, setResults] = useState<AnalyzeResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = () => {
    setLoading(true);
    fetch("/api/analyze-results")
      .then(res => res.json())
      .then(data => {
        setResults(data.results || []);
        setLoading(false);
      })
      .catch(err => {
        setError("讀取失敗: " + err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // 觸發分析
  const [analyzing, setAnalyzing] = useState(false);
  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze-results/analyze", { method: "POST" });
      const data = await res.json();
      if (data.error) setError("分析失敗: " + data.error);
      else fetchResults();
    } catch (e: any) {
      setError("分析失敗: " + e.message);
    }
    setAnalyzing(false);
  };

  if (loading) return <div className="p-8 text-lg">載入中...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-2xl font-bold">學生作答分析紀錄</h2>
        <button
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-60"
          onClick={handleAnalyze}
          disabled={analyzing}
        >{analyzing ? "分析中..." : "開始分析"}</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-700 text-sm">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="px-2 py-1 border">#</th>
              <th className="px-2 py-1 border">學生ID</th>
              <th className="px-2 py-1 border">對話ID</th>
              <th className="px-2 py-1 border">訊息</th>
              <th className="px-2 py-1 border">單元</th>
              <th className="px-2 py-1 border">年級</th>
              <th className="px-2 py-1 border">題號</th>
              <th className="px-2 py-1 border">答案</th>
              <th className="px-2 py-1 border">信心度</th>
              <th className="px-2 py-1 border">是否作答</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={r.id || i} className="border-t border-gray-700">
                <td className="px-2 py-1 border text-center">{i + 1}</td>
                <td className="px-2 py-1 border">{r.user_id}</td>
                <td className="px-2 py-1 border">{r.conversation_id}</td>
                <td className="px-2 py-1 border max-w-xs whitespace-pre-line">{r.text}</td>
                <td className="px-2 py-1 border">{r.unit}</td>
                <td className="px-2 py-1 border">{r.grade}</td>
                <td className="px-2 py-1 border">{r.question_id}</td>
                <td className="px-2 py-1 border">{r.final_answer}</td>
                <td className="px-2 py-1 border text-center">{r.confidence !== null ? r.confidence.toFixed(2) : ""}</td>
                <td className="px-2 py-1 border text-center">{r.is_attempt === true ? "✔️" : r.is_attempt === false ? "❌" : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
