import { NextResponse } from 'next/server';
import questionsData from '@/test/batch_01_questions.json';

interface QuestionData {
  id: string;
  year: number;
  grade: string;
  unit: string;
  keywords: string[];
  question: string;
  image: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: string;
  explanation: string;
}

export async function POST(request: Request) {
  try {
    const { questionId, userAnswer, userProcess } = await request.json();

    // 查找題目（使用正確的邏輯）
    let question: QuestionData | undefined;
    
    if (typeof questionId === 'number') {
      // questionId 是 FormattedQuestion 的 id（index + 1），所以要減 1 來獲取正確的 index
      const targetIndex = questionId - 1;
      question = questionsData[targetIndex];
    } else {
      // 如果 questionId 是字串，直接比較 id
      question = questionsData.find((q: QuestionData) => q.id === questionId);
    }
    
    if (!question) {
      return NextResponse.json({ error: '題目不存在' }, { status: 404 });
    }

    // 準備傳遞給 AI 的資料
    const aiPayload = {
      question: question.question,
      correctAnswer: question.answer,
      explanation: question.explanation,
      userAnswer,
      userProcess: userProcess || '',
      questionOptions: question.options,
      keywords: question.keywords,
      unit: question.unit,
      grade: question.grade
    };

    try {
      // 準備給 AI 的詳細分析提示
      const analysisPrompt = `
請你是一位數學老師，對學生的答題進行詳細分析：

題目：${question.question}
選項：
A: ${question.options.A}
B: ${question.options.B}
C: ${question.options.C}  
D: ${question.options.D}

正確答案：${question.answer}
標準解析：${question.explanation}

學生的答案：${userAnswer}
學生的解題過程：${userProcess || '未提供解題過程'}

請提供以下分析（以 JSON 格式回答）：
{
  "feedback": "簡短評價（如：答案正確、答案錯誤、部分正確等）",
  "explanation": "簡短說明正確答案",
  "detailedAnalysis": "詳細分析題目和解題方法", 
  "thinkingProcess": "評估學生的思考過程和解題邏輯",
  "thinkingScore": 4,
  "optimization": "給學生的改進建議",
  "suggestions": ["學習建議1", "學習建議2"],
  "stepByStepSolution": [
    {"step": 1, "title": "理解題意", "content": "首先分析題目要求..."},
    {"step": 2, "title": "選擇方法", "content": "根據題目特點選擇..."},
    {"step": 3, "title": "計算過程", "content": "具體計算步驟..."}
  ],
  "keyPoints": ["重點概念1", "重點概念2"]
}

注意：
- feedback 欄位請保持簡潔
- thinkingScore 為1-5分，評估學生思考過程的完整性和正確性
- stepByStepSolution 提供步驟式解題過程
- keyPoints 列出該題目的關鍵知識點
`;

      // 呼叫 Gemini API 進行詳細分析
      const aiResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/gemini`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              parts: [{ text: analysisPrompt }]
            }
          ]
        }),
      });

      if (!aiResponse.ok) {
        throw new Error('AI 分析失敗');
      }

      const geminiData = await aiResponse.json();
      
      // 嘗試解析 JSON 回應
      let aiResult: any = {};
      try {
        if (geminiData.result) {
          // 清理可能的 markdown 格式
          const cleanedResult = geminiData.result.replace(/```json\n?|\n?```/g, '').trim();
          aiResult = JSON.parse(cleanedResult);
        }
      } catch (parseError) {
        // 如果解析失敗，使用預設值
        aiResult = {
          feedback: geminiData.result?.substring(0, 100) || '',
          explanation: '',
          detailedAnalysis: '',
          thinkingProcess: '',
          thinkingScore: 3,
          optimization: '',
          suggestions: [],
          stepByStepSolution: [],
          keyPoints: []
        };
      }

      // 基本正確性檢查
      const isCorrect = userAnswer === question.answer;

      // 返回詳細的分析結果
      return NextResponse.json({
        success: true,
        isCorrect,
        feedback: isCorrect ? "答案正確！" : "答案錯誤", // 保持簡潔的基本回饋
        explanation: aiResult.explanation || `正確答案是 ${question.answer}`,
        optimization: aiResult.optimization || "建議多練習類似題型",
        detailedAnalysis: aiResult.detailedAnalysis || question.explanation,
        thinkingProcess: aiResult.thinkingProcess || "",
        thinkingScore: aiResult.thinkingScore || (userProcess ? 3 : 1),
        suggestions: aiResult.suggestions || [],
        stepByStepSolution: aiResult.stepByStepSolution || [],
        keyPoints: aiResult.keyPoints || []
      });

    } catch (aiError) {
      // AI 分析失敗時的後備方案
      const isCorrect = userAnswer === question.answer;
      
      return NextResponse.json({
        success: true,
        isCorrect,
        feedback: isCorrect ? "答案正確！" : "答案錯誤",
        explanation: `正確答案是 ${question.answer}`,
        optimization: "建議檢查解題步驟是否正確",
        detailedAnalysis: question.explanation,
        thinkingProcess: "",
        thinkingScore: userProcess ? 2 : 1,
        suggestions: ["多練習類似題型", "仔細閱讀題目"],
        stepByStepSolution: [],
        keyPoints: []
      });
    }

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '未知錯誤' 
    }, { status: 500 });
  }
}
