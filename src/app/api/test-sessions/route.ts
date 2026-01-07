import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET: 獲取使用者的所有測驗記錄
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

    // 獲取測驗記錄，按時間倒序
    const { data: sessions, error } = await supabase
      .from('test_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('獲取測驗記錄失敗:', error);
      return Response.json(
        { success: false, error: '獲取測驗記錄失敗' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      data: sessions || []
    });
  } catch (error: any) {
    console.error('API错误:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: 保存測驗結果
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, questions, answers, timeSpent, settings } = body;

    if (!userId || !questions || !answers) {
      return Response.json(
        { success: false, error: '缺少必要參數' },
        { status: 400 }
      );
    }

    // 計算總分和得分
    const totalScore = questions.reduce((sum: number, q: any) => sum + q.points, 0);
    const earnedScore = answers.reduce((sum: number, answer: any) => {
      if (answer.isCorrect) {
        const question = questions.find((q: any) => q.id === answer.questionId);
        return sum + (question?.points || 0);
      }
      return sum;
    }, 0);

    // 保存測驗記錄
    const { data: session, error: sessionError } = await supabase
      .from('test_sessions')
      .insert({
        user_id: userId,
        total_questions: questions.length,
        total_score: totalScore,
        earned_score: earnedScore,
        time_spent: timeSpent,
        settings: settings || {},
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (sessionError) {
      console.error('保存測驗記錄失敗:', sessionError);
      return Response.json(
        { success: false, error: '保存測驗記錄失敗' },
        { status: 500 }
      );
    }

    // 保存每題的詳細答案
    const answerRecords = answers.map((answer: any) => {
      const question = questions.find((q: any) => q.id === answer.questionId);
      return {
        session_id: session.id,
        question_id: answer.questionId,
        question_content: question?.content || '',
        question_type: question?.type || 'essay',
        user_answer: answer.answer,
        user_process: answer.process || '',
        correct_answer: question?.correctAnswer || '',
        is_correct: answer.isCorrect || false,
        points: question?.points || 0,
        feedback: answer.feedback || '',
        explanation: answer.explanation || '',
        detailed_analysis: answer.detailedAnalysis || '',
        thinking_process: answer.thinkingProcess || '',
        thinking_score: answer.thinkingScore || 0,
        optimization: answer.optimization || '',
        suggestions: answer.suggestions || [],
        step_by_step_solution: answer.stepByStepSolution || [],
        key_points: answer.keyPoints || []
      };
    });

    const { error: answersError } = await supabase
      .from('test_answers')
      .insert(answerRecords);

    if (answersError) {
      console.error('保存答案記錄失敗:', answersError);
      return Response.json(
        { success: false, error: '保存答案記錄失敗' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      data: {
        sessionId: session.id,
        totalScore,
        earnedScore
      }
    });
  } catch (error: any) {
    console.error('API错误:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
