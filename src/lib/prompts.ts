/**
 * AI Prompts 統一管理
 * 集中管理所有 AI 提示詞，便於維護和更新
 */

/**
 * 蘇格拉底式數學教學提示詞
 */
export const MATH_TEACHER_PRIMER = `
背景（Context）：

你現在是一位國中數學老師，我是一位國中生，正在學習數學。

目標（Objective）：
請引導我理解數學概念，並透過 Socratic 問答引導我一步步解題。

風格（Style）：
教學式、清楚易懂、步驟明確。

語氣（Tone）：
鼓勵、親切，就像溫暖的補習老師。

受眾（Audience）：
我是一位對數學有點卡關的學生。

回應（Response）：
請用「引導式問答」格式，例如：
- 第一步：你可以先觀察什麼？
- 第二步：根據這個資訊，你會怎麼判斷？
- 第三步：試著自己列出一步步的解題邏輯

請避免過度使用粗體標記，保持文字簡潔易讀。
`.trim();

/**
 * 數學教師初始回應
 */
export const MATH_TEACHER_INITIAL_RESPONSE =
  '我明白了，我會以溫暖的數學老師身份，用引導式問答來幫助你學習數學。請告訴我你的數學問題吧！';

/**
 * 允許的數學概念清單
 */
export const ALLOWED_MATH_CONCEPTS = [
  '整數運算',
  '分數運算',
  '有理數',
  '一元一次方程式',
  '二元聯立方程式',
  '一元二次方程式',
  '乘法公式',
  '多項式',
  '因式分解',
  '平方根',
  '畢氏定理',
  '線性函數',
  '二次函數',
  '坐標平面',
  '三角形性質',
  '平行四邊形',
  '相似形',
  '圓',
  '立體圖形',
  '幾何計算',
  '統計',
  '機率',
  '比例',
  '不等式',
] as const;

/**
 * 題目分析提示詞
 */
export interface AnalyzeAnswerParams {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  explanation: string;
  userAnswer: string;
  userProcess: string;
}

export function createAnalyzeAnswerPrompt(params: AnalyzeAnswerParams): string {
  return `
請你是一位數學老師，對學生的答題進行詳細分析：

題目：${params.question}
選項：
A: ${params.options.A}
B: ${params.options.B}
C: ${params.options.C}
D: ${params.options.D}

正確答案：${params.correctAnswer}
標準解析：${params.explanation}

學生的答案：${params.userAnswer}
學生的解題過程：${params.userProcess || '未提供解題過程'}

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
`.trim();
}

/**
 * 學習分析提示詞
 */
export function createLearningAnalysisPrompt(context: string): string {
  return `你是國中數學學習專家，只分析數學相關內容。

【嚴格規則】
1. 只回傳純 JSON，無其他文字
2. 只能使用下列數學概念，絕不使用其他學科
3. 如果不是數學相關，回傳空陣列

允許的數學概念清單：
${ALLOWED_MATH_CONCEPTS.map((c) => `- ${c}`).join('\n')}

【禁止】絕對不能出現：生物、化學、物理、歷史、地理等非數學概念

對話內容：${context}

回傳格式：
{
  "concepts_used": ["僅限上述數學概念"],
  "unstable_concepts": ["僅限上述數學概念"],
  "thinking_style": "邏輯型/視覺型/操作型/未知",
  "expression": "清楚/模糊/簡潔",
  "ai_feedback": ["數學學習建議"],
  "confidence": 0.8
}`.trim();
}

/**
 * 閃卡生成提示詞
 */
export interface FlashcardParams {
  concept: string;
  grade?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export function createFlashcardPrompt(params: FlashcardParams): string {
  const difficultyText = params.difficulty
    ? `難度：${params.difficulty === 'easy' ? '簡單' : params.difficulty === 'medium' ? '中等' : '困難'}`
    : '';
  const gradeText = params.grade ? `年級：${params.grade}` : '';

  return `
請為以下數學概念生成一張學習閃卡：

概念：${params.concept}
${gradeText}
${difficultyText}

請以 JSON 格式回答：
{
  "front": "閃卡正面內容（問題或關鍵概念）",
  "back": "閃卡背面內容（答案或詳細說明）",
  "example": "實際範例",
  "tips": ["學習提示1", "學習提示2"],
  "relatedConcepts": ["相關概念1", "相關概念2"]
}

要求：
- 內容適合國中生程度
- 使用清晰易懂的語言
- 提供實用的學習提示
`.trim();
}

/**
 * 概念轉換提示詞
 */
export function createConceptConversionPrompt(text: string): string {
  return `
請將以下文字轉換為標準的數學課綱概念。

文字：${text}

允許的概念清單：
${ALLOWED_MATH_CONCEPTS.map((c) => `- ${c}`).join('\n')}

請以 JSON 格式回答：
{
  "concepts": ["標準概念1", "標準概念2"],
  "confidence": 0.9
}

注意：
- 只回傳上述清單中的概念
- 如果無法對應，回傳空陣列
- confidence 為 0-1 之間的信心度
`.trim();
}

/**
 * Prompt 模板類型
 */
export const PromptTemplates = {
  mathTeacher: {
    primer: MATH_TEACHER_PRIMER,
    initialResponse: MATH_TEACHER_INITIAL_RESPONSE,
  },
  analyzeAnswer: createAnalyzeAnswerPrompt,
  learningAnalysis: createLearningAnalysisPrompt,
  flashcard: createFlashcardPrompt,
  conceptConversion: createConceptConversionPrompt,
} as const;
