'use client'

import { useState, useEffect } from 'react';
import ExamSettings from './ExamSettings';
import QuestionCardSimple from './QuestionCardSimple';
import FooterControls from './FooterControls';
import Timer from './Timer';
import { 
  getRandomQuestions, 
  getMixedQuestions, 
  getQuestionsByGrade, 
  getQuestionsByUnit,
  FormattedQuestion 
} from '@/lib/questionBank';

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
}

interface Answer {
  questionId: number;
  answer: string;
  process?: string; // 新增：解題過程
  isCorrect?: boolean;
  feedback?: string;
  explanation?: string;
}

interface PracticePageProps {
  questions: Question[];
}

interface SubmissionResult {
  isCorrect: boolean;
  feedback: string;
  explanation: string;
}

interface ExamSettingsData {
  mode: 'random' | 'grade' | 'unit' | 'mixed';
  selectedGrade?: string;
  selectedUnit?: string;
}

const PracticePageMinimal = ({ questions }: PracticePageProps) => {
  // 考試設定階段
  const [examStarted, setExamStarted] = useState(false);
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(10);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  
  // 考試進行階段
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // 當前問題的提交狀態
  const [currentQuestionSubmitted, setCurrentQuestionSubmitted] = useState(false);
  const [currentQuestionResult, setCurrentQuestionResult] = useState<SubmissionResult | null>(null);

  // 開始考試
  const handleStartExam = (questionCount: number, settings?: ExamSettingsData) => {
    let selected: FormattedQuestion[] = [];
    
    try {
      if (settings) {
        switch (settings.mode) {
          case 'random':
            selected = getRandomQuestions(questionCount);
            break;
          case 'grade':
            if (settings.selectedGrade) {
              selected = getQuestionsByGrade(settings.selectedGrade, questionCount);
            } else {
              selected = getRandomQuestions(questionCount);
            }
            break;
          case 'unit':
            if (settings.selectedUnit) {
              selected = getQuestionsByUnit(settings.selectedUnit, questionCount);
            } else {
              selected = getRandomQuestions(questionCount);
            }
            break;
          case 'mixed':
          default:
            selected = getMixedQuestions(questionCount);
            break;
        }
      } else {
        // 如果沒有設定，從傳入的 questions 中隨機選擇
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        selected = shuffled.slice(0, questionCount) as FormattedQuestion[];
      }
      
      // 如果選到的題目不足，補足剩餘的題目
      if (selected.length < questionCount) {
        const additional = getRandomQuestions(questionCount - selected.length);
        selected = [...selected, ...additional];
      }
    } catch (error) {
      console.error('選取題目時出錯:', error);
      // 錯誤時使用隨機選題作為後備方案
      selected = getRandomQuestions(questionCount);
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
  const handleSubmitAnswer = async (questionId: number, answer: string, process?: string) => {
    const question = selectedQuestions.find(q => q.id === questionId);
    if (!question) return;

    try {
      // 基本正確性檢查
      let isCorrect = false;
      if (question.type === 'multiple') {
        isCorrect = answer === question.correctAnswer;
      }

      // 呼叫 Gemini API 進行詳細評估
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.content,
          userAnswer: answer,
          userProcess: process || '', // 新增：用戶解題過程
          correctAnswer: question.correctAnswer,
          questionType: question.type
        }),
      });

      let feedback = "";
      let explanation = "";

      if (response.ok) {
        const data = await response.json();
        feedback = data.feedback || (isCorrect ? "答案正確！" : "答案錯誤");
        explanation = data.explanation || question.correctAnswer || "";
      } else {
        // AI 評估失敗時的後備方案
        feedback = isCorrect ? "答案正確！" : "答案錯誤";
        explanation = question.correctAnswer || "";
      }

      const result: SubmissionResult = {
        isCorrect,
        feedback,
        explanation
      };

      // 更新答案記錄
      const newAnswer: Answer = {
        questionId,
        answer,
        process, // 新增：解題過程
        isCorrect,
        feedback,
        explanation
      };

      setAnswers(prev => {
        const filtered = prev.filter(a => a.questionId !== questionId);
        return [...filtered, newAnswer];
      });

      setCurrentQuestionResult(result);
      setCurrentQuestionSubmitted(true);

    } catch (error) {
      console.error('提交答案時發生錯誤:', error);
      const fallbackResult: SubmissionResult = {
        isCorrect: false,
        feedback: "評估時發生錯誤，請重試",
        explanation: question.correctAnswer || ""
      };
      setCurrentQuestionResult(fallbackResult);
      setCurrentQuestionSubmitted(true);
    }
  };

  // 上一題
  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setCurrentQuestionSubmitted(false);
      setCurrentQuestionResult(null);
    }
  };

  // 下一題
  const handleNextQuestion = () => {
    if (currentQuestion < selectedQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setCurrentQuestionSubmitted(false);
      setCurrentQuestionResult(null);
    }
  };

  // 提交考試
  const handleSubmitExam = () => {
    setIsSubmitted(true);
    setShowResults(true);
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
  };

  if (!examStarted) {
    return <ExamSettings onStartExam={handleStartExam} />;
  }

  if (showResults) {
    const totalScore = answers.reduce((sum, answer) => {
      if (answer.isCorrect) {
        const question = selectedQuestions.find(q => q.id === answer.questionId);
        return sum + (question?.points || 0);
      }
      return sum;
    }, 0);

    const maxScore = selectedQuestions.reduce((sum, q) => sum + q.points, 0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">考試結果</h1>
            <div className="bg-slate-800 rounded-lg p-8 mb-6">
              <div className="text-4xl font-bold mb-2">{totalScore}/{maxScore}</div>
              <div className="text-xl text-slate-300">
                得分率: {((totalScore / maxScore) * 100).toFixed(1)}%
              </div>
            </div>
            <button
              onClick={handleRestart}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              重新開始
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestionData = selectedQuestions[currentQuestion];
  const currentAnswer = answers.find(a => a.questionId === currentQuestionData?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* 頂部計時器和進度 */}
      <div className="sticky top-0 bg-slate-900/90 backdrop-blur-sm border-b border-slate-700 p-4 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="text-sm text-slate-300">
            第 {currentQuestion + 1} 題 / 共 {selectedQuestions.length} 題
          </div>
          <Timer timeRemaining={timeRemaining} />
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {currentQuestionData && (
            <QuestionCardSimple
              question={currentQuestionData}
              questionNumber={currentQuestion + 1}
              currentAnswer={currentAnswer?.answer || ''}
              currentProcess={currentAnswer?.process || ''}
              onAnswerSubmit={handleSubmitAnswer}
              disabled={false}
              isSubmitted={currentQuestionSubmitted}
              result={currentQuestionResult}
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
    </div>
  );
};

export default PracticePageMinimal;
