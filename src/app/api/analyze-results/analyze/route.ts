import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const MODEL = "gemini-1.5-pro";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // 1. 取得所有 user 訊息
    const { data: conversations, error } = await supabase
      .from('chat_histories')
      .select('id, user_id, messages');
    if (error) throw error;

    const userMessages: any[] = [];
    for (const conv of conversations) {
      const msgs = conv.messages || [];
      msgs.forEach((msg: any, index: number) => {
        if (msg.role === 'user') {
          userMessages.push({
            conversation_id: conv.id,
            user_id: conv.user_id,
            message_index: index + 1,
            text: msg.parts?.[0]?.text || '',
            timestamp: msg.timestamp || null
          });
        }
      });
    }

  // 2. 只分析最新 5 筆 user 訊息
  const resultsToSave: any[] = [];
  const latestMessages = userMessages.slice(-5);
  for (const msg of latestMessages) {
    const prompt = `你是會考數學助教，判斷以下學生訊息是否為一次數學作答。\n輸出 JSON：\n{\n  "is_attempt": true|false,\n  "unit": 單元或 null,\n  "grade": 年級或 null,\n  "question_id": 題庫ID或 null,\n  "final_answer": 最終答案或 null,\n  "confidence": 0~1\n}\n學生訊息：\n${msg.text}\n`;
    // 改為呼叫本地 /api/gemini route
    // server 端必須用完整 URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/gemini`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [ { role: "user", parts: [{ text: prompt }] } ] })
    });
    const data = await res.json();
    const aiText = data?.result || '';
    let parsed;
    let jsonText = aiText.trim();
    // 處理 ```json ... ``` 格式
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json[\r\n]*/i, '').replace(/```$/, '').trim();
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```[\w]*[\r\n]*/i, '').replace(/```$/, '').trim();
    }
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      console.error("[分析失敗] 非 JSON 格式:", aiText);
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

    // 3. 寫入 analyzed_attempts
    if (resultsToSave.length) {
      const { error: saveError } = await supabase
        .from('analyzed_attempts')
        .insert(resultsToSave);
      if (saveError) {
        console.error("[寫入失敗]", saveError);
        throw saveError;
      }
    }
    return NextResponse.json({ ok: true, count: resultsToSave.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}
