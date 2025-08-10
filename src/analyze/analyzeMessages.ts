import { extractUserMessages } from './extractUserMessages';
import { saveAnalysisResults } from './saveAnalysisResults';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const MODEL = "gemini-1.5-pro";

async function analyzeMessages() {
  const userMessages = await extractUserMessages();
  const resultsToSave: any[] = [];

  for (const msg of userMessages) {
    const prompt = `
你是一個會考數學助教，判斷以下學生訊息是否為一次數學作答。
輸出 JSON：
{
  "is_attempt": true|false,
  "unit": 單元或 null,
  "grade": 年級或 null,
  "question_id": 題庫ID或 null,
  "final_answer": 最終答案或 null,
  "confidence": 0~1
}
學生訊息：
${msg.text}
`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await res.json();
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch {
      console.error('AI 回覆非 JSON 格式:', aiText);
      continue;
    }

    resultsToSave.push({
      user_id: msg.user_id,
      conversation_id: msg.conversation_id,
      message_index: msg.message_index,
      text: msg.text,
      is_attempt: parsed.is_attempt ?? null,
      unit: parsed.unit ?? null,
      grade: parsed.grade ?? null,
      question_id: parsed.question_id ?? null,
      final_answer: parsed.final_answer ?? null,
      confidence: parsed.confidence ?? null
    });
  }

  // 儲存所有結果
  await saveAnalysisResults(resultsToSave);
}

analyzeMessages().catch(console.error);
