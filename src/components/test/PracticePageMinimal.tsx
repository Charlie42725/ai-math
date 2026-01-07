'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { DEV_MODE, ADMIN_USER } from '@/lib/devAuth';
import NavigationBar from './NavigationBar';
import ExamSettings from './ExamSettings';
import QuestionCardSimple from './QuestionCardSimple';
import FooterControls from './FooterControls';
import Timer from './Timer';
import EnhancedAnalysisSidebar from './EnhancedAnalysisSidebar';
import {
  getRandomQuestions,
  getMixedQuestions,
  getQuestionsByGrade,
  getQuestionsByUnit,
  FormattedQuestion,
  QuestionSource
} from '@/test/questionBank';

interface Question {
  id: number;
  title: string;
  content: string;
  type: 'multiple' | 'essay';
  options?: string[];
  correctAnswer?: string;
  points: number;
  originalId?: string;
  grade?: string;
  unit?: string;
  keywords?: string[];
  explanation?: string;
  image?: string;
}

interface Answer {
  questionId: number;
  answer: string;
  process?: string; // 新增：解題過程
  isCorrect?: boolean;
  feedback?: string;
  explanation?: string;
  // 完整的分析結果
  detailedAnalysis?: string;
  thinkingProcess?: string;
  thinkingScore?: number;
  optimization?: string;
  suggestions?: string[];
  stepByStepSolution?: Array<{
    step: number;
    title: string;
    content: string;
  }>;
  keyPoints?: string[];
}

interface PracticePageProps {
  questions: Question[];
}

interface SubmissionResult {
  isCorrect: boolean;
  feedback: string;
  explanation: string;
  detailedAnalysis?: string;
  thinkingProcess?: string;
  thinkingScore?: number;
  optimization?: string;
  suggestions?: string[];
  stepByStepSolution?: Array<{
    step: number;
    title: string;
    content: string;
  }>;
  keyPoints?: string[];
}

interface ExamSettingsData {
  mode: 'random' | 'grade' | 'unit' | 'mixed';
  selectedGrade?: string;
  selectedUnit?: string;
  questionSource?: QuestionSource;
}

