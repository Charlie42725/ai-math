import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET: 獲取綜合學習建議
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json(
        { success: false, error: '缺少使用者ID' },
        { status: 400 }
      );
    }

    // 獲取聊天分析數據
    const { data: chatAnalysis } = await supabase
      .from('learning_analysis')
      .select('*')
      .eq('user_id', userId)
      .order('analyzed_at', { ascending: false })
      .limit(10);

    // 獲取測驗數據
    const { data: testSessions } = await supabase
      .from('test_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // 獲取測驗答案詳情
    const sessionIds = testSessions?.map(s => s.id) || [];
    let testAnswers: any[] = [];
    
    if (sessionIds.length > 0) {
      const { data: answersData } = await supabase
        .from('test_answers')
        .select('*')
        .in('session_id', sessionIds);
      
      testAnswers = answersData || [];
    }

    // 從聊天分析中提取不穩定概念
    const chatUnstableConcepts: { [key: string]: number } = {};
    chatAnalysis?.forEach((analysis: any) => {
      if (analysis.unstable_concepts && Array.isArray(analysis.unstable_concepts)) {
        analysis.unstable_concepts.forEach((concept: string) => {
          chatUnstableConcepts[concept] = (chatUnstableConcepts[concept] || 0) + 1;
        });
      }
    });

    // 從測驗中提取弱項概念
    const testWeakConcepts: { [key: string]: number } = {};
    testAnswers
      .filter((a: any) => !a.is_correct)
      .forEach((answer: any) => {
        if (answer.key_points && Array.isArray(answer.key_points)) {
          answer.key_points.forEach((point: string) => {
            testWeakConcepts[point] = (testWeakConcepts[point] || 0) + 1;
          });
        }
      });

    // 找出共同的弱項概念（同時在聊天和測驗中表現不佳）
    const criticalConcepts: Array<{ concept: string; chatCount: number; testCount: number; total: number }> = [];
    const allConcepts = new Set([...Object.keys(chatUnstableConcepts), ...Object.keys(testWeakConcepts)]);

    allConcepts.forEach(concept => {
      const chatCount = chatUnstableConcepts[concept] || 0;
      const testCount = testWeakConcepts[concept] || 0;
      const total = chatCount + testCount;

      if (total > 0) {
        criticalConcepts.push({
          concept,
          chatCount,
          testCount,
          total
        });
      }
    });

    // 按總次數排序
    criticalConcepts.sort((a, b) => b.total - a.total);

    // 計算測驗表現趨勢
    const recentTests = testSessions?.slice(0, 5).reverse() || [];
    const testTrend = recentTests.map((s: any) => ({
      date: new Date(s.created_at).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }),
      accuracy: s.total_score > 0 ? (s.earned_score / s.total_score * 100) : 0
    }));

    // 生成學習建議
    const suggestions: string[] = [];
    
    // 根據關鍵弱項生成建議
    const topWeakConcepts = criticalConcepts.slice(0, 3);
    if (topWeakConcepts.length > 0) {
      topWeakConcepts.forEach(({ concept, chatCount, testCount }) => {
        if (chatCount > 0 && testCount > 0) {
          suggestions.push(`「${concept}」在對話和測驗中都顯示需要加強，建議深入複習相關概念和多做練習`);
        } else if (testCount > 0) {
          suggestions.push(`「${concept}」在測驗中錯誤率較高，建議針對性練習此類題型`);
        } else if (chatCount > 0) {
          suggestions.push(`「${concept}」在對話中理解不夠穩固，建議多問問題加深理解`);
        }
      });
    }

    // 根據測驗趨勢生成建議
    if (testTrend.length >= 3) {
      const recentScores = testTrend.slice(-3).map(t => t.accuracy);
      const avgRecent = recentScores.reduce((sum, s) => sum + s, 0) / recentScores.length;
      
      if (avgRecent < 60) {
        suggestions.push('最近測驗表現需要提升，建議加強基礎概念的複習');
      } else if (avgRecent >= 80) {
        suggestions.push('測驗表現優秀！可以嘗試更具挑戰性的題目');
      }
    }

    // 根據總體表現生成建議
    const totalTests = testSessions?.length || 0;
    const totalChatAnalysis = chatAnalysis?.length || 0;
    
    if (totalTests > 0 && totalChatAnalysis === 0) {
      suggestions.push('建議多使用對話功能來鞏固學習，可以更好地理解概念');
    } else if (totalTests === 0 && totalChatAnalysis > 0) {
      suggestions.push('建議開始進行測驗來檢驗學習成果');
    }

    return Response.json({
      success: true,
      data: {
        criticalConcepts: criticalConcepts.slice(0, 10),
        testTrend,
        suggestions,
        summary: {
          totalTests,
          totalChatSessions: totalChatAnalysis,
          totalWeakConcepts: criticalConcepts.length
        }
      }
    });
  } catch (error: any) {
    console.error('API錯誤:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
