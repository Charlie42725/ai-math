import React, { useState } from "react";

interface FlashCardProps {
  question: string;
  answer: string;
  onDontUnderstand: () => void;
  onClose: () => void;
  onRestart: () => void;
  loading?: boolean;
}

const FlashCard: React.FC<FlashCardProps> = ({ question, answer, onDontUnderstand, onClose, onRestart, loading = false }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <style jsx>{`
        .flip-card {
          perspective: 1000px;
        }
        .flip-card-inner {
          transition: transform 0.8s;
          transform-style: preserve-3d;
        }
        .flip-card-inner.flipped {
          transform: rotateY(180deg);
        }
        .flip-card-front,
        .flip-card-back {
          backface-visibility: hidden;
        }
        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>
      
      <div className="w-80 h-96 flip-card">
        <div className={`relative w-full h-full flip-card-inner ${flipped ? 'flipped' : ''}`}>
          {/* 正面 - 問題 */}
          <div className="absolute inset-0 w-full h-full bg-white rounded-xl shadow-2xl flip-card-front flex flex-col overflow-hidden">
            {/* 關閉按鈕 */}
            <button
              className="absolute top-3 right-3 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors z-10"
              onClick={(e) => { 
                e.stopPropagation(); 
                onClose();
              }}
            >
              ✕
            </button>

            {/* 卡片內容 */}
            <div
              className={`flex-1 flex items-center justify-center cursor-pointer transition-all duration-300 p-8 ${
                loading 
                  ? 'bg-gradient-to-br from-gray-50 to-gray-100' 
                  : 'bg-gradient-to-br from-violet-50 to-purple-50'
              }`}
              onClick={() => !loading && setFlipped(true)}
            >
              <div className="text-center">
                {loading ? (
                  <>
                    <div className="mb-6 text-gray-400">
                      <svg className="w-16 h-16 mx-auto animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-600">🤖 正在生成觀念閃卡...</p>
                    <p className="text-sm text-gray-500 mt-3">稍等一下</p>
                  </>
                ) : (
                  <>
                    <div className="mb-6 text-violet-600">
                      <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 text-center leading-relaxed">{question}</p>
                    <p className="text-sm text-gray-500 mt-8">點擊查看答案</p>
                  </>
                )}
              </div>
            </div>

            {/* 底部按鈕區域 */}
            <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
              <button
                className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg shadow hover:from-violet-600 hover:to-purple-700 transition-all duration-200 font-medium"
                onClick={onDontUnderstand}
              >
                🤔 不懂，問AI
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setFlipped(false);
                  onRestart();
                }}
              >
                🔄 重新開始
              </button>
            </div>
          </div>

          {/* 背面 - 答案 */}
          <div className="absolute inset-0 w-full h-full bg-white rounded-xl shadow-2xl flip-card-back flex flex-col overflow-hidden">
            {/* 關閉按鈕 */}
            <button
              className="absolute top-3 right-3 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors z-10"
              onClick={(e) => { 
                e.stopPropagation(); 
                onClose();
              }}
            >
              ✕
            </button>

            {/* 答案內容 */}
            <div
              className="flex-1 flex items-center justify-center cursor-pointer transition-all duration-300 p-8 bg-gradient-to-br from-green-50 to-emerald-50"
              onClick={() => setFlipped(false)}
            >
              <div className="text-center">
                <div className="mb-6 text-green-600">
                  <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-xl font-semibold text-green-700 text-center leading-relaxed">{answer}</p>
                <p className="text-sm text-green-500 mt-8">點擊重新翻面</p>
              </div>
            </div>

            {/* 底部按鈕區域 */}
            <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
              <button
                className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg shadow hover:from-violet-600 hover:to-purple-700 transition-all duration-200 font-medium"
                onClick={onDontUnderstand}
              >
                🤔 不懂，問AI
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setFlipped(false);
                  onRestart();
                }}
              >
                🔄 重新開始
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashCard;
