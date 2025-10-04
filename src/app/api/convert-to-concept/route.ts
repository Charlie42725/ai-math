import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { question, answer, unit, keywords } = await req.json();

    if (!question) {
      return NextResponse.json({ error: '缺少題目內容' }, { status: 400 });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return NextResponse.json({ error: '缺少 API KEY' }, { status: 500 });
    }

    // 構建 AI 提示詞，將考試題目轉換為簡潔的觀念閃卡
    const prompt = `
你是一位數學老師，請將考試題目轉換成簡潔的觀念閃卡。

原始題目：${question}
答案：${answer}
${unit ? `單元：${unit}` : ''}
${keywords ? `關鍵字：${keywords.join(', ')}` : ''}

轉換規則：
1. 問題：只要核心觀念，5-15字內，不含具體數字
2. 答案：簡潔重點，20-40字內，易記憶

例子：
問題："負數相減的規則？"
答案："負負得正，減法變加法"

回應格式：
{
  "conceptQuestion": "簡潔問題",
  "conceptAnswer": "簡潔答案"
}

請直接回傳 JSON，問題和答案都要簡短易懂。
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return NextResponse.json({ error: 'AI 回應格式錯誤' }, { status: 500 });
    }

    let aiResponse = data.candidates[0].content.parts[0].text.trim();
    
    // 清理回應，移除可能的 markdown 標記
    aiResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
    
    try {
      const result = JSON.parse(aiResponse);
      return NextResponse.json(result);
    } catch (parseError) {
      // 如果 JSON 解析失敗，返回原始回應
      return NextResponse.json({
        conceptQuestion: aiResponse,
        conceptAnswer: '請點擊「不懂，問AI」獲得更詳細的解釋'
      });
    }

  } catch (error) {
    console.error('概念轉換 API 錯誤:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}