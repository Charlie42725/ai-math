"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { standardizeConcept } from "@/lib/conceptMapping";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, Cell } from "recharts";
import ProgressBar from "./ProgressBar";
import LearningBadge from "./LearningBadge";

export default function GameDashboard({ data }: { data: any[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'tasks' | 'badges'>('overview');

  // 處理概念數據
  const conceptCount: Record<string, number> = {};
  const unstableCount: Record<string, number> = {};

  data.forEach((row) => {
    row.concepts_used?.forEach((c: string) => {
      const standardized = standardizeConcept(c);
      if (standardized.length > 1) {
        conceptCount[standardized] = (conceptCount[standardized] || 0) + 1;
      }
    });

    row.unstable_concepts?.forEach((c: string) => {
      const standardized = standardizeConcept(c);
      if (standardized.length > 1) {
        unstableCount[standardized] = (unstableCount[standardized] || 0) + 1;
      }
    });
  });

  // 合併相似概念
  const mergeConceptData = (countData: Record<string, number>) => {
    const merged: Record<string, number> = {};
    Object.entries(countData).forEach(([concept, count]) => {
      if (concept.includes('立體圖形') || concept.includes('幾何') ||
          concept.includes('三角形') || concept.includes('平行') ||
          concept.includes('圓形') || concept.includes('相似')) {
        const mainCategory = concept.includes('立體') ? '立體圖形' : '幾何圖形';
        merged[mainCategory] = (merged[mainCategory] || 0) + count;
      } else {
        merged[concept] = (merged[concept] || 0) + count;
      }
    });
    return merged;
  };

  const mergedConcepts = mergeConceptData(conceptCount);
  const mergedUnstable = mergeConceptData(unstableCount);

  // 計算基礎穩定度（HP）
  const totalConcepts = Object.values(mergedConcepts).reduce((a, b) => a + b, 0);
  const totalUnstable = Object.values(mergedUnstable).reduce((a, b) => a + b, 0);
  const stabilityPercentage = totalConcepts > 0 ? Math.round(((totalConcepts - totalUnstable) / totalConcepts) * 100) : 0;

  // 獲取最強概念
  const strongestConcepts = Object.entries(mergedConcepts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // 獲取弱點警告
  const weaknessConcepts = Object.entries(mergedUnstable)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  // 準備長條圖數據 - 概念掌握度對比
  const barChartData = Object.keys(mergedConcepts).map(concept => ({
    name: concept.length > 8 ? concept.slice(0, 8) + '...' : concept,
    fullName: concept,
    正確: (mergedConcepts[concept] || 0) - (mergedUnstable[concept] || 0),
    錯誤: mergedUnstable[concept] || 0,
    總計: mergedConcepts[concept] || 0
  })).sort((a, b) => b.總計 - a.總計).slice(0, 8);

  // 準備趨勢線數據 - 學習進度趨勢
  const trendData = data.slice(-10).map((row, index) => ({
    session: `第${data.length - 9 + index}次`,
    conceptsUsed: row.concepts_used?.length || 0,
    unstableConcepts: row.unstable_concepts?.length || 0,
    accuracy: row.concepts_used?.length > 0
      ? Math.round(((row.concepts_used.length - (row.unstable_concepts?.length || 0)) / row.concepts_used.length) * 100)
      : 0
  }));

  // AI 建議轉任務
  const allFeedbacks = data.flatMap(row =>
    row.ai_feedback?.map((f: string) => ({ id: row.id, text: f })) ?? []
  );

  const uniqueFeedbacks = allFeedbacks.filter((feedback, index, arr) =>
    index === arr.findIndex(f =>
      f.text.slice(0, 20) === feedback.text.slice(0, 20)
    )
  ).slice(0, 5);

  // 將建議轉換為任務
  const convertToTasks = (feedbacks: any[]) => {
    return feedbacks.map((feedback, index) => {
      let taskText = feedback.text;
      let taskType = '📚';
      let actionLink = '/test'; // 默認跳轉到測驗頁

      if (taskText.includes('練習') || taskText.includes('題目')) {
        taskType = '✏️';
        taskText = taskText.replace(/建議|可以|應該/g, '').trim();
        if (!taskText.includes('題')) taskText += ' 3題練習';
        actionLink = '/test';
      } else if (taskText.includes('概念') || taskText.includes('理解')) {
        taskType = '🎯';
        taskText = taskText.replace(/建議|可以|應該/g, '').trim();
        actionLink = '/chat';
      } else if (taskText.includes('影片') || taskText.includes('觀看')) {
        taskType = '📺';
        taskText = taskText.replace(/建議|可以|應該/g, '').trim();
        if (!taskText.includes('分鐘')) taskText += ' 5分鐘';
        actionLink = '/chat';
      }

      return {
        id: index,
        type: taskType,
        text: taskText,
        actionLink,
        completed: false
      };
    });
  };

  const tasks = convertToTasks(uniqueFeedbacks);

  const getHPColor = (percentage: number) => {
    if (percentage >= 80) return 'from-green-400 to-green-600';
    if (percentage >= 60) return 'from-yellow-400 to-yellow-600';
    if (percentage >= 40) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-600';
  };

  const getLevel = (percentage: number) => {
    if (percentage >= 90) return { level: 'S', title: '數學大師' };
    if (percentage >= 80) return { level: 'A', title: '數學高手' };
    if (percentage >= 70) return { level: 'B', title: '數學達人' };
    if (percentage >= 60) return { level: 'C', title: '數學學徒' };
    return { level: 'D', title: '數學新手' };
  };

  const { level, title } = getLevel(stabilityPercentage);

  // 計算徽章
  const badges = [
    {
      title: "初學者",
      description: "開始學習數學",
      icon: "🌱",
      earned: data.length > 0,
      rarity: "common" as const
    },
    {
      title: "練習生",
      description: "完成10次對話",
      icon: "📚",
      earned: data.length >= 10,
      rarity: "common" as const
    },
    {
      title: "數學愛好者",
      description: "掌握5個數學概念",
      icon: "🎯",
      earned: strongestConcepts.length >= 5,
      rarity: "rare" as const
    },
    {
      title: "概念大師",
      description: "穩定度達80%",
      icon: "🏆",
      earned: stabilityPercentage >= 80,
      rarity: "epic" as const
    },
    {
      title: "數學天才",
      description: "穩定度達95%",
      icon: "👑",
      earned: stabilityPercentage >= 95,
      rarity: "legendary" as const
    }
  ];

  const handleTaskStart = (task: any) => {
    router.push(task.actionLink);
  };

  // 彩色柱狀圖顏色
  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6', '#f97316'];

  if (data.length === 0) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-8 border-2 border-indigo-200">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center mb-6 animate-bounce">
              <span className="text-5xl">🎮</span>
            </div>
            <div className="absolute -top-2 -right-2 text-yellow-400 animate-pulse text-3xl">✨</div>
          </div>
          <h3 className="text-2xl font-black text-gray-800 mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            學習分析儀表板
          </h3>
          <p className="text-gray-700 mb-2 font-semibold">開始對話後即可解鎖學習進度</p>
          <p className="text-gray-600 text-sm">在這裡查看你的數學學習歷程與任務 🚀</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-indigo-50/30 rounded-2xl shadow-2xl border-2 border-indigo-200 overflow-hidden relative">
      {/* 裝飾性背景 */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-300 to-pink-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-300 to-purple-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* 頭部 */}
      <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 border-b-4 border-yellow-400 shadow-lg overflow-hidden">
        {/* 裝飾星星 */}
        <div className="absolute top-3 right-3 text-yellow-300 animate-bounce text-3xl">⭐</div>
        <div className="absolute top-6 left-6 text-yellow-200 animate-pulse text-2xl">✨</div>
        <div className="absolute bottom-3 right-20 text-pink-300 animate-bounce text-xl" style={{ animationDelay: '0.5s' }}>💫</div>

        <div className="flex items-center justify-between gap-4 relative z-10">
          {/* 左側：頭像和標題 */}
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0 animate-bounce" style={{ animationDuration: '2s' }}>
              <div className="w-20 h-20 rounded-2xl bg-white shadow-2xl overflow-hidden border-4 border-yellow-300 ring-4 ring-white/50">
                <Image
                  src="/bs/cute.png"
                  alt="Math Learning Assistant"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500 shadow-xl border-4 border-white flex items-center justify-center animate-pulse">
                <span className="text-white text-lg font-black drop-shadow-lg">{level}</span>
              </div>
              {/* 光環效果 */}
              <div className="absolute -inset-3 bg-gradient-to-r from-yellow-400/40 to-pink-400/40 rounded-full blur-lg animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white drop-shadow-2xl mb-2">{title}</h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-sm border-2 border-yellow-300 font-black text-indigo-600 shadow-lg transform hover:scale-105 transition-transform">
                  等級 {level}
                </span>
                <span className="px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-sm border-2 border-pink-300 font-black text-purple-600 shadow-lg transform hover:scale-105 transition-transform">
                  {stabilityPercentage}% 完成
                </span>
              </div>
            </div>
          </div>

          {/* 右側:統計數據 */}
          <div className="flex items-center gap-4">
            <div className="text-center bg-white/25 backdrop-blur-md rounded-2xl px-6 py-4 border-2 border-white/50 shadow-2xl transform hover:scale-105 transition-transform">
              <div className="text-white/95 font-bold text-sm mb-1">總分析次數</div>
              <div className="text-5xl font-black text-white drop-shadow-2xl">{data.length}</div>
            </div>
            <div className="text-center bg-white/25 backdrop-blur-md rounded-2xl px-6 py-4 border-2 border-white/50 shadow-2xl transform hover:scale-105 transition-transform">
              <div className="text-white/95 font-bold text-sm mb-2">活躍狀態</div>
              <div className="flex items-center justify-center gap-2">
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-green-400 shadow-lg"></span>
                </span>
                <span className="text-xl font-black text-white drop-shadow-lg">線上中</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HP 血量條 */}
      <div className="relative bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border-b-2 border-indigo-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-pulse">💪</span>
            <span className="text-gray-900 font-black text-lg">基礎穩定度 HP</span>
          </div>
          <span className="text-3xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {stabilityPercentage}/100
          </span>
        </div>
        <div className="w-full h-8 rounded-full bg-gray-200 overflow-hidden shadow-inner border-2 border-gray-300">
          <div
            className={`h-full bg-gradient-to-r ${getHPColor(stabilityPercentage)} transition-all duration-1000 ease-out relative flex items-center justify-end pr-4 shadow-lg`}
            style={{ width: `${stabilityPercentage}%` }}
          >
            <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
            <span className="relative text-white text-lg font-black drop-shadow-2xl">
              {stabilityPercentage > 10 && `${stabilityPercentage}%`}
            </span>
          </div>
        </div>
        {/* HP提示 */}
        <div className="mt-3 text-center">
          <span className="text-xs font-semibold text-gray-600 bg-white px-3 py-1 rounded-full shadow-sm">
            {stabilityPercentage >= 80 ? '🎉 太棒了！繼續保持！' : stabilityPercentage >= 60 ? '💪 做得不錯！加油！' : '📚 繼續努力，你可以的！'}
          </span>
        </div>
      </div>

      {/* 標籤切換 */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 px-4 md:px-6 py-5 border-b-2 border-indigo-100 overflow-x-auto">
        <div className="flex gap-3 min-w-max">
          {[
            { id: 'overview', label: '總覽', icon: '📊', gradient: 'from-blue-500 to-cyan-500' },
            { id: 'trends', label: '學習趨勢', icon: '📈', gradient: 'from-purple-500 to-pink-500' },
            { id: 'tasks', label: '升級任務', icon: '✅', gradient: 'from-green-500 to-emerald-500' },
            { id: 'badges', label: '成就徽章', icon: '🏆', gradient: 'from-yellow-500 to-orange-500' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`group relative px-6 md:px-8 py-3 md:py-4 rounded-2xl text-sm md:text-base font-black transition-all duration-300 whitespace-nowrap flex items-center gap-3 ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-2xl scale-110 border-4 border-white ring-2 ring-offset-2 ring-offset-transparent`
                  : 'bg-white/80 text-gray-700 hover:bg-white hover:text-indigo-600 hover:scale-105 border-2 border-gray-200 hover:border-indigo-300 shadow-md hover:shadow-lg'
              }`}
            >
              <span className={`text-2xl transition-transform duration-300 ${activeTab === tab.id ? 'scale-125 animate-bounce' : 'group-hover:scale-110'}`}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 md:p-8 relative">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 學習進度條 */}
            <div className="transform hover:scale-[1.02] transition-transform duration-300">
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-5 flex items-center gap-3">
                <span className="text-4xl animate-bounce">📈</span>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">學習進度條</span>
              </h3>
              <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-6 md:p-8 space-y-6 border-4 border-indigo-200 shadow-2xl">
                <ProgressBar
                  value={strongestConcepts.length}
                  max={10}
                  label="掌握概念數量"
                  color="green"
                />
                <ProgressBar
                  value={Math.min(100, data.length * 10)}
                  max={100}
                  label="學習活躍度"
                  color="blue"
                />
                <ProgressBar
                  value={stabilityPercentage}
                  max={100}
                  label="基礎穩定度"
                  color={stabilityPercentage >= 80 ? 'green' : stabilityPercentage >= 60 ? 'orange' : 'red'}
                />
              </div>
            </div>

            {/* 強項展示 */}
            <div className="transform hover:scale-[1.01] transition-transform duration-300">
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-5 flex items-center gap-3">
                <span className="text-4xl">🏆</span>
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">你的強項領域</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {strongestConcepts.map(([concept, count], index) => (
                  <div
                    key={concept}
                    className="group relative bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 rounded-2xl p-6 border-4 border-green-300 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform"
                  >
                    {/* 排名徽章 */}
                    <div className="absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                      <span className="text-white font-black text-lg">#{index + 1}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0 mr-3">
                        <div className="text-green-900 font-black text-lg md:text-xl truncate mb-1">{concept}</div>
                        <div className="text-green-700 text-base md:text-lg font-bold">使用 {count} 次</div>
                      </div>
                      <div className="text-5xl md:text-6xl flex-shrink-0 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                      </div>
                    </div>
                    {/* 閃光效果 */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-yellow-200/0 via-yellow-200/30 to-yellow-200/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* 弱點警告 */}
            {weaknessConcepts.length > 0 && (
              <div className="transform hover:scale-[1.01] transition-transform duration-300">
                <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-5 flex items-center gap-3">
                  <span className="text-4xl animate-pulse">⚠️</span>
                  <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">需要加強的概念</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {weaknessConcepts.map(([concept, count]) => (
                    <div
                      key={concept}
                      className="group relative bg-gradient-to-br from-orange-100 via-red-50 to-pink-100 rounded-2xl p-6 border-4 border-orange-300 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0 mr-3">
                          <div className="text-orange-900 font-black text-lg md:text-xl truncate mb-1">{concept}</div>
                          <div className="text-orange-700 text-base md:text-lg font-bold">需加強 {count} 次</div>
                        </div>
                        <span className="text-5xl md:text-6xl flex-shrink-0 group-hover:scale-125 transition-transform duration-300 animate-pulse">⚠️</span>
                      </div>
                      {/* 警告閃爍效果 */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-red-200/0 via-red-200/30 to-red-200/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-8">
            {/* 概念掌握度對比 */}
            <div className="transform hover:scale-[1.01] transition-transform duration-300">
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-5 flex items-center gap-3">
                <span className="text-4xl">📊</span>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">概念掌握度分析</span>
              </h3>
              <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-6 md:p-8 border-4 border-indigo-200 shadow-2xl">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={barChartData}>
                    <defs>
                      <linearGradient id="colorCorrect" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#059669" stopOpacity={1}/>
                      </linearGradient>
                      <linearGradient id="colorWrong" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#d97706" stopOpacity={1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="5 5" stroke="#c7d2fe" strokeWidth={2} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#4b5563', fontSize: 14, fontWeight: 'bold' }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis tick={{ fill: '#4b5563', fontSize: 14, fontWeight: 'bold' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '3px solid #818cf8',
                        borderRadius: '16px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                      }}
                      formatter={(value: any, name: string) => [value, name === '正確' ? '✅ 正確次數' : '❌ 錯誤次數']}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '16px', fontWeight: 'bold' }}
                      iconType="circle"
                    />
                    <Bar dataKey="正確" fill="url(#colorCorrect)" radius={[12, 12, 0, 0]} />
                    <Bar dataKey="錯誤" fill="url(#colorWrong)" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-6 text-sm md:text-base text-gray-700 text-center font-semibold bg-white/60 py-3 rounded-xl">
                  💡 綠色代表正確次數，橙色代表錯誤次數
                </div>
              </div>
            </div>

            {/* 學習進度趨勢 */}
            {trendData.length > 0 && (
              <div className="transform hover:scale-[1.01] transition-transform duration-300">
                <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-5 flex items-center gap-3">
                  <span className="text-4xl">📈</span>
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">近期學習趨勢</span>
                </h3>
                <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 rounded-3xl p-6 md:p-8 border-4 border-blue-200 shadow-2xl">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={trendData}>
                      <defs>
                        <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#1d4ed8" stopOpacity={1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="5 5" stroke="#bae6fd" strokeWidth={2} />
                      <XAxis
                        dataKey="session"
                        tick={{ fill: '#4b5563', fontSize: 14, fontWeight: 'bold' }}
                      />
                      <YAxis tick={{ fill: '#4b5563', fontSize: 14, fontWeight: 'bold' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '3px solid #60a5fa',
                          borderRadius: '16px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '16px', fontWeight: 'bold' }}
                        iconType="circle"
                      />
                      <Line
                        type="monotone"
                        dataKey="accuracy"
                        stroke="url(#colorAccuracy)"
                        strokeWidth={4}
                        name="準確率 (%)"
                        dot={{ fill: '#3b82f6', r: 6, strokeWidth: 3, stroke: '#fff' }}
                        activeDot={{ r: 10, strokeWidth: 4, stroke: '#fff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-6 text-sm md:text-base text-gray-700 text-center font-semibold bg-white/60 py-3 rounded-xl">
                    💡 折線圖顯示最近10次學習的準確率趨勢
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-4xl">🎯</span>
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">今日升級任務</span>
            </h3>
            {tasks.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-4 border-green-200 shadow-xl">
                <div className="text-6xl md:text-8xl mb-6 animate-bounce">🎉</div>
                <div className="text-2xl font-black text-gray-800 mb-2">太棒了!</div>
                <div className="text-gray-700 font-semibold">目前沒有新任務</div>
                <div className="text-gray-600 text-sm mt-2">繼續學習來解鎖更多挑戰！🚀</div>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-5 border-3 border-indigo-200 hover:border-indigo-400 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-xl border-4 border-white animate-pulse">
                        <span className="text-3xl">{task.type}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-900 font-black text-base md:text-lg mb-1">{task.text}</div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs md:text-sm font-bold rounded-full">
                            任務 {index + 1}
                          </span>
                          <span className="text-yellow-500 text-sm">⭐ +10 經驗值</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleTaskStart(task)}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-base md:text-lg font-black hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110 flex-shrink-0 border-2 border-white"
                      >
                        開始 🚀
                      </button>
                    </div>
                  </div>
                ))}
                <div className="text-center mt-8">
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 border-4 border-white shadow-xl">
                    <span className="text-2xl">🔥</span>
                    <span className="text-white font-black text-base md:text-lg drop-shadow-lg">完成任務獲得經驗值升級！</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'badges' && (
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-4xl">🏆</span>
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">成就徽章收集</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {badges.map((badge, index) => (
                <div key={index} className="transform hover:scale-110 transition-transform duration-300">
                  <LearningBadge {...badge} />
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-4 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 border-4 border-white shadow-2xl">
                <span className="text-3xl">🎖️</span>
                <span className="text-white font-black text-lg md:text-xl drop-shadow-lg">
                  已獲得 {badges.filter(b => b.earned).length}/{badges.length} 個徽章
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
