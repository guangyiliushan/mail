/**
 * 认证相关API服务
 * 提供登录、注册、验证码、密码重置等功能
 */

import { apiClient } from '@/shared/api/client';
import type { 
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserProfile 
} from '@/shared/api/types';

export interface VerificationCodeRequest {
  email: string;
  type: 'register' | 'reset_password' | 'login';
}

export interface ResetPasswordRequest {
  email: string;
  verificationCode: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * 认证API服务类
 */
export class AuthApiService {
  /**
   * 用户登录
   */
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('/auth/login', data);
  }

  /**
   * 用户注册
   */
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('/auth/register', data);
  }

  /**
   * 发送验证码
   */
  async sendVerificationCode(data: VerificationCodeRequest): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post('/auth/verification-code', data);
  }

  /**
   * 验证验证码
   */
  async verifyCode(email: string, code: string): Promise<ApiResponse<{ valid: boolean }>> {
    return apiClient.post('/auth/verify-code', { email, code });
  }

  /**
   * 重置密码
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post('/auth/reset-password', data);
  }

  /**
   * 修改密码
   */
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<{ message: string }>> {
    return apiClient.put('/auth/change-password', data);
  }

  /**
   * 刷新访问令牌
   */
  async refreshToken(data: RefreshTokenRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('/auth/refresh', data);
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    return apiClient.get<UserProfile>('/auth/me');
  }

  /**
   * 更新用户资料
   */
  async updateProfile(data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return apiClient.put<UserProfile>('/auth/profile', data);
  }

  /**
   * 用户登出
   */
  async logout(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post('/auth/logout');
  }

  /**
   * 注销账户
   */
  async deleteAccount(password: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete('/auth/account', {
      body: JSON.stringify({ password }),
    });
  }

  /**
   * 检查邮箱是否已存在
   */
  async checkEmailExists(email: string): Promise<ApiResponse<{ exists: boolean }>> {
    return apiClient.get(`/auth/check-email?email=${encodeURIComponent(email)}`);
  }

  /**
   * 验证当前会话
   */
  async validateSession(): Promise<ApiResponse<{ valid: boolean; user?: UserProfile }>> {
    return apiClient.get('/auth/validate');
  }
}

// 导出单例实例
export const authApi = new AuthApiService();
export default authApi;