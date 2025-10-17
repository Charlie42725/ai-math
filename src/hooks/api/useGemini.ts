import { useState, useCallback } from "react";
import { GeminiResponse, Message } from "@/types";

type UseGeminiOptions = {
  onSuccess?: (result: string) => void;
  onError?: (error: string) => void;
};

export function useGemini(options?: UseGeminiOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callText = useCallback(async (messages: Message[]): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const result = data.result || "No response";
      options?.onSuccess?.(result);
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      options?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const callVision = useCallback(async (base64Image: string, prompt: string): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image, prompt })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const result = data.result || "No response";
      options?.onSuccess?.(result);
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      options?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    callText,
    callVision,
    loading,
    error,
    reset
  };
}
