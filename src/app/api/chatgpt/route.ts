// app/api/chatgpt/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { base64Image, prompt, messages } = body;

    // Vision 模式：處理圖片 + 文字
    if (base64Image && prompt !== undefined) {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o', // GPT-4 Turbo with Vision
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${base64Image}`,
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
        max_tokens: 2048,
        temperature: 0.7,
      });

      const reply = response.choices[0]?.message?.content ?? null;

      if (reply) {
        return NextResponse.json({ result: reply });
      } else {
        return NextResponse.json({ result: 'No response from ChatGPT' });
      }
    }
    // 多輪對話模式：純文字
    else if (messages) {
      // 將 Gemini 格式轉換為 OpenAI 格式
      const openaiMessages = messages.map((msg: any) => {
        const textContent = msg.parts
          .filter((part: any) => part.text)
          .map((part: any) => part.text)
          .join('\n');

        return {
          role: msg.role === 'model' ? 'assistant' : msg.role,
          content: textContent,
        };
      });

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // 使用經濟實惠的模型處理多輪對話
        messages: openaiMessages,
        max_tokens: 2048,
        temperature: 0.7,
      });

      const reply = response.choices[0]?.message?.content ?? null;

      if (reply) {
        return NextResponse.json({ result: reply });
      } else {
        return NextResponse.json({ result: 'No response from ChatGPT' });
      }
    } else {
      return NextResponse.json(
        { result: '[ChatGPT Error] No valid input' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('ChatGPT API call failed:', error);
    return NextResponse.json(
      {
        result: `[ChatGPT Error] ${error.message || 'API request failed'}`,
      },
      { status: 500 }
    );
  }
}
