/**
 * 设置相关API服务
 * 提供用户设置、标签管理、OAuth账号管理等功能
 */

import { apiClient } from '@/shared/api/client';
import type { 
  ApiResponse,
  UserSettings,
  UpdateSettingsRequest,
  MailLabel,
  CreateLabelRequest,
  UpdateLabelRequest,
  OAuthProvider,
  OAuthConnectRequest
} from '@/shared/api/types';

/**
 * 设置API服务类
 */
export class SettingsApiService {
  /**
   * 获取用户设置
   */
  async getUserSettings(): Promise<ApiResponse<UserSettings>> {
    return apiClient.get<UserSettings>('/settings');
  }

  /**
   * 更新用户设置
   */
  async updateSettings(data: UpdateSettingsRequest): Promise<ApiResponse<UserSettings>> {
    return apiClient.put<UserSettings>('/settings', data);
  }

  /**
   * 重置设置为默认值
   */
  async resetSettings(): Promise<ApiResponse<UserSettings>> {
    return apiClient.post<UserSettings>('/settings/reset');
  }

  /**
   * 获取邮件标签列表
   */
  async getLabels(): Promise<ApiResponse<MailLabel[]>> {
    return apiClient.get<MailLabel[]>('/settings/labels');
  }

  /**
   * 创建邮件标签
   */
  async createLabel(data: CreateLabelRequest): Promise<ApiResponse<MailLabel>> {
    return apiClient.post<MailLabel>('/settings/labels', data);
  }

  /**
   * 更新邮件标签
   */
  async updateLabel(id: string, data: UpdateLabelRequest): Promise<ApiResponse<MailLabel>> {
    return apiClient.put<MailLabel>(`/settings/labels/${id}`, data);
  }

  /**
   * 删除邮件标签
   */
  async deleteLabel(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/settings/labels/${id}`);
  }

  /**
   * 获取OAuth提供商列表
   */
  async getOAuthProviders(): Promise<ApiResponse<OAuthProvider[]>> {
    return apiClient.get<OAuthProvider[]>('/settings/oauth/providers');
  }

  /**
   * 连接OAuth账号
   */
  async connectOAuth(data: OAuthConnectRequest): Promise<ApiResponse<{ message: string; provider: OAuthProvider }>> {
    return apiClient.post('/settings/oauth/connect', data);
  }

  /**
   * 断开OAuth账号连接
   */
  async disconnectOAuth(providerId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/settings/oauth/disconnect/${providerId}`);
  }

  /**
   * 获取OAuth授权URL
   */
  async getOAuthAuthUrl(provider: string, redirectUri?: string): Promise<ApiResponse<{ authUrl: string; state: string }>> {
    const params = new URLSearchParams({ provider });
    if (redirectUri) {
      params.append('redirect_uri', redirectUri);
    }
    return apiClient.get(`/settings/oauth/auth-url?${params.toString()}`);
  }

  /**
   * 上传头像
   */
  async uploadAvatar(file: File): Promise<ApiResponse<{ url: string; message: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);

    return apiClient.post('/settings/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * 删除头像
   */
  async deleteAvatar(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete('/settings/avatar');
  }

  /**
   * 导出用户数据
   */
  async exportUserData(): Promise<ApiResponse<{ downloadUrl: string; expiresAt: string }>> {
    return apiClient.post('/settings/export');
  }

  /**
   * 获取账户统计信息
   */
  async getAccountStats(): Promise<ApiResponse<{
    totalEmails: number;
    totalStorage: number;
    usedStorage: number;
    accountAge: number;
    lastLoginAt: string;
  }>> {
    return apiClient.get('/settings/stats');
  }

  /**
   * 获取安全日志
   */
  async getSecurityLogs(page: number = 1, pageSize: number = 20): Promise<ApiResponse<{
    logs: Array<{
      id: string;
      action: string;
      ip: string;
      userAgent: string;
      location?: string;
      createdAt: string;
    }>;
    total: number;
    page: number;
    pageSize: number;
  }>> {
    return apiClient.get(`/settings/security/logs?page=${page}&pageSize=${pageSize}`);
  }

  /**
   * 启用/禁用两步验证
   */
  async toggleTwoFactorAuth(enabled: boolean, code?: string): Promise<ApiResponse<{
    enabled: boolean;
    backupCodes?: string[];
    qrCode?: string;
    message: string;
  }>> {
    return apiClient.post('/settings/security/2fa', { enabled, code });
  }

  /**
   * 生成两步验证备用码
   */
  async generateBackupCodes(): Promise<ApiResponse<{ codes: string[]; message: string }>> {
    return apiClient.post('/settings/security/backup-codes');
  }

  /**
   * 获取活跃会话列表
   */
  async getActiveSessions(): Promise<ApiResponse<Array<{
    id: string;
    ip: string;
    userAgent: string;
    location?: string;
    current: boolean;
    lastActiveAt: string;
    createdAt: string;
  }>>> {
    return apiClient.get('/settings/security/sessions');
  }

  /**
   * 终止指定会话
   */
  async terminateSession(sessionId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/settings/security/sessions/${sessionId}`);
  }

  /**
   * 终止所有其他会话
   */
  async terminateAllOtherSessions(): Promise<ApiResponse<{ message: string; terminatedCount: number }>> {
    return apiClient.delete('/settings/security/sessions/others');
  }
}

// 导出单例实例
export const settingsApi = new SettingsApiService();
export default settingsApi;