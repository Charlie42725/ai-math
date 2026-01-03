// app/api/recognize-image/route.ts
// 图片识别 API - 识别数学公式和图形

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // 1. 接收图片数据
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: '未上传图片' },
        { status: 400 }
      );
    }

    // 2. 将图片转换为 base64
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    console.log('[Recognize Image] 收到图片，大小:', imageFile.size, 'bytes');

    // ============================================
    // 🔧 方案选择：请根据需求选择一种方案
    // ============================================

    // 📌 方案 A: OpenAI GPT-4 Vision (推荐，已集成)
    // 优点：准确度高，支持复杂数学公式，中文支持好
    // 缺点：成本较高
    const resultA = await recognizeWithOpenAI(base64Image);
    return NextResponse.json(resultA);

    // 📌 方案 B: Google Gemini Vision (备选)
    // 优点：免费额度大，速度快
    // 缺点：需要额外配置 Gemini API
    // const resultB = await recognizeWithGemini(base64Image);
    // return NextResponse.json(resultB);

    // 📌 方案 C: MathPix API (专业数学公式识别)
    // 优点：专门针对数学公式，LaTeX 输出准确
    // 缺点：需要单独付费订阅
    // const resultC = await recognizeWithMathPix(base64Image);
    // return NextResponse.json(resultC);

  } catch (error: any) {
    console.error('[Recognize Image] 错误:', error);
    return NextResponse.json(
      { success: false, error: error.message || '识别失败' },
      { status: 500 }
    );
  }
}

// ============================================
// 方案 A: OpenAI GPT-4 Vision
// ============================================
async function recognizeWithOpenAI(base64Image: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // GPT-4 Turbo with Vision
      messages: [
        {
          role: 'system',
          content: `你是一个专业的数学题目识别助手。请识别图片中的：
1. 数学公式（用 LaTeX 格式输出）
2. 题目文字（完整提取）
3. 图形描述（如有几何图形）

输出格式（JSON）：
{
  "formula": "公式的 LaTeX 表示（如果有）",
  "text": "完整的题目文字",
  "diagram": "图形描述（如果有）"
}`,
        },
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
              text: '请识别这张图片中的数学题目，包括公式、文字和图形。',
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.3, // 较低温度以获得更准确的识别
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('OpenAI 未返回识别结果');
    }

    // 尝试解析 JSON 回应
    try {
      const parsed = JSON.parse(content);
      return {
        success: true,
        formula: parsed.formula || '',
        text: parsed.text || '',
        diagram: parsed.diagram || '',
        raw: content,
      };
    } catch {
      // 如果不是 JSON，返回原始文本
      return {
        success: true,
        text: content,
        raw: content,
      };
    }
  } catch (error: any) {
    console.error('[OpenAI Vision] 错误:', error);
    throw error;
  }
}

// ============================================
// 方案 B: Google Gemini Vision (可选)
// ============================================
/*
async function recognizeWithGemini(base64Image: string) {
  try {
    // 🔧 TODO: 补充 Gemini API 调用
    // 参考：https://ai.google.dev/tutorials/node_quickstart

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: '请识别这张图片中的数学公式和题目文字。如果有公式，请用 LaTeX 格式输出。',
              },
              {
                inline_data: {
                  mime_type: 'image/png',
                  data: base64Image,
                },
              },
            ],
          }],
        }),
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      success: true,
      text,
      raw: text,
    };
  } catch (error: any) {
    console.error('[Gemini Vision] 错误:', error);
    throw error;
  }
}
*/

// ============================================
// 方案 C: MathPix API (可选，专业数学识别)
// ============================================
/*
async function recognizeWithMathPix(base64Image: string) {
  try {
    // 🔧 TODO: 补充 MathPix API 调用
    // 参考：https://docs.mathpix.com/

    const MATHPIX_APP_ID = process.env.MATHPIX_APP_ID;
    const MATHPIX_APP_KEY = process.env.MATHPIX_APP_KEY;

    const response = await fetch('https://api.mathpix.com/v3/text', {
      method: 'POST',
      headers: {
        'app_id': MATHPIX_APP_ID!,
        'app_key': MATHPIX_APP_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        src: `data:image/png;base64,${base64Image}`,
        formats: ['text', 'latex_styled'],
        data_options: {
          include_asciimath: true,
          include_latex: true,
        },
      }),
    });

    const data = await response.json();

    return {
      success: true,
      formula: data.latex_styled || '',
      text: data.text || '',
      raw: JSON.stringify(data),
    };
  } catch (error: any) {
    console.error('[MathPix] 错误:', error);
    throw error;
  }
}
*/

// ============================================
// 🎯 快速测试用的模拟函数（开发时使用）
// ============================================
/*
async function mockRecognize(base64Image: string) {
  // 模拟识别延迟
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    success: true,
    formula: 'x^2 + 2x + 1 = 0', // 示例公式
    text: '解方程：x² + 2x + 1 = 0',
    diagram: '',
  };
}
*/
