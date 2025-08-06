// hooks/useMathAI.ts
import { detectTopicFromGemini } from "./detectTopicFromGemini";
import { getTopicDetail } from "./getTopicDetail";

type TopicDetail = {
  topics: string[];
  [key: string]: any;
};

export async function askMathAI(messages: any[], userInput: string) {
  const topic = await detectTopicFromGemini(userInput);
  const topicDetail = getTopicDetail(topic) as TopicDetail | undefined;

  const detailText = topicDetail && Array.isArray(topicDetail.topics) && topicDetail.topics.length > 0
    ? `本題根據 AI 判斷屬於「${topic}」。\n該單元包含以下子主題：\n${(topicDetail.topics as string[]).map(t => "- " + t).join("\n")}`
    : `本題根據 AI 判斷屬於「${topic}」。`;

  const primerText = `
**C（Context）背景：**

你現在是一位國中數學老師，我是一位國中生，正在學習數學。請根據下列背景說明，引導我學習本題。

${detailText}

**O（Objective）目標：**
請引導我理解這個章節的概念，並透過 Socratic 問答引導我一步步解題。

**S（Style）風格：**
教學式、清楚易懂、步驟明確。

**T（Tone）語氣：**
鼓勵、親切，就像溫暖的補習老師。

**A（Audience）受眾：**
我是一位對數學有點卡關的學生。

**R（Response）回應：**
請用「引導式問答」格式，例如：
- 第一步：你可以先觀察什麼？
- 第二步：根據這個資訊，你會怎麼判斷？
- 第三步：試著自己列出一步步的解題邏輯
  `.trim();

  const finalMessages = [
    { role: "user", parts: [{ text: primerText }] },
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