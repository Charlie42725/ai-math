"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess("登入成功！");
      setTimeout(() => {
        router.push("/chat");
      }, 800);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 md:p-8 bg-[#221a3a] rounded-3xl flex flex-col items-center shadow-lg">
      <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-center tracking-wide">登入</h2>
      <form onSubmit={handleLogin} className="w-full flex flex-col gap-4 md:gap-6">
        <input
          type="email"
          className="px-4 md:px-6 py-3 md:py-4 rounded-full bg-[#18132a] text-white placeholder:text-[#aaa] focus:outline-none border border-[#4b4b7c] focus:border-indigo-500 text-base md:text-lg"
          placeholder="電子郵件地址"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="px-4 md:px-6 py-3 md:py-4 rounded-full bg-[#18132a] text-white placeholder:text-[#aaa] focus:outline-none border border-[#4b4b7c] focus:border-indigo-500 text-base md:text-lg"
          placeholder="密碼"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="py-3 md:py-4 rounded-full bg-black hover:bg-[#18132a] text-white font-bold text-base md:text-lg transition disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "登入中..." : "繼續"}
        </button>
        {error && <div className="text-red-400 text-sm text-center">{error}</div>}
        {success && <div className="text-green-400 text-sm text-center">{success}</div>}
      </form>
      <div className="w-full flex flex-col items-center mt-4 md:mt-6">
        <div className="text-sm md:text-base text-[#e0e0e0] mb-2">還沒有帳戶？<a href="/signup" className="text-indigo-400 hover:underline ml-1">註冊</a></div>
        <div className="flex items-center w-full my-3 md:my-4">
          <div className="flex-1 h-px bg-[#333]" />
          <span className="mx-3 md:mx-4 text-[#aaa] text-sm md:text-base">或</span>
          <div className="flex-1 h-px bg-[#333]" />
        </div>
        <button className="w-full flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 md:py-3 rounded-full bg-[#18132a] hover:bg-[#28204a] text-white font-medium text-sm md:text-base mb-2 md:mb-3 border border-[#444]">
          <span className="text-lg md:text-xl">🌐</span> <span className="hidden sm:inline">使用 </span>Google<span className="hidden sm:inline"> 帳戶繼續</span>
        </button>
        <button className="w-full flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 md:py-3 rounded-full bg-[#18132a] hover:bg-[#28204a] text-white font-medium text-sm md:text-base mb-2 md:mb-3 border border-[#444]">
          <span className="text-lg md:text-xl">🪟</span> <span className="hidden sm:inline">使用 </span>Microsoft<span className="hidden sm:inline"> 帳戶繼續</span>
        </button>
        <button className="w-full flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 md:py-3 rounded-full bg-[#18132a] hover:bg-[#28204a] text-white font-medium text-sm md:text-base border border-[#444]">
          <span className="text-lg md:text-xl"></span> <span className="hidden sm:inline">使用 </span>Apple<span className="hidden sm:inline"> 帳戶繼續</span>
        </button>
      </div>
    </div>
  );
}
