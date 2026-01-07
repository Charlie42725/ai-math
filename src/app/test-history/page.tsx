'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { DEV_MODE, ADMIN_USER } from '@/lib/devAuth';
import AuthGuard from '@/components/auth/AuthGuard';
import NavigationBar from '@/components/test/NavigationBar';
import TestReview from '@/components/test/TestReview';

export default function TestHistoryPage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      if (DEV_MODE) {
        setUserId(ADMIN_USER.id);
        return;
      }

      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id ?? null);
    };
    getUser();

    if (!DEV_MODE) {
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUserId(session?.user?.id ?? null);
      });
      return () => {
        listener?.subscription.unsubscribe();
      };
    }
  }, []);

  return (
    <AuthGuard>
      <NavigationBar />
      <div className="min-h-screen bg-stone-50">
        {userId ? (
          <TestReview userId={userId} />
        ) : (
          <div className="flex items-center justify-center h-screen">
            <div className="text-stone-600">載入中...</div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
