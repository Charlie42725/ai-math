"use client";
import React, { createContext, useContext, useMemo, ReactNode } from "react";
import examDataJson from "@/lib/exam.json";
import { ExamQuestion } from "@/types";

type ExamContextType = {
  examData: ExamQuestion[];
  getQuestionById: (id: number) => ExamQuestion | undefined;
  getQuestionsByGrade: (grade: string) => ExamQuestion[];
  getQuestionsByUnit: (unit: string) => ExamQuestion[];
  getRandomQuestion: () => ExamQuestion | undefined;
  totalQuestions: number;
};

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export function ExamProvider({ children }: { children: ReactNode }) {
  const examData = useMemo(() => examDataJson as unknown as ExamQuestion[], []);

  const contextValue = useMemo<ExamContextType>(() => ({
    examData,

    getQuestionById: (id: number) => {
      return examData.find(q => q.id === id);
    },

    getQuestionsByGrade: (grade: string) => {
      return examData.filter(q => q.grade === grade);
    },

    getQuestionsByUnit: (unit: string) => {
      return examData.filter(q => q.unit.includes(unit));
    },

    getRandomQuestion: () => {
      if (examData.length === 0) return undefined;
      const randomIndex = Math.floor(Math.random() * examData.length);
      return examData[randomIndex];
    },

    totalQuestions: examData.length
  }), [examData]);

  return (
    <ExamContext.Provider value={contextValue}>
      {children}
    </ExamContext.Provider>
  );
}

export function useExam() {
  const context = useContext(ExamContext);
  if (context === undefined) {
    throw new Error("useExam must be used within an ExamProvider");
  }
  return context;
}
