import { extractUserMessages } from './extractUserMessages';
import { saveAnalysisResults } from './saveAnalysisResults';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const MODEL = 'gemini-1.5-flash';

function pickJson(text: string): any | null {
  if (!text) return null;
  // 去除 code fence
  const cleaned = text.replace(/```json|```/g, '').trim();
  // 嘗試直接 parse
  try { return JSON.parse(cleaned); } catch {}
  // 從字串裡擷取第一個 {...}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch {}
  }
  return null;
}

async function callGemini(prompt: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini error ${res.status}: ${body}`);
  }
  const data = await res.json();
  // 嘗試多個可能路徑
  const parts =
    data?.candidates?.[0]?.content?.parts ??
    data?.candidates?.[0]?.content?.candidate_parts ??
    [];
  const aiText = parts?.[0]?.text ?? JSON.stringify(data);
  return aiText as string;
}

async function analyzeMessages() {
  const msgs = await extractUserMessages();
  if (!msgs.length) {
    console.log('[analyze] 沒有使用者訊息，結束');
    return;
  }

  const rows = [];
  for (const msg of msgs) {
    const prompt = `
你是一個會考數學助教，判斷以下學生訊息是否為一次數學作答。
只輸出 JSON，格式：
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
`.trim();

    let aiText = '';
    try {
      aiText = await callGemini(prompt);
    } catch (e: any) {
      console.error('[analyze] Gemini 失敗：', e.message);
      // 如果是 429/配額，用一筆「未分析」結果占位，方便你在 DB 看到紀錄
      rows.push({
        user_id: msg.user_id,
        conversation_id: msg.conversation_id,
        message_index: msg.message_index,
        text: msg.text,
        is_attempt: null,
        unit: null,
        grade: null,
        question_id: null,
        final_answer: null,
        confidence: null
      });
      continue;
    }

    const parsed = pickJson(aiText);
    if (!parsed) {
      console.warn('[analyze] 無法解析 JSON：', aiText.slice(0, 200));
      // 同上，占位
      rows.push({
        user_id: msg.user_id,
        conversation_id: msg.conversation_id,
        message_index: msg.message_index,
        text: msg.text,
        is_attempt: null,
        unit: null,
        grade: null,
        question_id: null,
        final_answer: null,
        confidence: null
      });
      continue;
    }

    rows.push({
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

  await saveAnalysisResults(rows);
}

analyzeMessages().catch(err => {
  console.error(err);
  process.exit(1);
});
