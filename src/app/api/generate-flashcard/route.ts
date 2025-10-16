import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { topic, count = 5, difficulty = "medium" } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: "請提供主題" },
        { status: 400 }
      );
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const difficultyMap: Record<string, string> = {
      easy: "簡單（適合初學者）",
      medium: "中等（適合一般程度）",
      hard: "困難（適合進階學習）"
    };

    const prompt = `你是一位專業的國中數學老師。請根據以下主題生成 ${count} 張閃卡，用於學生複習。

主題：${topic}
難度：${difficultyMap[difficulty] || difficultyMap.medium}

請以 JSON 格式回傳，格式如下：
{
  "cards": [
    {
      "question": "問題內容（簡潔明確，適合閃卡）",
      "answer": "答案內容（清楚扼要，包含關鍵概念）",
      "category": "${topic}",
      "difficulty": "${difficulty}"
    }
  ]
}

注意事項：
1. 問題要簡潔，一句話說明核心概念或題目
2. 答案要完整但精簡，包含關鍵步驟或公式
3. 問題範圍涵蓋該主題的重要概念
4. 由淺入深，循序漸進
5. 適合快速複習記憶

請直接回傳 JSON，不要包含其他說明文字。`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // 清理 JSON 字符串（移除可能的 markdown 標記）
    let jsonText = text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }

    const result = JSON.parse(jsonText);

    // 為每張卡片添加唯一 ID 和預設值
    const cardsWithIds = result.cards.map((card: { question: string; answer: string; category: string; difficulty: string }, index: number) => ({
      id: `${Date.now()}-${index}`,
      question: card.question,
      answer: card.answer,
      category: card.category || topic,
      difficulty: card.difficulty || difficulty,
      reviewCount: 0,
      correctCount: 0,
    }));

    return NextResponse.json({
      success: true,
      cards: cardsWithIds
    });

  } catch (error) {
    console.error("Generate flashcard error:", error);
    return NextResponse.json(
      {
        error: "生成閃卡失敗",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
