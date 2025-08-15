/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 统一HTTP客户端配置
 * 提供基础的请求配置、拦截器和错误处理
 */

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
  timestamp?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  status?: number;
}

class ApiClient {
  private config: ApiConfig;
  private token: string | null = null;

  constructor(config: ApiConfig) {
    this.config = config;
    this.loadToken();
  }

  private loadToken(): void {
    this.token = localStorage.getItem('auth_token');
  }

  private getHeaders(): Record<string, string> {
    const headers = { ...this.config.headers };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  setToken(token: string | null): void {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    data?: any,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const fullUrl = `${this.config.baseURL}${url}`;
    console.log(`[API] ${method} ${fullUrl}`, data);
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...this.getHeaders(),
        ...options?.headers,
      },
      ...options,
    };

    if (data && method !== 'GET') {
      requestOptions.body = JSON.stringify(data);
    }

    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
      
      // 模拟API响应（实际项目中这里会是真实的fetch调用）
      const mockResponse = this.createMockResponse<T>(method, url, data);
      
      return mockResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private createMockResponse<T>(method: string, url: string, data?: any): ApiResponse<T> {
    // 这里是模拟响应，实际项目中会被真实的API调用替换
    console.log(`[API Mock] ${method} ${url}`, data);
    
    return {
      success: true,
      data: {} as T,
      message: 'Mock response',
      timestamp: new Date().toISOString(),
    };
  }

  private handleError(error: any): ApiError {
    if (error instanceof Error) {
      return {
        code: 'NETWORK_ERROR',
        message: error.message,
        details: error,
      };
    }
    
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      details: error,
    };
  }

  // 便捷方法
  get<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, undefined, options);
  }

  post<T>(url: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data, options);
  }

  put<T>(url: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data, options);
  }

  delete<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, undefined, options);
  }

  patch<T>(url: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', url, data, options);
  }
}

// 默认配置
const defaultConfig: ApiConfig = {
  baseURL: process.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// 导出单例实例
export const apiClient = new ApiClient(defaultConfig);
export default apiClient;