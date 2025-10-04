import { NextRequest, NextResponse } from 'next/server';



// 創建備用回應 - 純觀念問題庫
function createFallbackResponse(unit?: string, keywords?: string[]): any {
  
  console.log('使用備用方案，單元:', unit, '關鍵字:', keywords);
  
  const conceptQuestions = [
    // 基本運算
    { question: '負數加減規則？', answer: '同號相加，異號相減' },
    { question: '分數運算法則？', answer: '通分後再加減運算' },
    { question: '四則運算順序？', answer: '先乘除後加減，括號優先' },
    
    // 幾何圖形
    { question: '展開圖概念？', answer: '立體圖形的平面展示' },
    { question: '平行線性質？', answer: '永不相交的兩直線' },
    { question: '垂直線特徵？', answer: '兩線相交成90度角' },
    
    // 坐標與方程式
    { question: '坐標系統？', answer: '用數字表示位置的方法' },
    { question: '方程式作用？', answer: '找出未知數的工具' },
    { question: '聯立方程式？', answer: '多個方程式同時求解' },
    
    // 統計與機率
    { question: '百分比意義？', answer: '以100為基準的比例' },
    { question: '平均數概念？', answer: '所有數據的總和除以個數' },
    { question: '機率定義？', answer: '事件發生的可能性' }
  ];

  // 根據單元關鍵字選擇
  if (unit) {
    if (unit.includes('算式') || unit.includes('運算')) {
      return conceptQuestions[Math.floor(Math.random() * 3)]; // 前3個
    }
    if (unit.includes('圖形') || unit.includes('展開')) {
      return conceptQuestions[3 + Math.floor(Math.random() * 3)]; // 中間3個
    }
    if (unit.includes('坐標') || unit.includes('方程式')) {
      return conceptQuestions[6 + Math.floor(Math.random() * 3)]; // 後3個
    }
  }
  
  // 根據關鍵字選擇
  if (keywords && keywords.length > 0) {
    const keyword = keywords[0];
    if (keyword.includes('負數') || keyword.includes('分數')) {
      return conceptQuestions[0];
    }
    if (keyword.includes('坐標') || keyword.includes('平面')) {
      return conceptQuestions[6];
    }
    if (keyword.includes('圖形') || keyword.includes('展開')) {
      return conceptQuestions[3];
    }
  }

  // 隨機選擇一個觀念問題
  return conceptQuestions[Math.floor(Math.random() * conceptQuestions.length)];
}

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

    // AI 提示詞 - 從會考題目提取觀念
    const prompt = `
你是數學老師，要從會考題目中提取核心觀念，製作簡潔的觀念卡片。

會考題目：${question}
標準答案：${answer}
${unit ? `數學單元：${unit}` : ''}

任務：分析這個會考題目考的是什麼數學觀念，然後製作觀念卡片。

要求：
- 問題：核心觀念名稱 + "？"，8-15字
- 答案：觀念重點說明，15-25字
- 去除所有具體細節，只保留觀念

轉換範例：
會考題："3/7 − (−1/4) 之值為何？"
→ 觀念："負數減法的運算規則？"
→ 說明："減去負數等於加上正數"

會考題："圖中坐標平面上有A、B、C、D四點，判斷哪一點在第三象限？"  
→ 觀念："象限的判斷方法？"
→ 說明："根據x、y坐標的正負號判斷"

JSON格式回傳：
{
  "conceptQuestion": "觀念問題？",
  "conceptAnswer": "觀念說明"
}
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
          temperature: 0.4,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 512,
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
      
      if (result.conceptQuestion && result.conceptAnswer) {
        return NextResponse.json(result);
      } else {
        // 如果 JSON 格式不對，使用備用方案
        return NextResponse.json(createFallbackResponse(unit, keywords));
      }
    } catch (parseError) {
      // JSON 解析失敗，使用備用方案
      return NextResponse.json(createFallbackResponse(unit, keywords));
    }

  } catch (error) {
    console.error('概念轉換 API 錯誤:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}