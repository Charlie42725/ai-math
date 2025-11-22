"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { standardizeConcept } from "@/lib/conceptMapping";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
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

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <span className="text-3xl">🎮</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">學習分析儀表板</h3>
          <p className="text-gray-600 mb-2">開始對話後即可解鎖學習進度</p>
          <p className="text-gray-500 text-sm">在這裡查看你的數學學習歷程與任務</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-indigo-100 overflow-hidden">
      {/* 簡化頭部 */}
      <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between gap-4">
          {/* 左側：頭像和標題 */}
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-white shadow overflow-hidden border-2 border-white">
                <Image
                  src="/bs/cute.png"
                  alt="Math Learning Assistant"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 shadow border-2 border-white flex items-center justify-center">
                <span className="text-white text-xs font-bold">{level}</span>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="px-2 py-0.5 rounded bg-white/60 border border-indigo-200">等級 {level}</span>
                <span className="px-2 py-0.5 rounded bg-white/60 border border-purple-200">{stabilityPercentage}% 完成度</span>
              </div>
            </div>
          </div>

          {/* 右側：總分析次數和活躍狀態 */}
          <div className="flex items-center gap-3 text-xs">
            <div className="text-center">
              <div className="text-indigo-600 font-bold">總分析次數</div>
              <div className="text-2xl font-black text-gray-900">{data.length}</div>
            </div>
            <div className="text-center">
              <div className="text-green-600 font-bold">活躍狀態</div>
              <div className="flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-sm font-bold text-gray-900">線上中</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HP 血量條 */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">💪</span>
            <span className="text-gray-900 font-bold text-sm">基礎穩定度</span>
          </div>
          <span className="text-lg font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {stabilityPercentage}/100
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getHPColor(stabilityPercentage)} transition-all duration-700 relative flex items-center justify-end pr-2`}
            style={{ width: `${stabilityPercentage}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            <span className="relative text-white text-xs font-bold drop-shadow-lg">
              {stabilityPercentage > 10 && `${stabilityPercentage}%`}
            </span>
          </div>
        </div>
      </div>

      {/* 標籤切換 */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 md:px-6 py-4 border-b-2 border-indigo-100 overflow-x-auto">
        <div className="flex gap-2 md:gap-3 min-w-max">
          {[
            { id: 'overview', label: '總覽', icon: '📊' },
            { id: 'trends', label: '學習趨勢', icon: '📈' },
            { id: 'tasks', label: '升級任務', icon: '✅' },
            { id: 'badges', label: '成就徽章', icon: '🏆' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`group px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-sm md:text-base font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105 border-2 border-white'
                  : 'bg-white/60 text-gray-700 hover:bg-white hover:text-indigo-600 hover:scale-105 border-2 border-transparent hover:border-indigo-200 shadow-sm'
              }`}
            >
              <span className={`text-lg transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 md:p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 學習進度條 */}
            <div>
              <h3 className="text-lg md:text-xl font-black text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-2xl">📈</span>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">學習進度條</span>
              </h3>
              <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl p-4 md:p-6 space-y-5 border-2 border-indigo-100 shadow-lg">
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
            <div>
              <h3 className="text-lg md:text-xl font-black text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">你的強項領域</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {strongestConcepts.map(([concept, count], index) => (
                  <div
                    key={concept}
                    className="group relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 md:p-5 border-2 border-green-200 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-green-800 font-bold text-base md:text-lg truncate">{concept}</div>
                        <div className="text-green-600 text-sm md:text-base font-semibold mt-1">{count} 次使用</div>
                      </div>
                      <div className="text-3xl md:text-4xl flex-shrink-0 ml-3 group-hover:scale-110 transition-transform duration-300">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 弱點警告 */}
            {weaknessConcepts.length > 0 && (
              <div>
                <h3 className="text-lg md:text-xl font-black text-gray-900 mb-4 flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">需要加強的概念</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                  {weaknessConcepts.map(([concept, count]) => (
                    <div
                      key={concept}
                      className="group relative bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-4 md:p-5 border-2 border-orange-200 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-orange-800 font-bold text-base md:text-lg truncate">{concept}</div>
                          <div className="text-orange-600 text-sm md:text-base font-semibold mt-1">{count} 次需加強</div>
                        </div>
                        <span className="text-3xl md:text-4xl flex-shrink-0 ml-3 group-hover:scale-110 transition-transform duration-300 animate-pulse">⚠️</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6 md:space-y-8">
            {/* 概念掌握度對比 */}
            <div>
              <h3 className="text-lg md:text-xl font-black text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">概念掌握度分析</span>
              </h3>
              <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl p-4 md:p-6 border-2 border-indigo-100 shadow-lg">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                      formatter={(value: any, name: string) => [value, name === '正確' ? '正確次數' : '錯誤次數']}
                    />
                    <Legend />
                    <Bar dataKey="正確" fill="#10b981" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="錯誤" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 text-xs md:text-sm text-gray-600 text-center">
                  💡 綠色代表正確次數，橙色代表錯誤次數
                </div>
              </div>
            </div>

            {/* 學習進度趨勢 */}
            {trendData.length > 0 && (
              <div>
                <h3 className="text-lg md:text-xl font-black text-gray-900 mb-4 flex items-center gap-3">
                  <span className="text-2xl">📈</span>
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">近期學習趨勢</span>
                </h3>
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-4 md:p-6 border-2 border-blue-100 shadow-lg">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="session"
                        tick={{ fill: '#64748b', fontSize: 12 }}
                      />
                      <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="accuracy"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        name="準確率 (%)"
                        dot={{ fill: '#3b82f6', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 text-xs md:text-sm text-gray-600 text-center">
                    💡 折線圖顯示最近10次學習的準確率趨勢
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div>
            <h3 className="text-lg md:text-xl font-black text-gray-900 mb-5 md:mb-6 flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">今日升級任務</span>
            </h3>
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-3xl md:text-4xl mb-4">🎉</div>
                <div className="text-gray-600">目前沒有新任務</div>
                <div className="text-gray-500 text-sm mt-2">繼續學習來解鎖更多挑戰！</div>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {tasks.map((task, index) => (
                  <div key={task.id} className="bg-slate-50 rounded-lg p-3 md:p-4 border border-slate-200 hover:bg-slate-100 transition-all duration-200">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-base md:text-lg">{task.type}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-800 font-semibold text-sm md:text-base">{task.text}</div>
                        <div className="text-gray-600 text-xs md:text-sm mt-1">任務 {index + 1}</div>
                      </div>
                      <button
                        onClick={() => handleTaskStart(task)}
                        className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-green-600 text-white text-sm md:text-base font-semibold hover:bg-green-700 transition-all duration-200 shadow-sm flex-shrink-0"
                      >
                        開始
                      </button>
                    </div>
                  </div>
                ))}
                <div className="text-center mt-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200">
                    <span>🔥</span>
                    <span className="text-gray-700 font-semibold text-sm md:text-base">完成任務獲得經驗值！</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'badges' && (
          <div>
            <h3 className="text-lg md:text-xl font-black text-gray-900 mb-5 md:mb-6 flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">成就徽章收集</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {badges.map((badge, index) => (
                <LearningBadge key={index} {...badge} />
              ))}
            </div>
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-50 border border-yellow-200">
                <span>🎖️</span>
                <span className="text-yellow-700 font-semibold text-sm md:text-base">
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
