import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient() {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error('Missing Supabase environment variables');
    }

    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'supabase.auth.token'
      }
    });

    // 監聽錯誤並自動清理無效 token
    if (typeof window !== 'undefined') {
      supabaseInstance.auth.onAuthStateChange((event, session) => {
        if (event === 'TOKEN_REFRESHED' && !session) {
          // Token refresh 失敗，清理本地存儲
          localStorage.removeItem('supabase.auth.token');
          console.warn('Token refresh failed, cleared local storage');
        }
      });
    }
  }
  return supabaseInstance;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    const client = getSupabaseClient();
    return (client as any)[prop];
  }
});

// 清理無效的認證狀態
export async function clearAuthState() {
  try {
    const client = getSupabaseClient();
    await client.auth.signOut({ scope: 'local' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('supabase.auth.token');
      // 清理所有 Supabase auth token
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('supabase') && key.includes('auth')) {
          localStorage.removeItem(key);
        }
      });
    }
    console.log('Auth state cleared successfully');
  } catch (error) {
    console.error('Error clearing auth state:', error);
  }
}
