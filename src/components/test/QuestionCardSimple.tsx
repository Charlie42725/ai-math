'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Question {
  id: number;
  title: string;
  content: string;
  type: 'multiple' | 'essay';
  options?: string[];
  correctAnswer?: string;
  points: number;
  image?: string;
  originalId?: string; // 原始題目ID，用於精確匹配
}

interface SubmissionResult {
  isCorrect: boolean;
  feedback: string;
  explanation: string;
  detailedAnalysis?: string;
  thinkingProcess?: string;
  optimization?: string;
  suggestions?: string[];
}

interface QuestionCardSimpleProps {
  question: Question;
  questionNumber: number;
  currentAnswer: string;
  currentProcess?: string; // 新增：解題過程
  onAnswerSubmit: (questionId: number, answer: string, process?: string, analysisData?: any) => void;
  disabled?: boolean;
  isSubmitted?: boolean;
  result?: SubmissionResult | null;
}

const QuestionCardSimple = ({
  question,
  questionNumber,
  currentAnswer,
  currentProcess = '',
  onAnswerSubmit,
  disabled = false,
  isSubmitted = false,
  result = null
}: QuestionCardSimpleProps) => {
  const [localAnswer, setLocalAnswer] = useState(currentAnswer);
  const [localProcess, setLocalProcess] = useState(currentProcess); // 新增：本地解題過程
  const [isSubmitting, setIsSubmitting] = useState(false); // 新增：提交狀態
  const [uploadedImage, setUploadedImage] = useState<string | null>(null); // 新增：上傳的圖片
  const [recognizedText, setRecognizedText] = useState<string>(''); // 新增：識別的文字
  const [imageLoadError, setImageLoadError] = useState(false); // 新增：圖片加載錯誤狀態

  // 當切換題目時，更新本地狀態
  useEffect(() => {
    setLocalAnswer(currentAnswer);
    setLocalProcess(currentProcess);
    setIsSubmitting(false); // 重置提交狀態
    setUploadedImage(null); // 重置圖片
    setRecognizedText(''); // 重置識別文字
    setImageLoadError(false); // 重置圖片加載錯誤狀態
  }, [currentAnswer, currentProcess, question.id]); // 監聽題目 ID 變化

  // 處理圖片上傳
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 預覽圖片
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // 呼叫圖片識別 API
    try {
      const formData = new FormData();
      formData.append('image', file);

      console.log('[Image Upload] 開始識別圖片...');

      const response = await fetch('/api/recognize-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('[Image Upload] 識別結果:', data);

      if (data.success) {
        // 組合識別結果
        let recognizedContent = '';

        if (data.text) {
          recognizedContent += data.text;
        }

        if (data.formula) {
          recognizedContent += (recognizedContent ? '\n\n公式：' : '') + data.formula;
        }

        if (data.diagram) {
          recognizedContent += (recognizedContent ? '\n\n圖形：' : '') + data.diagram;
        }

        setRecognizedText(recognizedContent || '識別成功');

        // 自動填入解題過程
        if (recognizedContent) {
          setLocalProcess(prev => {
            const imageContent = '【圖片解題過程】\n' + recognizedContent;
            return prev ? prev + '\n\n' + imageContent : imageContent;
          });
        }
      } else {
        setRecognizedText('識別失敗：' + (data.error || '未知錯誤'));
      }
    } catch (error) {
      console.error('圖片識別失敗:', error);
      setRecognizedText('識別失敗，請檢查網絡連接');
    }
  };

  // 移除上傳的圖片
  const handleRemoveImage = () => {
    setUploadedImage(null);
    setRecognizedText('');
  };

  const handleSubmit = async () => {
    console.log('[QuestionCardSimple] handleSubmit called');
    console.log('[QuestionCardSimple] localAnswer:', localAnswer);
    console.log('[QuestionCardSimple] localProcess:', localProcess);
    console.log('[QuestionCardSimple] question.id:', question.id);
    
    if (localAnswer.trim()) {
      setIsSubmitting(true); // 開始提交
      try {
        // 呼叫新的分析 API
        console.log('[QuestionCardSimple] ===== 準備提交 =====');
        console.log('[QuestionCardSimple] question.id:', question.id, '(類型:', typeof question.id, ')');
        console.log('[QuestionCardSimple] question.originalId:', question.originalId, '(類型:', typeof question.originalId, ')');
        console.log('[QuestionCardSimple] question 完整對象:', question);
        console.log('[QuestionCardSimple] userAnswer:', localAnswer);
        console.log('[QuestionCardSimple] userProcess長度:', localProcess?.length || 0);

        const requestBody = {
          questionId: question.id,
          originalId: question.originalId, // 傳遞原始ID用於精確匹配
          userAnswer: localAnswer,
          userProcess: localProcess,
        };

        console.log('[QuestionCardSimple] 請求體:', JSON.stringify(requestBody, null, 2));

        const response = await fetch('/api/analyze-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        console.log('[QuestionCardSimple] API Response status:', response.status);
        const data = await response.json();

        console.log('[QuestionCardSimple] API Response 完整:', JSON.stringify(data, null, 2));

        if (data.success) {
          console.log('[QuestionCardSimple] ✅ 分析成功');
          // 將詳細分析結果傳遞給父元件
          onAnswerSubmit(question.id, localAnswer, localProcess, data);
        } else {
          console.error('[QuestionCardSimple] ❌ 分析失敗');
          console.error('[QuestionCardSimple] 錯誤訊息:', data.error);
          console.error('[QuestionCardSimple] 完整回應:', data);
          // 錯誤時仍然提交基本資料
          onAnswerSubmit(question.id, localAnswer, localProcess);
        }
      } catch (error) {
        console.error('提交失敗:', error);
        // 錯誤時仍然提交基本資料
        onAnswerSubmit(question.id, localAnswer, localProcess);
      } finally {
        setIsSubmitting(false); // 結束提交
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 題目卡片 */}
      <div className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-sm">
        {/* 題目標題區 */}
        <div className="bg-stone-50 p-4 sm:p-5 lg:p-6 border-b border-stone-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-800 mb-1.5 sm:mb-2">
                第 {questionNumber} 題 - {question.title}
              </h2>
              <div className="text-stone-600 text-xs sm:text-sm font-medium">
                {question.points} 分 • {question.type === 'multiple' ? '選擇題' : '計算題'}
              </div>
            </div>
          </div>
        </div>

        {/* 題目內容 */}
        <div className="p-4 sm:p-5 lg:p-6">
          <div className="text-base sm:text-lg text-stone-800 mb-4 sm:mb-6 leading-relaxed">
            {question.content}
          </div>

          {/* 圖片（如果有且加載成功） */}
          {question.image && !imageLoadError && (
            <div className="flex justify-center py-4 mb-4 sm:mb-6">
              <div className="relative max-w-2xl w-full">
                <Image
                  src={question.image}
                  alt={`第 ${questionNumber} 題圖片`}
                  width={600}
                  height={400}
                  className="rounded-lg border border-stone-300 shadow-md"
                  style={{ objectFit: 'contain' }}
                  onError={() => {
                    console.log(`圖片加載失敗: ${question.image}`);
                    setImageLoadError(true);
                  }}
                />
              </div>
            </div>
          )}

          {/* 選項或答案區域 */}
          {question.type === 'multiple' && question.options ? (
            <div className="space-y-4 sm:space-y-6">
              {/* 選項區域 */}
              <div className="space-y-2.5 sm:space-y-3">
                <h3 className="text-base sm:text-lg font-medium text-stone-800 mb-3 sm:mb-4">請選擇答案</h3>
                {question.options.map((option, index) => {
                  const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
                  const isSelected = localAnswer === optionLabel;

                  return (
                    <label
                      key={index}
                      className={`flex items-center p-3.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 touch-manipulation
                        ${isSelected
                          ? 'border-amber-600 bg-amber-50 text-stone-800 shadow-md'
                          : 'border-stone-300 hover:border-stone-400 text-stone-800 active:bg-stone-50'
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={optionLabel}
                        checked={isSelected}
                        onChange={(e) => setLocalAnswer(e.target.value)}
                        disabled={disabled}
                        className="sr-only"
                      />
                      <div className={`w-7 h-7 sm:w-6 sm:h-6 rounded-full border-2 mr-3 sm:mr-4 flex items-center justify-center text-sm font-bold flex-shrink-0
                        ${isSelected ? 'border-amber-600 bg-amber-600 text-white' : 'border-stone-400 text-stone-800'}
                      `}>
                        {optionLabel}
                      </div>
                      <span className="flex-1 text-sm sm:text-base leading-relaxed">{option}</span>
                    </label>
                  );
                })}
              </div>

              {/* 解題思路輸入區域 */}
              <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-medium text-stone-800">
                    <span className="mr-2">🧠</span>
                    解題思路與過程
                  </h3>
                  <span className="text-stone-600 text-sm">
                    (選填，有助於 AI 分析)
                  </span>
                </div>

                {/* 圖片上傳區域 - 整合到解題思路中 */}
                <div className="mb-4 p-3 bg-white rounded-lg border-2 border-dashed border-stone-300 animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📷</span>
                      <h4 className="text-sm font-semibold text-stone-800">拍題目 / 上傳圖片</h4>
                      <div className="group relative">
                        <svg className="w-4 h-4 text-stone-400 hover:text-stone-600 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute left-0 top-6 w-64 p-3 bg-stone-800 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                          <div className="font-semibold mb-1">💡 上傳解題過程圖片</div>
                          <ul className="space-y-1 text-stone-200">
                            <li>• 手寫計算過程</li>
                            <li>• 草稿紙圖片</li>
                            <li>• AI 會自動識別內容</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-stone-600 bg-stone-100 px-2 py-1 rounded-full">選填</span>
                  </div>

                  {!uploadedImage ? (
                    <label className="flex flex-col items-center justify-center p-4 bg-stone-50 rounded-lg border-2 border-dashed border-stone-300 hover:border-amber-500 cursor-pointer transition-all group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={disabled}
                      />
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 bg-amber-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-stone-700 mb-1">點擊上傳解題過程</p>
                        <p className="text-xs text-stone-500">支援手寫草稿或計算步驟圖片</p>
                      </div>
                    </label>
                  ) : (
                    <div className="bg-stone-50 rounded-lg p-3 border border-stone-200">
                      <div className="flex items-start gap-3">
                        <img src={uploadedImage} alt="上傳的解題過程" className="w-24 h-24 object-cover rounded-lg" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-stone-700">已上傳圖片</span>
                            <button
                              onClick={handleRemoveImage}
                              className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                            >
                              ✕ 移除
                            </button>
                          </div>
                          {recognizedText ? (
                            <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-xs text-green-700 font-medium mb-1">✓ 識別成功</p>
                              <p className="text-xs text-stone-700">{recognizedText}</p>
                            </div>
                          ) : (
                            <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                              <p className="text-xs text-amber-700">
                                💡 識別功能準備中
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <textarea
                  value={localProcess}
                  onChange={(e) => setLocalProcess(e.target.value)}
                  disabled={disabled}
                  placeholder="請說明你的解題思路，例如：&#10;1. 我先看到這是一元二次方程式...&#10;2. 使用因式分解法...&#10;3. 檢驗答案..."
                  rows={3}
                  className="w-full p-3 bg-white border border-stone-300 rounded-lg
                           text-stone-800 placeholder-stone-500 resize-none focus:outline-none
                           focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                />

                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-stone-600">
                    字數：{localProcess.length}
                  </span>
                  <span className="text-stone-600">
                    💡 詳細的思考過程有助於獲得更準確的 AI 回饋
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <textarea
                value={localAnswer}
                onChange={(e) => setLocalAnswer(e.target.value)}
                disabled={disabled}
                placeholder="請在此輸入您的解答過程和答案..."
                className="w-full h-32 p-4 bg-white border border-stone-300 rounded-lg
                         text-stone-800 placeholder-stone-500 resize-none focus:outline-none
                         focus:border-amber-500 transition-all duration-200"
              />
            </div>
          )}

          {/* 提交結果顯示 */}
          {result && (
            <div className="space-y-4">
              {/* 基本回饋 */}
              <div className={`p-4 rounded-xl border-2 ${
                result.isCorrect 
                  ? 'border-green-500 bg-green-500/10 text-green-300' 
                  : 'border-red-500 bg-red-500/10 text-red-300'
              }`}>
                <div className="font-semibold mb-2">{result.feedback}</div>
                {result.explanation && (
                  <div className="text-sm opacity-90">
                    <strong>解析：</strong>{result.explanation}
                  </div>
                )}
              </div>

              {/* 詳細分析結果 */}
              {result.detailedAnalysis && (
                <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10">
                  <h4 className="font-semibold text-blue-300 mb-2">🔍 詳細分析</h4>
                  <p className="text-sm text-blue-200">{result.detailedAnalysis}</p>
                </div>
              )}

              {/* 思考過程評估 */}
              {result.thinkingProcess && (
                <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/10">
                  <h4 className="font-semibold text-purple-300 mb-2">🧠 思考過程評估</h4>
                  <p className="text-sm text-purple-200">{result.thinkingProcess}</p>
                </div>
              )}

              {/* 優化建議 */}
              {result.optimization && (
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
                  <h4 className="font-semibold text-amber-300 mb-2">💡 優化建議</h4>
                  <p className="text-sm text-amber-200">{result.optimization}</p>
                </div>
              )}

              {/* 學習建議 */}
              {result.suggestions && result.suggestions.length > 0 && (
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                  <h4 className="font-semibold text-emerald-300 mb-2">📚 學習建議</h4>
                  <ul className="text-sm text-emerald-200 space-y-1">
                    {result.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-emerald-400">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 提交按鈕 */}
          {!isSubmitted && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleSubmit}
                disabled={!localAnswer.trim() || disabled || isSubmitting}
                className="bg-amber-600 hover:bg-amber-700
                         disabled:bg-stone-400 disabled:cursor-not-allowed
                         px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-semibold text-white transition-all duration-200
                         shadow-sm hover:shadow-md flex items-center space-x-2 touch-manipulation
                         text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>
                  {isSubmitting
                    ? '分析中...'
                    : (question.type === 'multiple' ? '提交答案與解題過程' : '提交答案')
                  }
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionCardSimple;
