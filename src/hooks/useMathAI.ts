// hooks/useMathAI.ts
import { detectTopicFromGemini } from "./detectTopicFromGemini";
import { getTopicDetail } from "./getTopicDetail";
import examData from "../lib/exam.json";

type TopicDetail = {
  topics: string[];
  [key: string]: any;
};

export async function askMathAI(messages: any[], userInput: string) {
  // 如果是「我要練習會考題目」則直接回覆
  if (userInput === "我要練習會考題目") {
    return "沒問題，請問你的年級和想要學習的範圍？（例如：七上 算式運算）";
  }

  // 嘗試解析年級+單元
  const gradeUnitMatch = userInput.match(/(七上|七下|八上|八下|九上|九下)[\s,，]*(\S+)/);
  let filtered: any[] = [];
  if (gradeUnitMatch) {
    const grade = gradeUnitMatch[1];
    const unit = gradeUnitMatch[2];
    filtered = (examData as any[]).filter(q => q.grade === grade && q.unit.includes(unit));
  } else {
    // 模糊搜尋：關鍵字或單元或年級
    const keyword = userInput.replace(/\s/g, "");
    filtered = (examData as any[]).filter(q => {
      return (
        q.grade === userInput ||
        q.unit.includes(userInput) ||
        (q.keywords && q.keywords.some((k: string) => userInput.includes(k) || keyword.includes(k))) ||
        userInput.includes(q.unit) ||
        userInput.includes(q.grade)
      );
    });
  }
  // 若有找到題目就隨機出題
  if (filtered.length > 0) {
    const q = filtered[Math.floor(Math.random() * filtered.length)];
    let optionsText = Object.entries(q.options).map(([k, v]) => `${k}: ${v}`).join("\n");
    let imageText = q.image && q.image.trim() !== "" ? `\n[題目圖片](${q.image})` : "";
    return `【${q.grade} ${q.unit}】\n${q.question}${imageText}\n${optionsText}`;
  }

  const topic = await detectTopicFromGemini(userInput);
  const topicDetail = getTopicDetail(topic) as TopicDetail | undefined;

  const detailText = topicDetail && Array.isArray(topicDetail.topics) && topicDetail.topics.length > 0
    ? `本題根據 AI 判斷屬於「${topic}」。\n該單元包含以下子主題：\n${(topicDetail.topics as string[]).map(t => "- " + t).join("\n")}`
    : `本題根據 AI 判斷屬於「${topic}」。`;

  const primerText = `
背景（Context）：

你現在是一位國中數學老師，我是一位國中生，正在學習數學。請根據下列背景說明，引導我學習本題。

${detailText}

目標（Objective）：
請引導我理解這個章節的概念，並透過 Socratic 問答引導我一步步解題。

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