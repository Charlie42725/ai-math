'use client'

import PracticePageMinimal from '@/components/test/PracticePageMinimal';
import { getTotalQuestionCount } from '@/lib/questionBank';

export default function TestPage() {
  const totalQuestions = getTotalQuestionCount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">數學模擬考試</h1>
          <p className="text-gray-600">題庫總數：{totalQuestions} 題</p>
        </div>
        <PracticePageMinimal questions={[]} />
      </div>
    </div>
  );
}
