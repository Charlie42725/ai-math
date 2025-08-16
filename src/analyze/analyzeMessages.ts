import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const MODEL = "gemini-2.0-flash"; // 用快的模型，避免吃光額度

export async function POST(req: NextRequest) {
  try {
    const { user_id, conversation_id, message_index, text } = await req.json();

    // prompt 設計
    const prompt = `
你是一個數學學習分析助手。
請根據以下對話，分析學生的數學學習狀況，輸出 JSON 格式：
{
  "concepts_used": [...],
  "unstable_concepts": [...],
  "thinking_style": "...",
  "expression": "...",
  "ai_feedback": [ "...", "..." ]
}

對話內容：
${text}
`;

    // call Gemini
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await res.json();
    console.log("Gemini API response:", data);

    // 拿 AI 回傳文字
    let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    rawText = rawText.replace(/```json|```/g, ""); // 清掉 code block

    // 嘗試提取 JSON 區塊
    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json({ error: "AI 沒有輸出 JSON" }, { status: 500 });
    }

    let analysis;
    try {
      analysis = JSON.parse(match[0]);
    } catch (e) {
      console.error("JSON parse error:", e);
      return NextResponse.json({ error: "AI 回傳非 JSON 格式" }, { status: 500 });
    }

    // 準備資料，符合資料表 schema
    const row = {
      user_id,
      conversation_id,
      message_index,
      text,
      concepts_used: Array.isArray(analysis.concepts_used)
        ? analysis.concepts_used
        : [analysis.concepts_used].filter(Boolean),
      unstable_concepts: Array.isArray(analysis.unstable_concepts)
        ? analysis.unstable_concepts
        : [analysis.unstable_concepts].filter(Boolean),
      thinking_style: analysis.thinking_style || null,
      expression: analysis.expression || null,
      ai_feedback: Array.isArray(analysis.ai_feedback)
        ? analysis.ai_feedback
        : [analysis.ai_feedback].filter(Boolean),
      confidence: null, // 暫時不存 logprobs
      analyzed_at: new Date().toISOString(),
    };

    // 存進 Supabase
    const { error } = await supabase.from("analyzed_attempts").insert([row]);
    if (error) {
      console.error("DB insert error:", error);
      return NextResponse.json({ error: "存入資料庫失敗" }, { status: 500 });
    }

    return NextResponse.json({ success: true, analysis: row });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "分析失敗" }, { status: 500 });
  }
}