const PracticePageMinimal = ({ questions }: PracticePageProps) => {
  // 考試設定階段
  const [examStarted, setExamStarted] = useState(false);
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(10);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [examSettings, setExamSettings] = useState<ExamSettingsData | null>(null);
  const [examStartTime, setExamStartTime] = useState<number>(0);
  
  // 考試進行階段
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // 當前問題的提交狀態
  const [currentQuestionSubmitted, setCurrentQuestionSubmitted] = useState(false);
  const [currentQuestionResult, setCurrentQuestionResult] = useState<SubmissionResult | null>(null);

  // 新增：側邊欄狀態 - 默認隱藏
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // 開始考試
  const handleStartExam = (questionCount: number, settings?: ExamSettingsData) => {
    let selected: FormattedQuestion[] = [];
    const source: QuestionSource = settings?.questionSource || 'historical';

    try {
      if (settings) {
        switch (settings.mode) {
          case 'random':
            selected = getRandomQuestions(questionCount, source);
            break;
          case 'grade':
            if (settings.selectedGrade) {
              selected = getQuestionsByGrade(settings.selectedGrade, questionCount, source);
            } else {
              selected = getRandomQuestions(questionCount, source);
            }
            break;
          case 'unit':
            if (settings.selectedUnit) {
              selected = getQuestionsByUnit(settings.selectedUnit, questionCount, source);
            } else {
              selected = getRandomQuestions(questionCount, source);
            }
            break;
          case 'mixed':
          default:
            selected = getMixedQuestions(questionCount, source);
            break;
        }
      } else {
        // 如果沒有設定，從傳入的 questions 中隨機選擇
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        selected = shuffled.slice(0, questionCount) as FormattedQuestion[];
      }

      // 如果選到的題目不足，補足剩餘的題目
      if (selected.length < questionCount) {
        const additional = getRandomQuestions(questionCount - selected.length, source);
        selected = [...selected, ...additional];
      }
    } catch (error) {
      console.error('選取題目時出錯:', error);
      // 錯誤時使用隨機選題作為後備方案
      selected = getRandomQuestions(questionCount, source);
    }
    
    setSelectedQuestions(selected as Question[]);
    setSelectedQuestionCount(questionCount);
    setTimeRemaining(questionCount * 3 * 60); // 每題3分鐘
    setExamStarted(true);
    setCurrentQuestion(0);
    setAnswers([]);
    setIsSubmitted(false);
    setShowResults(false);
    setCurrentQuestionSubmitted(false);
    setCurrentQuestionResult(null);
    setSidebarVisible(false); // 開始考試時隱藏側邊欄
    setExamSettings(settings || null); // 保存考试设置
    setExamStartTime(Date.now()); // 记录开始时间
  };

  // 計時器
  useEffect(() => {
    if (examStarted && timeRemaining > 0 && !isSubmitted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [examStarted, timeRemaining, isSubmitted]);

  // 提交單題答案
  const handleSubmitAnswer = async (questionId: number, answer: string, process?: string, analysisData?: any) => {
    const question = selectedQuestions.find(q => q.id === questionId);
    if (!question) return;

    console.log('[PracticePageMinimal] handleSubmitAnswer called');
    console.log('[PracticePageMinimal] analysisData:', analysisData);

    try {
      let result: SubmissionResult;
      
      // 如果已經有分析資料，直接使用
      if (analysisData && analysisData.success) {
        console.log('[Submit Answer] Using analysisData');
        
        // API 返回的數據在 data 字段中
        const apiData = analysisData.data || analysisData;
        
        console.log('[Submit Answer] apiData:', apiData);
        console.log('[Submit Answer] detailedAnalysis:', apiData.detailedAnalysis);
        console.log('[Submit Answer] stepByStepSolution:', apiData.stepByStepSolution);
        console.log('[Submit Answer] keyPoints:', apiData.keyPoints);
        
        result = {
          isCorrect: apiData.isCorrect,
          feedback: apiData.feedback,
          explanation: apiData.explanation,
          detailedAnalysis: apiData.detailedAnalysis,
          thinkingProcess: apiData.thinkingProcess,
          thinkingScore: apiData.thinkingScore,
          optimization: apiData.optimization,
          suggestions: apiData.suggestions,
          stepByStepSolution: apiData.stepByStepSolution,
          keyPoints: apiData.keyPoints
        };
        console.log('[Submit Answer] Final Result Object:', result);
      } else {
        // 如果沒有分析資料，呼叫原本的 API 或使用基本檢查
        const isCorrect = question.type === 'multiple' ? answer === question.correctAnswer : false;
        
        try {
          // 呼叫 Gemini API 進行詳細評估
          const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              question: question.content,
              userAnswer: answer,
              userProcess: process || '',
              correctAnswer: question.correctAnswer,
              questionType: question.type
            }),
          });

          if (response.ok) {
            const data = await response.json();
            result = {
              isCorrect,
              feedback: data.feedback || (isCorrect ? "答案正確！" : "答案錯誤"),
              explanation: data.explanation || question.correctAnswer || "",
              detailedAnalysis: data.detailedAnalysis,
              thinkingProcess: data.thinkingProcess,
              optimization: data.optimization,
              suggestions: data.suggestions
            };
          } else {
            throw new Error('API 請求失敗');
          }
        } catch (apiError) {
          // AI 評估失敗時的後備方案
          result = {
            isCorrect,
            feedback: isCorrect ? "答案正確！" : "答案錯誤",
            explanation: question.correctAnswer || "",
          };
        }
      }

      // 更新答案記錄
      const newAnswer: Answer = {
        questionId,
        answer,
        process,
        isCorrect: result.isCorrect,
        feedback: result.feedback,
        explanation: result.explanation,
        // 保存完整的分析結果
        detailedAnalysis: result.detailedAnalysis,
        thinkingProcess: result.thinkingProcess,
        thinkingScore: result.thinkingScore,
        optimization: result.optimization,
        suggestions: result.suggestions,
        stepByStepSolution: result.stepByStepSolution,
        keyPoints: result.keyPoints
      };

      setAnswers(prev => {
        const filtered = prev.filter(a => a.questionId !== questionId);
        return [...filtered, newAnswer];
      });

      setCurrentQuestionResult(result);
      setCurrentQuestionSubmitted(true);
      setSidebarVisible(true); // 顯示分析結果側邊欄

    } catch (error) {
      console.error('提交答案時發生錯誤:', error);
      const fallbackResult: SubmissionResult = {
        isCorrect: false,
        feedback: "評估時發生錯誤，請重試",
        explanation: question.correctAnswer || ""
      };
      setCurrentQuestionResult(fallbackResult);
      setCurrentQuestionSubmitted(true);
      setSidebarVisible(true); // 顯示分析結果側邊欄
    }
  };

  // 上一題
  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      const newQuestionIndex = currentQuestion - 1;
      setCurrentQuestion(newQuestionIndex);
      
      // 檢查新題目是否已有答案和分析結果
      const newQuestionId = selectedQuestions[newQuestionIndex]?.id;
      const existingAnswer = answers.find(a => a.questionId === newQuestionId);
      
      if (existingAnswer) {
        setCurrentQuestionSubmitted(true);
        // 重建完整的分析結果
        setCurrentQuestionResult({
          isCorrect: existingAnswer.isCorrect || false,
          feedback: existingAnswer.feedback || '',
          explanation: existingAnswer.explanation || '',
          detailedAnalysis: existingAnswer.detailedAnalysis,
          thinkingProcess: existingAnswer.thinkingProcess,
          thinkingScore: existingAnswer.thinkingScore,
          optimization: existingAnswer.optimization,
          suggestions: existingAnswer.suggestions,
          stepByStepSolution: existingAnswer.stepByStepSolution,
          keyPoints: existingAnswer.keyPoints
        });
        setSidebarVisible(true);
      } else {
        setCurrentQuestionSubmitted(false);
        setCurrentQuestionResult(null);
        setSidebarVisible(false);
      }
    }
  };

  // 下一題
  const handleNextQuestion = () => {
    if (currentQuestion < selectedQuestions.length - 1) {
      const newQuestionIndex = currentQuestion + 1;
      setCurrentQuestion(newQuestionIndex);
      
      // 檢查新題目是否已有答案和分析結果
      const newQuestionId = selectedQuestions[newQuestionIndex]?.id;
      const existingAnswer = answers.find(a => a.questionId === newQuestionId);
      
      if (existingAnswer) {
        setCurrentQuestionSubmitted(true);
        // 重建完整的分析結果
        setCurrentQuestionResult({
          isCorrect: existingAnswer.isCorrect || false,
          feedback: existingAnswer.feedback || '',
          explanation: existingAnswer.explanation || '',
          detailedAnalysis: existingAnswer.detailedAnalysis,
          thinkingProcess: existingAnswer.thinkingProcess,
          thinkingScore: existingAnswer.thinkingScore,
          optimization: existingAnswer.optimization,
          suggestions: existingAnswer.suggestions,
          stepByStepSolution: existingAnswer.stepByStepSolution,
          keyPoints: existingAnswer.keyPoints
        });
        setSidebarVisible(true);
      } else {
        setCurrentQuestionSubmitted(false);
        setCurrentQuestionResult(null);
        setSidebarVisible(false);
      }
    }
  };

  // 提交考試
  const handleSubmitExam = async () => {
    setIsSubmitted(true);
    setShowResults(true);

    // 保存測驗結果到資料庫
    try {
      // 獲取使用者ID
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || (DEV_MODE ? ADMIN_USER.id : null);

      if (userId) {
        const timeSpent = Math.floor((Date.now() - examStartTime) / 1000); // 實際用時（秒）
        
        const response = await fetch('/api/test-sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            questions: selectedQuestions,
            answers,
            timeSpent,
            settings: examSettings
          }),
        });

        const result = await response.json();
        if (result.success) {
          setSessionId(result.data.sessionId);
          console.log('測驗結果已保存:', result.data);
        } else {
          console.error('保存測驗結果失敗:', result.error);
        }
      }
    } catch (error) {
      console.error('保存測驗結果時發生錯誤:', error);
    }
  };

  // 重新開始
  const handleRestart = () => {
    setExamStarted(false);
    setIsSubmitted(false);
    setShowResults(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setCurrentQuestionSubmitted(false);
    setCurrentQuestionResult(null);
    setSidebarVisible(false); // 重新開始時隱藏側邊欄
  };

  if (!examStarted) {
    return (
      <>
        <NavigationBar />
        <ExamSettings onStartExam={handleStartExam} />
      </>
    );
  }

  if (showResults) {
    const router = useRouter();
    const totalScore = answers.reduce((sum, answer) => {
      if (answer.isCorrect) {
        const question = selectedQuestions.find(q => q.id === answer.questionId);
        return sum + (question?.points || 0);
      }
      return sum;
    }, 0);

    const maxScore = selectedQuestions.reduce((sum, q) => sum + q.points, 0);

    return (
      <>
        <NavigationBar />
        <div className="min-h-screen bg-stone-100 text-stone-800 p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-4">考試結果</h1>
              <div className="bg-white rounded-lg p-6 md:p-8 mb-6 shadow-sm border border-stone-200">
                <div className="text-3xl md:text-4xl font-bold mb-2">{totalScore}/{maxScore}</div>
                <div className="text-lg md:text-xl text-stone-600">
                  得分率: {((totalScore / maxScore) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleRestart}
                  className="bg-stone-600 hover:bg-stone-700 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-semibold transition-colors shadow-sm"
                >
                  重新開始
                </button>
                {sessionId && (
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.location.href = `/test-history/${sessionId}`;
                      }
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    查看詳細複盤
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const currentQuestionData = selectedQuestions[currentQuestion];
  const currentAnswer = answers.find(a => a.questionId === currentQuestionData?.id);

  return (
    <>
      {!examStarted && <NavigationBar />}
      <div className="min-h-screen bg-stone-100 text-stone-800 pb-20">
        {/* 頂部計時器和進度 */}
        <div className={`sticky ${examStarted ? 'top-0' : 'top-16'} bg-stone-50/95 backdrop-blur-sm border-b border-stone-200 p-3 md:p-4 z-10 shadow-sm`}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div className="flex items-center gap-3">
            {/* 返回按鈕 - 只在考試開始時顯示 */}
            {examStarted && (
              <button
                onClick={() => {
                  if (window.confirm('確定要退出考試嗎？未提交的答案將會遺失。')) {
                    setExamStarted(false);
                    setSelectedQuestions([]);
                    setAnswers([]);
                  }
                }}
                className="p-1.5 md:p-2 hover:bg-stone-200 rounded-lg transition-colors text-stone-600 hover:text-stone-800"
                title="退出考試"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="text-sm text-stone-600 font-medium">
              第 {currentQuestion + 1} 題 / 共 {selectedQuestions.length} 題
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4 w-full sm:w-auto justify-between sm:justify-start">
            {/* 分析結果按鈕 */}
            {currentQuestionResult && (
              <button
                onClick={() => setSidebarVisible(!sidebarVisible)}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 flex items-center space-x-1 md:space-x-2 shadow-sm ${
                  sidebarVisible
                    ? 'bg-amber-600 text-white shadow-amber-300'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200 hover:border-stone-300'
                }`}
              >
                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="hidden sm:inline">📊 分析</span>
                <span className="sm:hidden">📊</span>
                {!sidebarVisible && (
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </button>
            )}

            <Timer timeRemaining={timeRemaining} />
          </div>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className={`transition-all duration-300 ${sidebarVisible ? 'lg:pr-6' : ''}`}>
        <div className={`p-4 md:p-6 ${sidebarVisible ? 'max-w-4xl mx-auto lg:max-w-none lg:w-1/2' : 'max-w-4xl mx-auto'} transition-all duration-300`}>
          {currentQuestionData && (
            <QuestionCardSimple
              question={currentQuestionData}
              questionNumber={currentQuestion + 1}
              currentAnswer={currentAnswer?.answer || ''}
              currentProcess={currentAnswer?.process || ''}
              onAnswerSubmit={handleSubmitAnswer}
              disabled={false}
              isSubmitted={currentQuestionSubmitted}
              result={null} // 不顯示內嵌結果，使用側邊欄
            />
          )}
        </div>
      </div>

      {/* 底部控制區域 */}
      <FooterControls
        currentQuestion={currentQuestion}
        totalQuestions={selectedQuestions.length}
        onPreviousQuestion={handlePreviousQuestion}
        onNextQuestion={handleNextQuestion}
        onSubmitExam={handleSubmitExam}
        isSubmitted={isSubmitted}
        canSubmit={answers.length > 0}
      />

      {/* AI 分析結果側邊欄 - 只有在有分析結果時才顯示 */}
      {currentQuestionResult && currentQuestionData && (
        <EnhancedAnalysisSidebar
          result={currentQuestionResult}
          isVisible={sidebarVisible}
          onToggle={() => setSidebarVisible(!sidebarVisible)}
          userAnswer={currentAnswer?.answer}
          correctAnswer={currentQuestionData.correctAnswer}
          options={currentQuestionData.options ? {
            A: currentQuestionData.options[0] || '',
            B: currentQuestionData.options[1] || '',
            C: currentQuestionData.options[2] || '',
            D: currentQuestionData.options[3] || ''
          } : undefined}
        />
      )}
      </div>
    </>
  );
};

export default PracticePageMinimal;
