"use client";
import React from "react";
import Link from "next/link";

export default function Section() {
  return (
    <section className="w-full flex flex-col items-center justify-center py-8 md:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 min-h-screen relative overflow-hidden">
      {/* 裝飾性背景元素 - 手機上縮小 */}
      <div className="absolute top-5 left-5 md:top-10 md:left-10 w-12 h-12 md:w-20 md:h-20 bg-purple-300 rounded-full opacity-20 animate-float"></div>
      <div className="absolute bottom-10 right-10 md:bottom-20 md:right-20 w-20 h-20 md:w-32 md:h-32 bg-pink-300 rounded-full opacity-20 animate-float-delayed"></div>
      <div className="absolute top-1/3 right-5 md:right-10 w-10 h-10 md:w-16 md:h-16 bg-blue-300 rounded-full opacity-20 animate-bounce-slow"></div>

      <div className="max-w-6xl w-full z-10">
        {/* 主角區域 */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 mb-8 md:mb-12">
          {/* 手機優先：圖片放上面 */}
          <div className="flex-1 flex justify-center order-1 md:order-2 w-full">
            <div className="relative">
              {/* 背景光環 */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full blur-2xl md:blur-3xl opacity-30 animate-pulse-slow"></div>

              {/* 主圖片 - 手機縮小 */}
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-80 md:h-80 rounded-full overflow-hidden bg-gradient-to-br from-purple-200 to-pink-200 p-3 md:p-4 shadow-2xl animate-bounce-gentle">
                <div className="w-full h-full rounded-full overflow-hidden bg-white">
                  <img
                    src="/bs/cute.png"
                    alt="AI 助手"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* 裝飾圖案 - 手機縮小 */}
              <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 w-6 h-6 md:w-10 md:h-10 bg-yellow-400 rounded-full opacity-80 animate-spin-slow"></div>
              <div className="absolute -bottom-1 -left-1 md:-bottom-2 md:-left-2 w-5 h-5 md:w-8 md:h-8 bg-pink-400 rounded-full opacity-80 animate-spin-slow"></div>
            </div>
          </div>

          {/* 文字內容 */}
          <div className="flex-1 text-center md:text-left space-y-4 md:space-y-6 order-2 md:order-1 w-full">
            <div className="inline-block w-full">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-3 md:mb-4 animate-fade-in leading-tight">
                AI 數學小助手
              </h1>
              <div className="h-1 w-2/3 sm:w-3/4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto md:mx-0"></div>
            </div>

            <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed animate-fade-in-delayed px-2 md:px-0 font-semibold">
              先做題，AI 自動告訴你哪裡不會
            </p>

            <div className="flex flex-col gap-3 md:gap-4 justify-center md:justify-start pt-2 md:pt-4 px-4 sm:px-0">
              {/* 主CTA - 会考练习 */}
              <Link
                href="/test"
                className="group px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg sm:text-xl font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>會考練習</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>

              {/* 次要入口 */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/analyze"
                  className="px-6 sm:px-8 py-3 bg-white hover:bg-gray-50 text-blue-600 text-base sm:text-lg font-semibold rounded-full shadow hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-blue-200 hover:border-blue-300 text-center"
                >
                  學習分析
                </Link>

                <Link
                  href="/chat"
                  className="px-6 sm:px-8 py-3 bg-white hover:bg-gray-50 text-purple-600 text-base sm:text-lg font-semibold rounded-full shadow hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-purple-200 hover:border-purple-300 text-center"
                >
                  AI 對話
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 功能卡片區 - 手機優化間距 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mt-10 md:mt-16 px-2 sm:px-0">
          {/* 1. 練習測驗卡片 - 主要功能 */}
          <Link href="/test" className="group">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 active:scale-95 transition-all duration-300 border-2 border-pink-100 hover:border-pink-300">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">練習測驗</h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">會考題庫，即時 AI 分析</p>
            </div>
          </Link>

          {/* 2. 學習分析卡片 */}
          <Link href="/analyze" className="group">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 active:scale-95 transition-all duration-300 border-2 border-blue-100 hover:border-blue-300">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">學習分析</h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">找出弱點，針對練習</p>
            </div>
          </Link>

          {/* 3. 智能對話卡片 */}
          <Link href="/chat" className="group">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 active:scale-95 transition-all duration-300 border-2 border-purple-100 hover:border-purple-300">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl sm:text-3xl text-white font-bold">AI</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">AI 對話</h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">問數學問題，拍照解題</p>
            </div>
          </Link>
        </div>


      </div>

      {/* 自定義動畫樣式 */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fade-in-delayed {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }

        .animate-bounce-gentle {
          animation: bounce-gentle 3s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-fade-in-delayed {
          animation: fade-in-delayed 1s ease-out 0.3s backwards;
        }
      `}</style>
    </section>
  );
}
