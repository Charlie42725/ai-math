import React from "react";
import Link from "next/link";

export default function Section() {
  return (
    <section className="w-full flex flex-col items-center justify-center py-16 bg-[#e6dbfa] min-h-[70vh]">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 text-black">
        AI Math is your always-available<br />essay reviewer.
      </h1>
      <Link
        href="/chat"
        className="mt-8 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold rounded-full shadow transition-colors duration-200"
      >
        開始學習
      </Link>
    </section>
  );
}
