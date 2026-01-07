// 测试评分逻辑 - 验证"过程对但答案错"应该给4分

const OpenAI = require('openai');
require('dotenv').config({ path: '.env.local' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 测试案例：过程正确但答案算错
const testCase = {
  question: "計算 (-8) + (-2) × (-3) = ?",
  options: {
    A: "-14",
    B: "-2",
    C: "14",
    D: "2"
  },
  correctAnswer: "B",
  userAnswer: "A", // 答案错了
  userProcess: "先算乘法：(-2) × (-3) = 6，然後算加法：(-8) + 6 = -14" // 但过程对（只是最后算错）
};

function createPrompt(params) {
  const isCorrect = params.userAnswer === params.correctAnswer;

  return `你是數學老師，分析學生答題。

題目：${params.question}
選項：A:${params.options.A} B:${params.options.B} C:${params.options.C} D:${params.options.D}
正確答案：${params.correctAnswer}
學生答案：${params.userAnswer}
${params.userProcess ? `學生過程：${params.userProcess}` : '無解題過程'}

【評分標準 - 非常重要】
5分：過程正確且答案正確
4分：過程/思路正確但答案算錯（計算失誤）
3分：有合理思路但方法有誤
2分：過程不完整或邏輯有問題
1分：沒有過程或完全錯誤

${isCorrect ? '' : '【必須指出】學生在哪一步出錯了！是概念錯誤還是計算失誤？'}

JSON格式（所有欄位必須有內容）：
{
  "feedback": "${isCorrect ? '答案正確！' : '答案錯誤'}",
  "explanation": "${isCorrect ? '說明為何正確' : '指出錯在哪裡（哪一步？）'}",
  "detailedAnalysis": "這題考什麼概念？${isCorrect ? '學生掌握得很好' : '學生在哪個步驟出錯？'}",
  "thinkingProcess": "${params.userProcess ? '評估學生的解題邏輯（若方法對但答案錯，必須說明是計算失誤）' : '學生未提供解題過程'}",
  "thinkingScore": ${params.userProcess ? '按上述標準給1-5分' : '1'},
  "optimization": "具體的改進建議",
  "suggestions": ["建議1", "建議2"],
  "stepByStepSolution": [
    {"step": 1, "title": "第一步", "content": "具體做法"},
    {"step": 2, "title": "第二步", "content": "具體做法"}
  ],
  "keyPoints": ["關鍵概念1", "關鍵概念2"]
}

【強制要求】
1. stepByStepSolution 至少2步
2. keyPoints 至少2個
3. 如果學生答錯，必須在explanation或detailedAnalysis中明確指出錯在哪一步
4. 評分必須按照標準：過程對答案錯=4分`;
}

async function testScoringLogic() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 測試評分邏輯');
  console.log('='.repeat(60));

  console.log('\n📝 測試案例:');
  console.log('題目:', testCase.question);
  console.log('正確答案:', testCase.correctAnswer, `(${testCase.options[testCase.correctAnswer]})`);
  console.log('學生答案:', testCase.userAnswer, `(${testCase.options[testCase.userAnswer]})`);
  console.log('解題過程:', testCase.userProcess);
  console.log('\n💭 預期結果:');
  console.log('- 評分: 4分 (過程正確但答案算錯)');
  console.log('- 應指出: 最後加法計算錯誤');
  console.log('- stepByStepSolution: 應有內容');
  console.log('- keyPoints: 應有內容');

  const prompt = createPrompt(testCase);

  console.log('\n⏳ 呼叫 OpenAI API...\n');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '你是專業數學教師。請準確分析學生答案，所有欄位都必須有內容，特別是stepByStepSolution和keyPoints不可為空。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1200,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    const usage = response.usage;

    console.log('✅ API 回應成功！\n');
    console.log('='.repeat(60));
    console.log('📊 分析結果');
    console.log('='.repeat(60));

    console.log('\n🎯 基本信息:');
    console.log('  回饋:', result.feedback);
    console.log('  評分:', result.thinkingScore, '/5');

    console.log('\n📝 詳細分析:');
    console.log('  解釋:', result.explanation);
    console.log('  詳細分析:', result.detailedAnalysis);
    console.log('  思考過程:', result.thinkingProcess);

    console.log('\n💡 建議:');
    console.log('  優化建議:', result.optimization);
    console.log('  學習建議:', result.suggestions);

    console.log('\n📚 解題步驟:');
    if (result.stepByStepSolution && result.stepByStepSolution.length > 0) {
      result.stepByStepSolution.forEach(step => {
        console.log(`  步驟${step.step}: ${step.title}`);
        console.log(`    ${step.content}`);
      });
    } else {
      console.log('  ❌ 沒有解題步驟！');
    }

    console.log('\n🔑 關鍵概念:');
    if (result.keyPoints && result.keyPoints.length > 0) {
      result.keyPoints.forEach((point, idx) => {
        console.log(`  ${idx + 1}. ${point}`);
      });
    } else {
      console.log('  ❌ 沒有關鍵概念！');
    }

    console.log('\n📈 Token 使用:');
    console.log('  - Prompt tokens:', usage?.prompt_tokens);
    console.log('  - Completion tokens:', usage?.completion_tokens);
    console.log('  - Total tokens:', usage?.total_tokens);

    // 驗證結果
    console.log('\n' + '='.repeat(60));
    console.log('✅ 驗證結果');
    console.log('='.repeat(60));

    const checks = {
      '評分是否為4分': result.thinkingScore === 4,
      '有指出錯誤位置': result.explanation?.includes('加法') || result.detailedAnalysis?.includes('加法') || result.explanation?.includes('計算') || result.detailedAnalysis?.includes('計算'),
      'stepByStepSolution不為空': result.stepByStepSolution && result.stepByStepSolution.length >= 2,
      'keyPoints不為空': result.keyPoints && result.keyPoints.length >= 2,
      'suggestions不為空': result.suggestions && result.suggestions.length >= 2
    };

    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`  ${passed ? '✅' : '❌'} ${check}`);
    });

    const allPassed = Object.values(checks).every(v => v === true);

    console.log('\n' + '='.repeat(60));
    if (allPassed) {
      console.log('🎉 所有檢查通過！優化成功！');
      console.log('\n改進重點:');
      console.log('  ✅ 評分邏輯正確（過程對答案錯 = 4分）');
      console.log('  ✅ 指出了具體錯誤位置');
      console.log('  ✅ 解題步驟有完整內容');
      console.log('  ✅ 關鍵概念有完整內容');
    } else {
      console.log('⚠️ 部分檢查未通過，需要進一步調整');
      if (!checks['評分是否為4分']) {
        console.log(`  - 實際評分: ${result.thinkingScore}，應該是 4 分`);
      }
    }

  } catch (error) {
    console.error('❌ 錯誤:', error.message);
  }
}

// 執行測試
testScoringLogic().catch(console.error);
