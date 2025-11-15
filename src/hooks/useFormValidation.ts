/**
 * 表單驗證共用 Hook
 * 提供電子郵件、密碼等常見驗證邏輯
 */

import { useState, useCallback } from 'react';

/**
 * 密碼強度等級
 */
export type PasswordStrength = 'weak' | 'medium' | 'strong';

/**
 * 密碼驗證結果
 */
export interface PasswordValidation {
  length: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar?: boolean;
}

/**
 * 表單驗證 Hook
 */
export function useFormValidation() {
  /**
   * 驗證電子郵件格式
   */
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  /**
   * 驗證密碼（各項檢查）
   */
  const validatePassword = useCallback((password: string): PasswordValidation => {
    return {
      length: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    };
  }, []);

  /**
   * 計算密碼強度
   */
  const getPasswordStrength = useCallback((password: string): PasswordStrength => {
    const validation = validatePassword(password);
    const passedChecks = Object.values(validation).filter(Boolean).length;

    if (passedChecks <= 2) return 'weak';
    if (passedChecks === 3 || passedChecks === 4) return 'medium';
    return 'strong';
  }, [validatePassword]);

  /**
   * 驗證密碼確認是否匹配
   */
  const validatePasswordMatch = useCallback((password: string, confirmPassword: string): boolean => {
    return password === confirmPassword && password.length > 0;
  }, []);

  /**
   * 驗證必填欄位
   */
  const validateRequired = useCallback((value: string): boolean => {
    return value.trim().length > 0;
  }, []);

  /**
   * 驗證長度範圍
   */
  const validateLength = useCallback((value: string, min: number, max?: number): boolean => {
    const length = value.length;
    if (length < min) return false;
    if (max !== undefined && length > max) return false;
    return true;
  }, []);

  /**
   * 驗證數字範圍
   */
  const validateNumberRange = useCallback((value: number, min?: number, max?: number): boolean => {
    if (min !== undefined && value < min) return false;
    if (max !== undefined && value > max) return false;
    return true;
  }, []);

  /**
   * 驗證 URL 格式
   */
  const validateURL = useCallback((url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    validateEmail,
    validatePassword,
    getPasswordStrength,
    validatePasswordMatch,
    validateRequired,
    validateLength,
    validateNumberRange,
    validateURL,
  };
}

/**
 * 密碼強度指示器 Hook
 * 提供視覺化的密碼強度回饋
 */
export function usePasswordStrengthIndicator(password: string) {
  const { validatePassword, getPasswordStrength } = useFormValidation();

  const validation = validatePassword(password);
  const strength = getPasswordStrength(password);

  /**
   * 取得強度顏色
   */
  const getStrengthColor = (): string => {
    switch (strength) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  /**
   * 取得強度文字
   */
  const getStrengthText = (): string => {
    switch (strength) {
      case 'weak':
        return '弱';
      case 'medium':
        return '中等';
      case 'strong':
        return '強';
      default:
        return '';
    }
  };

  /**
   * 取得強度百分比（用於進度條）
   */
  const getStrengthPercentage = (): number => {
    const passedChecks = Object.values(validation).filter(Boolean).length;
    return (passedChecks / Object.keys(validation).length) * 100;
  };

  return {
    validation,
    strength,
    strengthColor: getStrengthColor(),
    strengthText: getStrengthText(),
    strengthPercentage: getStrengthPercentage(),
  };
}

/**
 * 表單錯誤訊息管理 Hook
 */
export function useFormErrors() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setError = useCallback((field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasError = useCallback((field: string): boolean => {
    return field in errors;
  }, [errors]);

  const getError = useCallback((field: string): string | undefined => {
    return errors[field];
  }, [errors]);

  return {
    errors,
    setError,
    clearError,
    clearAllErrors,
    hasError,
    getError,
  };
}

/**
 * 常見錯誤訊息
 */
export const ErrorMessages = {
  EMAIL_REQUIRED: '請輸入電子郵件',
  EMAIL_INVALID: '電子郵件格式不正確',
  PASSWORD_REQUIRED: '請輸入密碼',
  PASSWORD_TOO_SHORT: '密碼至少需要 8 個字元',
  PASSWORD_NO_UPPERCASE: '密碼需包含至少一個大寫字母',
  PASSWORD_NO_LOWERCASE: '密碼需包含至少一個小寫字母',
  PASSWORD_NO_NUMBER: '密碼需包含至少一個數字',
  PASSWORD_MISMATCH: '兩次輸入的密碼不一致',
  REQUIRED_FIELD: '此欄位為必填',
} as const;
