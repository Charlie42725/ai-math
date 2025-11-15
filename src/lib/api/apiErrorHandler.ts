/**
 * API 錯誤處理統一機制
 * 提供標準化的錯誤類型和處理函數
 */

import { NextResponse } from 'next/server';

/**
 * 標準 API 錯誤類
 */
export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * 常見錯誤類型
 */
export const ErrorCodes = {
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  GEMINI_API_ERROR: 'GEMINI_API_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

/**
 * 標準 API 回應格式
 */
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

/**
 * 創建成功回應
 */
export function createSuccessResponse<T>(
  data: T,
  meta?: APIResponse<T>['meta']
): NextResponse<APIResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  });
}

/**
 * 創建錯誤回應
 */
export function createErrorResponse(
  error: APIError | Error | unknown,
  details?: unknown
): NextResponse<APIResponse> {
  if (error instanceof APIError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code || ErrorCodes.INTERNAL_ERROR,
          message: error.message,
          details,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: error.message,
          details,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An unknown error occurred',
        details: error,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: 500 }
  );
}

/**
 * 統一的 API 路由錯誤處理包裝器
 */
export function withErrorHandler<T>(
  handler: () => Promise<NextResponse<APIResponse<T>>>
): Promise<NextResponse<APIResponse<T>>> {
  return handler().catch((error) => {
    console.error('[API Error]', error);
    return createErrorResponse(error);
  });
}

/**
 * 驗證必要參數
 */
export function validateRequiredParams(
  params: Record<string, unknown>,
  requiredFields: string[]
): void {
  const missingFields = requiredFields.filter((field) => !params[field]);

  if (missingFields.length > 0) {
    throw new APIError(
      400,
      `Missing required parameters: ${missingFields.join(', ')}`,
      ErrorCodes.VALIDATION_ERROR
    );
  }
}
