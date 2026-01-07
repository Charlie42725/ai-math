'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import NavigationBar from '@/components/test/NavigationBar';
import TestSessionDetail from '@/components/test/TestSessionDetail';

export default function TestSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  return (
    <AuthGuard>
      <NavigationBar />
      <div className="min-h-screen bg-stone-50">
        <TestSessionDetail sessionId={sessionId} />
      </div>
    </AuthGuard>
  );
}
