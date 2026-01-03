'use client'

import PracticePageMinimal from '@/components/test/PracticePageMinimal';
import AuthGuard from '@/components/auth/AuthGuard';

export default function TestPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <PracticePageMinimal questions={[]} />
      </div>
    </AuthGuard>
  );
}
