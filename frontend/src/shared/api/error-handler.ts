/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 统一错误处理机制
 * 提供错误类型定义、错误处理函数和用户友好的错误消息
 */

export const ApiErrorCode = {
  // 网络错误
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  
  // 认证错误
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  FORBIDDEN: 'FORBIDDEN',
  
  // 业务错误
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  
  // 服务器错误
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // 未知错误
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ApiErrorCode = typeof ApiErrorCode[keyof typeof ApiErrorCode];

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: any;
  status?: number;
  field?: string; // 用于表单验证错误
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * 错误消息映射表
 */
const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  [ApiErrorCode.NETWORK_ERROR]: '网络连接失败，请检查网络设置',
  [ApiErrorCode.TIMEOUT]: '请求超时，请稍后重试',
  [ApiErrorCode.UNAUTHORIZED]: '未授权访问，请重新登录',
  [ApiErrorCode.TOKEN_EXPIRED]: '登录已过期，请重新登录',
  [ApiErrorCode.FORBIDDEN]: '权限不足，无法访问该资源',
  [ApiErrorCode.VALIDATION_ERROR]: '输入信息有误，请检查后重试',
  [ApiErrorCode.NOT_FOUND]: '请求的资源不存在',
  [ApiErrorCode.CONFLICT]: '操作冲突，请刷新后重试',
  [ApiErrorCode.INTERNAL_ERROR]: '服务器内部错误，请稍后重试',
  [ApiErrorCode.SERVICE_UNAVAILABLE]: '服务暂时不可用，请稍后重试',
  [ApiErrorCode.UNKNOWN_ERROR]: '未知错误，请联系技术支持',
};

/**
 * 根据HTTP状态码映射错误类型
 */
export function mapHttpStatusToErrorCode(status: number): ApiErrorCode {
  switch (status) {
    case 400:
      return ApiErrorCode.VALIDATION_ERROR;
    case 401:
      return ApiErrorCode.UNAUTHORIZED;
    case 403:
      return ApiErrorCode.FORBIDDEN;
    case 404:
      return ApiErrorCode.NOT_FOUND;
    case 409:
      return ApiErrorCode.CONFLICT;
    case 500:
      return ApiErrorCode.INTERNAL_ERROR;
    case 503:
      return ApiErrorCode.SERVICE_UNAVAILABLE;
    default:
      if (status >= 400 && status < 500) {
        return ApiErrorCode.VALIDATION_ERROR;
      } else if (status >= 500) {
        return ApiErrorCode.INTERNAL_ERROR;
      }
      return ApiErrorCode.UNKNOWN_ERROR;
  }
}

/**
 * 创建API错误对象
 */
export function createApiError(
  code: ApiErrorCode,
  message?: string,
  details?: any,
  status?: number,
  field?: string
): ApiError {
  return {
    code,
    message: message || ERROR_MESSAGES[code],
    details,
    status,
    field,
  };
}

/**
 * 处理网络错误
 */
export function handleNetworkError(error: any): ApiError {
  if (error.name === 'AbortError') {
    return createApiError(ApiErrorCode.TIMEOUT);
  }
  
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return createApiError(ApiErrorCode.NETWORK_ERROR);
  }
  
  return createApiError(ApiErrorCode.UNKNOWN_ERROR, error.message, error);
}

/**
 * 处理HTTP响应错误
 */
export function handleHttpError(response: Response, data?: any): ApiError {
  const code = mapHttpStatusToErrorCode(response.status);
  
  // 尝试从响应数据中提取错误信息
  let message = ERROR_MESSAGES[code];
  let field: string | undefined;
  
  if (data) {
    if (typeof data.message === 'string') {
      message = data.message;
    }
    
    if (typeof data.field === 'string') {
      field = data.field;
    }
  }
  
  return createApiError(code, message, data, response.status, field);
}

/**
 * 处理验证错误
 */
export function handleValidationErrors(errors: ValidationError[]): ApiError {
  const firstError = errors[0];
  return createApiError(
    ApiErrorCode.VALIDATION_ERROR,
    firstError?.message || ERROR_MESSAGES[ApiErrorCode.VALIDATION_ERROR],
    errors,
    400,
    firstError?.field
  );
}

/**
 * 获取用户友好的错误消息
 */
export function getUserFriendlyMessage(error: ApiError): string {
  return error.message || ERROR_MESSAGES[error.code];
}

/**
 * 判断是否为认证相关错误
 */
export function isAuthError(error: ApiError): boolean {
  return [
    ApiErrorCode.UNAUTHORIZED,
    ApiErrorCode.TOKEN_EXPIRED,
    ApiErrorCode.FORBIDDEN,
  ].includes(error.code as any);
}

/**
 * 判断是否为网络相关错误
 */
export function isNetworkError(error: ApiError): boolean {
  return [
    ApiErrorCode.NETWORK_ERROR,
    ApiErrorCode.TIMEOUT,
    ApiErrorCode.SERVICE_UNAVAILABLE,
  ].includes(error.code as any);
}

/**
 * 判断是否为可重试的错误
 */
export function isRetryableError(error: ApiError): boolean {
  return [
    ApiErrorCode.NETWORK_ERROR,
    ApiErrorCode.TIMEOUT,
    ApiErrorCode.INTERNAL_ERROR,
    ApiErrorCode.SERVICE_UNAVAILABLE,
  ].includes(error.code as any);
}

/**
 * 错误日志记录
 */
export function logError(error: ApiError, context?: string): void {
  const logData = {
    code: error.code,
    message: error.message,
    status: error.status,
    field: error.field,
    context,
    timestamp: new Date().toISOString(),
    details: error.details,
  };
  
  console.error('[API Error]', logData);
  
  // 在生产环境中，这里可以发送错误日志到监控服务
  if (process.env.NODE_ENV === 'production') {
    // 发送到错误监控服务（如 Sentry）
    // sendErrorToMonitoring(logData);
  }
}