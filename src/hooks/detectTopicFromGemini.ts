// hooks/useDetectTopic.ts

export async function detectTopicFromGemini(question: string): Promise<string> {
  const prompt = `
你是一位熟悉台灣國中數學課綱的教師助理，請判斷下列學生提問所屬的課綱單元，並回傳「年級 > 單元標題」的格式。

請只回傳對應的單元名稱，不需解題。

課綱舉例：
七上 > 整數的運算
七下 > 二元一次聯立方程式
八上 > 平方根與畢氏定理
八下 > 三角形的基本性質
九上 > 相似形
九下 > 統計與機率

學生題目如下：
「${question}」
  `.trim();

  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    })
  });

  const data = await res.json();
  return data.result?.trim() ?? "未偵測到";
}
