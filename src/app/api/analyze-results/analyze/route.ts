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
  // 先分析所有訊息，最後再批次寫入
  for (const msg of latestMessages) {
    // 取出同一 conversation 的所有訊息，組合上下文
    const conv = conversations.find((c: any) => c.id === msg.conversation_id);
    let context = '';
    if (conv && Array.isArray(conv.messages)) {
      context = conv.messages
        .slice(Math.max(0, msg.message_index - 3), msg.message_index + 1)
        .map((m: any) => {
          if (m.role === 'user') return `學生：${m.parts?.[0]?.text ?? ''}`;
          if (m.role === 'assistant') return `AI：${m.parts?.[0]?.text ?? ''}`;
          if (m.role === 'system') return `題目：${m.parts?.[0]?.text ?? ''}`;
          return '';
        })
        .filter(Boolean)
        .join('\n');
    } else {
      context = `學生：${msg.text}`;
    }
    const prompt = `你是一個國中數學學習分析 AI 助教，請根據下列對話內容，分析學生的學習狀況，並只輸出以下 JSON 格式：\n{\n  "concepts_used": ["..."],\n  "unstable_concepts": ["..."],\n  "thinking_style": "...",\n  "expression": "...",\n  "ai_feedback": ["..."],\n  "confidence": 0~1\n}\n請不要輸出多餘欄位。\n\n對話內容：\n${context}\n`;
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
      id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now(),
      user_id: msg.user_id,
      conversation_id: msg.conversation_id,
      message_index: msg.message_index,
      text: msg.text,
      concepts_used: Array.isArray(parsed.concepts_used) ? parsed.concepts_used : [parsed.concepts_used].filter(Boolean),
      unstable_concepts: Array.isArray(parsed.unstable_concepts) ? parsed.unstable_concepts : [parsed.unstable_concepts].filter(Boolean),
      thinking_style: parsed.thinking_style ?? null,
      expression: parsed.expression ?? null,
      ai_feedback: Array.isArray(parsed.ai_feedback) ? parsed.ai_feedback : [parsed.ai_feedback].filter(Boolean),
      confidence: parsed.confidence ?? null,
      analyzed_at: new Date().toISOString(),
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
