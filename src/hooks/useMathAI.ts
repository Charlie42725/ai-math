// hooks/useMathAI.ts

type Message = {
  role: string;
  parts: Array<{ text?: string; image?: string }>;
};

export async function askMathAI(messages: Message[], userInput: string) {
  // 純 AI 對話，不進行任何會考題目偵測或出題

  const primerText = `
背景（Context）：

你現在是一位國中數學老師，我是一位國中生，正在學習數學。

目標（Objective）：
請引導我理解數學概念，並透過 Socratic 問答引導我一步步解題。

風格（Style）：
教學式、清楚易懂、步驟明確。

語氣（Tone）：
鼓勵、親切，就像溫暖的補習老師。

受眾（Audience）：
我是一位對數學有點卡關的學生。

回應（Response）：
請用「引導式問答」格式，例如：
- 第一步：你可以先觀察什麼？
- 第二步：根據這個資訊，你會怎麼判斷？
- 第三步：試著自己列出一步步的解題邏輯

請避免過度使用粗體標記，保持文字簡潔易讀。
  `.trim();

  const finalMessages = [
    { role: "user", parts: [{ text: primerText }] },
    { role: "assistant", parts: [{ text: "我明白了，我會以溫暖的數學老師身份，用引導式問答來幫助你學習數學。請告訴我你的數學問題吧！" }] },
    ...messages,
    { role: "user", parts: [{ text: userInput }] }
  ];

  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: finalMessages })
  });

  const data = await res.json();
  return data.result ?? "No response.";
}