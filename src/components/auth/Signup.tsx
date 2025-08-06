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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess("註冊成功！請檢查信箱驗證。");
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-[#221a3a] rounded-3xl flex flex-col items-center shadow-lg">
      <h2 className="text-4xl font-bold mb-8 text-center tracking-wide">建立帳戶</h2>
      <form onSubmit={handleSignup} className="w-full flex flex-col gap-6">
        <input
          type="email"
          className="px-6 py-4 rounded-full bg-[#18132a] text-white placeholder:text-[#aaa] focus:outline-none border border-[#4b4b7c] focus:border-indigo-500 text-lg"
          placeholder="電子郵件地址"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="px-6 py-4 rounded-full bg-[#18132a] text-white placeholder:text-[#aaa] focus:outline-none border border-[#4b4b7c] focus:border-indigo-500 text-lg"
          placeholder="密碼"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="py-4 rounded-full bg-black hover:bg-[#18132a] text-white font-bold text-lg transition disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "註冊中..." : "繼續"}
        </button>
        {error && <div className="text-red-400 text-sm text-center">{error}</div>}
        {success && <div className="text-green-400 text-sm text-center">{success}</div>}
      </form>
      <div className="w-full flex flex-col items-center mt-6">
        <div className="text-base text-[#e0e0e0] mb-2">已擁有帳戶？<a href="/login" className="text-indigo-400 hover:underline ml-1">登入</a></div>
        <div className="flex items-center w-full my-4">
          <div className="flex-1 h-px bg-[#333]" />
          <span className="mx-4 text-[#aaa]">或</span>
          <div className="flex-1 h-px bg-[#333]" />
        </div>
        <button className="w-full flex items-center gap-3 px-6 py-3 rounded-full bg-[#18132a] hover:bg-[#28204a] text-white font-medium text-base mb-3 border border-[#444]">
          <span className="text-xl">🌐</span> 使用 Google 帳戶繼續
        </button>
        <button className="w-full flex items-center gap-3 px-6 py-3 rounded-full bg-[#18132a] hover:bg-[#28204a] text-white font-medium text-base mb-3 border border-[#444]">
          <span className="text-xl">🪟</span> 使用 Microsoft 帳戶繼續
        </button>
        <button className="w-full flex items-center gap-3 px-6 py-3 rounded-full bg-[#18132a] hover:bg-[#28204a] text-white font-medium text-base border border-[#444]">
          <span className="text-xl"></span> 使用 Apple 帳戶繼續
        </button>
      </div>
    </div>
  );
}
