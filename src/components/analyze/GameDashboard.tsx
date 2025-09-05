"use client";
import { useState } from "react";
import { standardizeConcept } from "@/lib/conceptMapping";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import ProgressBar from "./ProgressBar";
import LearningBadge from "./LearningBadge";

export default function GameDashboard({ data }: { data: any[] }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'radar' | 'tasks' | 'badges'>('overview');

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
    .slice(0, 3);

  // 獲取弱點警告
  const weaknessConcepts = Object.entries(mergedUnstable)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2);

  // 準備雷達圖數據
  const radarData = Object.keys(mergedConcepts).map(concept => ({
    concept: concept.length > 6 ? concept.slice(0, 6) + '...' : concept,
    fullName: concept,
    mastery: mergedConcepts[concept] || 0,
    weakness: mergedUnstable[concept] || 0,
    score: Math.max(0, (mergedConcepts[concept] || 0) - (mergedUnstable[concept] || 0))
  })).slice(0, 6);

  // AI 建議轉任務
  const allFeedbacks = data.flatMap(row => 
    row.ai_feedback?.map((f: string) => ({ id: row.id, text: f })) ?? []
  );
  
  const uniqueFeedbacks = allFeedbacks.filter((feedback, index, arr) => 
    index === arr.findIndex(f => 
      f.text.slice(0, 20) === feedback.text.slice(0, 20)
    )
  ).slice(0, 3);

  // 將建議轉換為任務
  const convertToTasks = (feedbacks: any[]) => {
    return feedbacks.map((feedback, index) => {
      let taskText = feedback.text;
      let taskType = '📚';
      
      if (taskText.includes('練習') || taskText.includes('題目')) {
        taskType = '✏️';
        taskText = taskText.replace(/建議|可以|應該/g, '').trim();
        if (!taskText.includes('題')) taskText += ' 3題練習';
      } else if (taskText.includes('概念') || taskText.includes('理解')) {
        taskType = '🎯';
        taskText = taskText.replace(/建議|可以|應該/g, '').trim();
      } else if (taskText.includes('影片') || taskText.includes('觀看')) {
        taskType = '📺';
        taskText = taskText.replace(/建議|可以|應該/g, '').trim();
        if (!taskText.includes('分鐘')) taskText += ' 5分鐘';
      }
      
      return {
        id: index,
        type: taskType,
        text: taskText,
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
      description: "掌握3個數學概念",
      icon: "🎯",
      earned: strongestConcepts.length >= 3,
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

  if (data.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-slate-700/50">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center mb-6">
            <span className="text-3xl">🎮</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">學習卡片儀表板</h3>
          <p className="text-slate-400 mb-2">開始對話後即可解鎖學習進度</p>
          <p className="text-slate-500 text-sm">在這裡查看你的數學學習歷程與任務</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-700/50 overflow-hidden">
      {/* 角色卡片頭部 */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
              <span className="text-2xl">🎓</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-yellow-300">等級 {level}</span>
                <div className="px-2 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
                  {stabilityPercentage}% 完成度
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white text-sm mb-1">學習穩定度</div>
            <div className="w-32 h-3 rounded-full bg-white/20 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getHPColor(stabilityPercentage)} transition-all duration-500`}
                style={{ width: `${stabilityPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* HP 血量條 */}
        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white font-semibold">💪 基礎穩定度</span>
            <span className="text-white/80">{stabilityPercentage}/100</span>
          </div>
          <div className="w-full h-4 rounded-full bg-white/20 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${getHPColor(stabilityPercentage)} transition-all duration-700 relative`}
              style={{ width: `${stabilityPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 標籤切換 */}
      <div className="bg-slate-700/50 px-6 py-3 border-b border-slate-600/50">
        <div className="flex gap-1">
          {[
            { id: 'overview', label: '📊 總覽', icon: '📊' },
            { id: 'radar', label: '🎯 雷達分析', icon: '🎯' },
            { id: 'tasks', label: '✅ 升級任務', icon: '✅' },
            { id: 'badges', label: '🏆 成就徽章', icon: '🏆' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-indigo-500 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 學習進度條 */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>📈</span> 學習進度條
              </h3>
              <div className="bg-slate-700/30 rounded-lg p-4 space-y-4">
                <ProgressBar 
                  value={strongestConcepts.length} 
                  max={6} 
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
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>🏆</span> 你的強項領域
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {strongestConcepts.map(([concept, count], index) => (
                  <div key={concept} className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-4 border border-green-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-green-300 font-semibold">{concept}</div>
                        <div className="text-green-400 text-sm">{count} 次使用</div>
                      </div>
                      <div className="text-2xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 弱點警告 */}
            {weaknessConcepts.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span>⚠️</span> 需要加強的概念
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {weaknessConcepts.map(([concept, count]) => (
                    <div key={concept} className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg p-4 border border-orange-500/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-orange-300 font-semibold">{concept}</div>
                          <div className="text-orange-400 text-sm">{count} 次錯誤</div>
                        </div>
                        <span className="text-2xl">⚠️</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'radar' && (
          <div>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span>🎯</span> 學習雷達分析
            </h3>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#475569" />
                  <PolarAngleAxis 
                    dataKey="concept" 
                    tick={{ fill: '#cbd5e1', fontSize: 12 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 'dataMax']} 
                    tick={{ fill: '#cbd5e1', fontSize: 10 }}
                  />
                  <Radar
                    name="掌握程度"
                    dataKey="score"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-slate-400 text-center">
              💡 雷達圖顯示各領域的學習強度，距離中心越遠代表掌握越好
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span>🎯</span> 今日升級任務
            </h3>
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎉</div>
                <div className="text-slate-400">目前沒有新任務</div>
                <div className="text-slate-500 text-sm mt-2">繼續學習來解鎖更多挑戰！</div>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <div key={task.id} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50 hover:bg-slate-700/50 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <span className="text-lg">{task.type}</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold">{task.text}</div>
                        <div className="text-slate-400 text-sm mt-1">任務 {index + 1}</div>
                      </div>
                      <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200">
                        開始
                      </button>
                    </div>
                  </div>
                ))}
                <div className="text-center mt-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                    <span>🔥</span>
                    <span className="text-purple-300 font-semibold">完成任務獲得經驗值！</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'badges' && (
          <div>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span>🏆</span> 成就徽章收集
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {badges.map((badge, index) => (
                <LearningBadge key={index} {...badge} />
              ))}
            </div>
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                <span>🎖️</span>
                <span className="text-yellow-300 font-semibold">
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
