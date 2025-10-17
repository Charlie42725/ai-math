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
    console.log('Starting analysis...');
    
    // 檢查必要的環境變數
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('缺少 SUPABASE_URL 環境變數');
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('缺少 SUPABASE_SERVICE_ROLE_KEY 環境變數');
    }
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('缺少 GEMINI_API_KEY 環境變數');
    }

    // 1. 取得所有 user 訊息
    const { data: conversations, error } = await supabase
      .from('chat_histories')
      .select('id, user_id, messages');
    
    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`數據庫查詢失敗: ${error.message}`);
    }

    console.log(`Found ${conversations?.length || 0} conversations`);

    const userMessages: any[] = [];
    for (const conv of conversations || []) {
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
  
  console.log(`Processing ${latestMessages.length} messages`);
  
  // 先分析所有訊息，最後再批次寫入
  for (const msg of latestMessages) {
    try {
      // 檢查是否為數學相關對話
      const mathKeywords = ['數學', '算式', '方程式', '函數', '幾何', '統計', '機率', '三角', '坐標', '圖形', '計算', '解題', '證明', '公式', '定理', '角度', '面積', '體積', '周長', '分數', '小數', '負數', '平方', '開根號', 'x', 'y', '=', '+', '-', '×', '÷', '°'];
      
      const isMathRelated = mathKeywords.some(keyword => 
        msg.text.includes(keyword) || 
        (msg.text.match(/[0-9]+/) && msg.text.length > 3) // 包含數字且不是太短的訊息
      );
      
      if (!isMathRelated) {
        console.log(`跳過非數學相關訊息: ${msg.text.substring(0, 50)}...`);
        continue;
      }
      
      // 取出同一 conversation 的所有訊息，組合上下文
      const conv = conversations?.find((c: any) => c.id === msg.conversation_id);
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
    const prompt = `你是國中數學學習專家，只分析數學相關內容。

【嚴格規則】
1. 只回傳純 JSON，無其他文字
2. 只能使用下列數學概念，絕不使用其他學科
3. 如果不是數學相關，回傳空陣列

允許的數學概念清單：
- 整數運算、分數運算、有理數
- 一元一次方程式、二元聯立方程式、一元二次方程式  
- 乘法公式、多項式、因式分解
- 平方根、畢氏定理
- 線性函數、二次函數、坐標平面
- 三角形性質、平行四邊形、相似形、圓
- 立體圖形、幾何計算  
- 統計、機率
- 比例、不等式

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
}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/gemini`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [ { role: "user", parts: [{ text: prompt }] } ] })
    });
    
    // 檢查響應狀態
    if (!res.ok) {
      console.error(`Gemini API error: ${res.status} ${res.statusText}`);
      const errorText = await res.text();
      console.error('Error response:', errorText);
      continue; // 跳過這個訊息，繼續處理下一個
    }
    
    // 檢查響應內容類型
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error(`Unexpected content type: ${contentType}`);
      const responseText = await res.text();
      console.error('Non-JSON response:', responseText.substring(0, 200));
      continue; // 跳過這個訊息，繼續處理下一個
    }
    
    const data = await res.json();
    const aiText = data?.result || '';
    let parsed;
    
    // 嘗試提取 JSON 部分
    let jsonText = aiText.trim();
    
    // 移除 markdown 代碼塊
    jsonText = jsonText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    
    // 嘗試找到 JSON 對象
    const jsonMatch = jsonText.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }
    
    try {
      parsed = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("[分析失敗] JSON 解析錯誤:", parseError);
      console.error("原始回應:", aiText);
      console.error("嘗試解析的文字:", jsonText);
      
      // 跳過這個訊息，繼續處理下一個
      continue;
    }
    
    // 驗證並過濾非數學概念
    const mathConcepts = [
      '整數運算', '分數運算', '有理數', 
      '一元一次方程式', '二元聯立方程式', '一元二次方程式',
      '乘法公式', '多項式', '因式分解',
      '平方根', '畢氏定理',
      '線性函數', '二次函數', '坐標平面',
      '三角形性質', '平行四邊形', '相似形', '圓',
      '立體圖形', '幾何計算',
      '統計', '機率',
      '比例', '不等式'
    ];
    
    // 過濾掉非數學概念
    const filterMathConcepts = (concepts: string[]) => {
      return concepts.filter(concept => 
        mathConcepts.some(mathConcept => 
          concept.includes(mathConcept) || mathConcept.includes(concept)
        ) || concept.match(/數學|計算|方程|函數|幾何|統計|機率/)
      );
    };
    
    const validConceptsUsed = filterMathConcepts(
      Array.isArray(parsed.concepts_used) ? parsed.concepts_used : [parsed.concepts_used].filter(Boolean)
    );
    
    const validUnstableConcepts = filterMathConcepts(
      Array.isArray(parsed.unstable_concepts) ? parsed.unstable_concepts : [parsed.unstable_concepts].filter(Boolean)  
    );
    
    // 如果沒有有效的數學概念，跳過
    if (validConceptsUsed.length === 0 && validUnstableConcepts.length === 0) {
      console.log("跳過：未發現有效的數學概念");
      continue;
    }
    
    resultsToSave.push({
      id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now(),
      user_id: msg.user_id,
      conversation_id: msg.conversation_id,
      message_index: msg.message_index,
      text: msg.text,
      concepts_used: validConceptsUsed,
      unstable_concepts: validUnstableConcepts,
      thinking_style: parsed.thinking_style ?? null,
      expression: parsed.expression ?? null,
      ai_feedback: Array.isArray(parsed.ai_feedback) ? parsed.ai_feedback : [parsed.ai_feedback].filter(Boolean),
      confidence: parsed.confidence ?? null,
      analyzed_at: new Date().toISOString(),
    });
    } catch (msgError) {
      console.error(`Error processing message ${msg.conversation_id}:`, msgError);
      // 繼續處理下一個消息
    }
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
    
    console.log(`Successfully processed ${resultsToSave.length} messages`);
    return NextResponse.json({ ok: true, count: resultsToSave.length });
  } catch (e: any) {
    console.error('API Error:', e);
    return NextResponse.json({ 
      error: e.message || String(e),
      success: false 
    }, { status: 500 });
  }
}
