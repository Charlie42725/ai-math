/**
 * 測試 analyze-answer API
 */
async function testAnalyzeAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/analyze-answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        questionId: 1,
        userAnswer: 'A',
        userProcess: '我先看題目，然後選了A',
      }),
    });

    const data = await response.json();

    console.log('=== API Response ===');
    console.log(JSON.stringify(data, null, 2));

    console.log('\n=== Key Fields ===');
    console.log('detailedAnalysis:', data.data?.detailedAnalysis || '(empty)');
    console.log('stepByStepSolution length:', data.data?.stepByStepSolution?.length || 0);
    console.log('keyPoints length:', data.data?.keyPoints?.length || 0);
    console.log('suggestions length:', data.data?.suggestions?.length || 0);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAnalyzeAPI();
