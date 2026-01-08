"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import GameDashboard from "./GameDashboard";
import TestStatsCard from "./TestStatsCard";
import LearningInsightsCard from "./LearningInsightsCard";

type Analysis = {
  id: string;
  user_id: string;
  concepts_used: string[];
  unstable_concepts: string[];
  thinking_style: string | null;
  expression: string | null;
  ai_feedback: string[];
  analyzed_at: string;
};

type TabType = 'overview' | 'test' | 'chat' | 'insights';

export default function AnalyzeResults({ userId }: { userId: string }) {
  const router = useRouter();
  const [data, setData] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

  // 取得分析結果
  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analyze-results`);
      const json = await res.json();
      console.log('分析結果 API 回傳:', json);
      setData(json.data || []);
    } catch (e) {
      setError("讀取分析結果失敗");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalysis();
    // eslint-disable-next-line
  }, [userId]);

  // 觸發分析
  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze-results/analyze", {
        method: "POST",
      });

      const contentType = res.headers.get("content-type");
      console.log('回應狀態:', res.status, res.statusText);
      console.log('回應類型:', contentType);

      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error('非 JSON 回應:', text);
        throw new Error(`伺服器錯誤: ${text.substring(0, 100)}`);
      }

      const json = await res.json();
      console.log('分析 API 回應:', json);

      if (!json.success) {
        throw new Error(json.error || "分析失敗");
      }

      await fetchAnalysis();
    } catch (e: any) {
      console.error('分析失敗:', e);
      setError(e.message || "分析失敗");
    }
    setAnalyzing(false);
  };

  const tabs = [
    { id: 'overview', label: '綜合概覽', icon: '🎯', gradient: 'from-indigo-500 to-purple-500' },
    { id: 'test', label: '測驗報表', icon: '📊', gradient: 'from-amber-500 to-orange-500' },
    { id: 'chat', label: '對話學習', icon: '💬', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'insights', label: '學習洞察', icon: '💡', gradient: 'from-purple-500 to-pink-500' }
  ];

  const menuItems = [
    { label: '首頁', icon: '🏠', path: '/', gradient: 'from-blue-500 to-cyan-500' },
    { label: 'AI 對話', icon: '💬', path: '/chat', gradient: 'from-green-500 to-emerald-500' },
    { label: '開始測驗', icon: '📝', path: '/test', gradient: 'from-amber-500 to-orange-500' },
    { label: '測驗歷史', icon: '📊', path: '/test-history', gradient: 'from-purple-500 to-pink-500' },
  ];

  const handleNavigate = (path: string) => {
    setMenuOpen(false);
    router.push(path);
  };

  const handleMenuToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!menuOpen) {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 頂部標題區 */}
      <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        {/* 裝飾性背景 */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-300 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-300 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* 裝飾星星 */}
        <div className="absolute top-4 right-8 text-yellow-300 animate-bounce text-3xl">⭐</div>
        <div className="absolute top-8 left-8 text-yellow-200 animate-pulse text-2xl">✨</div>
        <div className="absolute bottom-4 right-20 text-pink-300 animate-bounce text-xl" style={{ animationDelay: '0.5s' }}>💫</div>

        {/* 內容 */}
        <div className="relative p-6 border-b-4 border-yellow-400">
          {/* 標題和標籤區 - 改為並排 */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              {/* 主角圖片 */}
              <div className="relative flex-shrink-0 animate-bounce" style={{ animationDuration: '2s' }}>
                <div className="w-16 h-16 rounded-2xl bg-white shadow-2xl overflow-hidden border-4 border-yellow-300 ring-4 ring-white/50">
                  <Image
                    src="/bs/cute.png"
                    alt="AI Math Assistant"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-400 rounded-full shadow-xl border-3 border-white flex items-center justify-center">
                  <span className="text-white text-sm font-black">✓</span>
                </div>
                {/* 光環效果 */}
                <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/40 to-pink-400/40 rounded-full blur-md animate-pulse"></div>
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white drop-shadow-2xl mb-2">
                  AI 學習分析報表
                </h1>
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border-2 border-yellow-300 font-black text-indigo-600 shadow-lg">
                    總分析 {data.length} 次
                  </span>
                  <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border-2 border-green-300 font-black text-green-600 shadow-lg">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    線上中
                  </span>
                </div>
              </div>
            </div>

            {/* 標籤切換區 - 移到右邊 */}
            <div className="flex items-center gap-3">
              {/* 標籤按鈕 */}
              <div className="flex gap-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`group relative px-4 py-3 rounded-xl text-sm font-black transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r ${tab.gradient} text-white shadow-xl scale-105 border-3 border-white`
                        : 'bg-white/80 text-gray-700 hover:bg-white hover:scale-105 border-2 border-white/50 hover:border-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    <span className={`text-2xl transition-transform duration-300 ${activeTab === tab.id ? 'scale-110 animate-bounce' : 'group-hover:scale-110'}`}>
                      {tab.icon}
                    </span>
                    <span className="hidden lg:inline">{tab.label}</span>
                    {activeTab === tab.id && (
                      <>
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></span>
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></span>
                      </>
                    )}
                  </button>
                ))}
              </div>

              {/* 開始分析按鈕 */}
              <button
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 hover:from-yellow-500 hover:via-orange-500 hover:to-red-500 text-white font-black text-sm shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 border-3 border-white"
                onClick={handleAnalyze}
                disabled={analyzing || loading}
              >
                {analyzing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>分析中</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>開始分析</span>
                  </div>
                )}
              </button>

              {/* 功能選單 */}
              <div>
                <button
                  onClick={handleMenuToggle}
                  className="px-4 py-3 rounded-xl bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-indigo-600 font-black text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-3 border-white/50 hover:border-indigo-300"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl">☰</span>
                    <span className="hidden md:inline">選單</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* 狀態指示器 */}
          {loading && (
            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-blue-500/90 backdrop-blur border-3 border-white text-white shadow-xl">
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span className="text-base font-black">載入分析結果中...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-red-500/90 backdrop-blur border-3 border-white text-white shadow-xl">
              <span className="text-2xl">⚠️</span>
              <span className="text-base font-black">{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* 下拉選單 - 移到外面避免被裁切 */}
      {menuOpen && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          ></div>

          {/* 選單內容 */}
          <div
            className="fixed w-64 bg-white rounded-2xl shadow-2xl border-4 border-indigo-200 overflow-hidden z-50 animate-fadeIn"
            style={{
              top: `${menuPosition.top}px`,
              right: `${menuPosition.right}px`
            }}
          >
            {/* 選單標題 */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-4 border-b-3 border-white">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🚀</span>
                <div>
                  <h3 className="text-white font-black text-lg">快速導航</h3>
                  <p className="text-white/80 text-xs font-semibold">前往其他功能</p>
                </div>
              </div>
            </div>

            {/* 選單項目 */}
            <div className="p-3 space-y-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigate(item.path)}
                  className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r ${item.gradient} hover:shadow-lg transform hover:scale-105 transition-all duration-300 border-2 border-white hover:border-white/80`}
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <span className="text-white font-black text-base flex-1 text-left">
                    {item.label}
                  </span>
                  <svg className="w-5 h-5 text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>

            {/* 底部裝飾 */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-3 border-t-2 border-indigo-100">
              <p className="text-center text-xs font-bold text-gray-600">
                ✨ 選擇功能開始學習
              </p>
            </div>
          </div>
        </>
      )}

      {/* 內容區域 */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-gradient-to-br from-slate-50 to-indigo-50/30">
        <div className="max-w-7xl mx-auto">
          {/* 綜合概覽 */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-black mb-4">
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    學習成果總覽
                  </span>
                </h2>
                <p className="text-lg text-gray-600 font-semibold">查看你的整體學習狀況和進步軌跡</p>
              </div>

              {/* 快速統計卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group relative bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-3xl p-8 border-4 border-indigo-300 shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-300/50 to-purple-400/50 rounded-full blur-2xl"></div>
                  <div className="relative text-center">
                    <div className="text-6xl mb-4 animate-bounce">📚</div>
                    <div className="text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      {data.length}
                    </div>
                    <div className="text-lg font-bold text-gray-700">對話分析總數</div>
                  </div>
                </div>

                <div className="group relative bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 rounded-3xl p-8 border-4 border-amber-300 shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-300/50 to-orange-400/50 rounded-full blur-2xl"></div>
                  <div className="relative text-center">
                    <div className="text-6xl mb-4 animate-bounce" style={{ animationDelay: '0.2s' }}>🎯</div>
                    <div className="text-5xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                      查看
                    </div>
                    <div className="text-lg font-bold text-gray-700">測驗完成率</div>
                  </div>
                </div>

                <div className="group relative bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 rounded-3xl p-8 border-4 border-green-300 shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-300/50 to-emerald-400/50 rounded-full blur-2xl"></div>
                  <div className="relative text-center">
                    <div className="text-6xl mb-4 animate-bounce" style={{ animationDelay: '0.4s' }}>⭐</div>
                    <div className="text-5xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                      持續
                    </div>
                    <div className="text-lg font-bold text-gray-700">學習進步中</div>
                  </div>
                </div>
              </div>

              {/* 綜合洞察卡片 */}
              <LearningInsightsCard userId={userId} />
            </div>
          )}

          {/* 測驗報表 */}
          {activeTab === 'test' && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-black mb-4">
                  <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    測驗成績分析
                  </span>
                </h2>
                <p className="text-lg text-gray-600 font-semibold">追蹤你的測驗表現和進步趨勢</p>
              </div>
              <TestStatsCard userId={userId} />
            </div>
          )}

          {/* 對話學習 */}
          {activeTab === 'chat' && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-black mb-4">
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    對話學習歷程
                  </span>
                </h2>
                <p className="text-lg text-gray-600 font-semibold">查看你與 AI 的學習互動記錄</p>
              </div>
              <GameDashboard data={data} />
            </div>
          )}

          {/* 學習洞察 */}
          {activeTab === 'insights' && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-black mb-4">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    AI 學習建議
                  </span>
                </h2>
                <p className="text-lg text-gray-600 font-semibold">獲取個人化的學習改進建議</p>
              </div>
              <LearningInsightsCard userId={userId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
