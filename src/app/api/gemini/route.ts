// app/api/gemini/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { base64Image, prompt, messages } = body;

  const API_KEY = process.env.GEMINI_API_KEY;

  let endpoint = '';
  let payload: any = {};

  if (base64Image && prompt !== undefined) {
    // ✅ 修正：使用 Vision 模型的正確 endpoint
    endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent?key=${API_KEY}`;
    payload = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "image/png",
                data: base64Image,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
    };
  } else if (messages) {
    // 純文字 chat
    endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
    payload = {
      contents: messages,
    };
  } else {
    return NextResponse.json({ result: '[Gemini Error] No valid input' }, { status: 400 });
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log('Gemini API response:', data);
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;

    if (reply) {
      return NextResponse.json({ result: reply });
    } else if (data?.error?.message) {
      return NextResponse.json({ result: `[Gemini Error] ${data.error.message}` });
    } else {
      return NextResponse.json({ result: 'No response' });
    }
  } catch (error) {
    console.error('Gemini API call failed:', error);
    return NextResponse.json({ result: 'Gemini API request failed' }, { status: 500 });
  }
}
