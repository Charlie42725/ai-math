import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET: 獲取用戶測驗統計數據
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

    // 獲取所有測驗記錄
    const { data: sessions, error: sessionsError } = await supabase
      .from('test_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (sessionsError) {
      console.error('獲取測驗記錄失敗:', sessionsError);
      return Response.json(
        { success: false, error: '獲取測驗記錄失敗' },
        { status: 500 }
      );
    }

    // 獲取所有答案記錄（用於分析常錯題型）
    const sessionIds = sessions?.map(s => s.id) || [];
    let answers = [];
    
    if (sessionIds.length > 0) {
      const { data: answersData, error: answersError } = await supabase
        .from('test_answers')
        .select('*')
        .in('session_id', sessionIds);

      if (!answersError && answersData) {
        answers = answersData;
      }
    }

    // 計算統計數據
    const totalSessions = sessions?.length || 0;
    const totalQuestions = answers.length;
    const correctAnswers = answers.filter((a: any) => a.is_correct).length;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions * 100) : 0;

    // 計算平均分數
    const avgScore = sessions && sessions.length > 0
      ? sessions.reduce((sum: number, s: any) => 
          sum + (s.total_score > 0 ? (s.earned_score / s.total_score * 100) : 0), 0
        ) / sessions.length
      : 0;

    // 分析常錯題型（從 question_content 中提取關鍵字）
    const wrongAnswers = answers.filter((a: any) => !a.is_correct);
    const conceptErrors: { [key: string]: number } = {};
    
    wrongAnswers.forEach((answer: any) => {
      // 從詳細分析或關鍵知識點中提取概念
      if (answer.key_points && Array.isArray(answer.key_points)) {
        answer.key_points.forEach((point: string) => {
          conceptErrors[point] = (conceptErrors[point] || 0) + 1;
        });
      }
    });

    // 轉換為數組並排序
    const weakConcepts = Object.entries(conceptErrors)
      .map(([concept, count]) => ({ concept, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 計算每次測驗的進步趨勢
    const recentSessions = sessions?.slice(0, 10).reverse() || [];
    const progressTrend = recentSessions.map((s: any) => ({
      date: new Date(s.created_at).toLocaleDateString('zh-TW'),
      score: s.total_score > 0 ? (s.earned_score / s.total_score * 100) : 0,
      totalQuestions: s.total_questions
    }));

    // 最近一次測驗
    const lastSession = sessions?.[0];

    return Response.json({
      success: true,
      data: {
        totalSessions,
        totalQuestions,
        correctAnswers,
        accuracy: Math.round(accuracy * 10) / 10,
        avgScore: Math.round(avgScore * 10) / 10,
        weakConcepts,
        progressTrend,
        lastSession: lastSession ? {
          id: lastSession.id,
          date: lastSession.created_at,
          score: lastSession.earned_score,
          totalScore: lastSession.total_score,
          accuracy: lastSession.total_score > 0 
            ? Math.round((lastSession.earned_score / lastSession.total_score * 100) * 10) / 10
            : 0
        } : null
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
