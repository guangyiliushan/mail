/**
 * 邮件相关API服务
 * 提供邮件列表、发送、搜索、分类等功能
 */

import { apiClient } from '@/shared/api/client';
import type { 
  ApiResponse,
  PaginatedResponse,
  BulkOperationParams,
  BulkOperationResult,
  MailItem,
  SendMailRequest,
  MailSearchParams,
  FileUploadResponse
} from '@/shared/api/types';

export interface MailFolder {
  id: string;
  name: string;
  type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'custom';
  unreadCount: number;
  totalCount: number;
  icon?: string;
  color?: string;
}

export interface MailThread {
  id: string;
  subject: string;
  participants: string[];
  messageCount: number;
  unreadCount: number;
  lastMessageDate: string;
  messages: MailItem[];
  labels: string[];
  starred: boolean;
}

export interface DraftSaveRequest {
  id?: string;
  to?: string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  body?: string;
  attachments?: string[];
}

/**
 * 邮件API服务类
 */
export class MailApiService {
  /**
   * 获取邮件文件夹列表
   */
  async getFolders(): Promise<ApiResponse<MailFolder[]>> {
    return apiClient.get<MailFolder[]>('/mail/folders');
  }

  /**
   * 获取邮件列表
   */
  async getMailList(params: MailSearchParams): Promise<PaginatedResponse<MailItem>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, String(v)));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });

    return apiClient.get(`/mail/list?${queryParams.toString()}`);
  }

  /**
   * 获取单封邮件详情
   */
  async getMailById(id: string): Promise<ApiResponse<MailItem>> {
    return apiClient.get<MailItem>(`/mail/${id}`);
  }

  /**
   * 获取邮件线程
   */
  async getMailThread(threadId: string): Promise<ApiResponse<MailThread>> {
    return apiClient.get<MailThread>(`/mail/thread/${threadId}`);
  }

  /**
   * 发送邮件
   */
  async sendMail(data: SendMailRequest): Promise<ApiResponse<{ id: string; message: string }>> {
    return apiClient.post('/mail/send', data);
  }

  /**
   * 保存草稿
   */
  async saveDraft(data: DraftSaveRequest): Promise<ApiResponse<{ id: string; message: string }>> {
    if (data.id) {
      return apiClient.put(`/mail/drafts/${data.id}`, data);
    } else {
      return apiClient.post('/mail/drafts', data);
    }
  }

  /**
   * 获取草稿列表
   */
  async getDrafts(): Promise<ApiResponse<MailItem[]>> {
    return apiClient.get<MailItem[]>('/mail/drafts');
  }

  /**
   * 删除草稿
   */
  async deleteDraft(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/mail/drafts/${id}`);
  }

  /**
   * 标记邮件为已读/未读
   */
  async markAsRead(ids: string[], read: boolean): Promise<ApiResponse<BulkOperationResult>> {
    return apiClient.post('/mail/mark-read', { ids, read });
  }

  /**
   * 标记邮件为星标/取消星标
   */
  async markAsStarred(ids: string[], starred: boolean): Promise<ApiResponse<BulkOperationResult>> {
    return apiClient.post('/mail/mark-starred', { ids, starred });
  }

  /**
   * 移动邮件到文件夹
   */
  async moveToFolder(ids: string[], folderId: string): Promise<ApiResponse<BulkOperationResult>> {
    return apiClient.post('/mail/move', { ids, folderId });
  }

  /**
   * 删除邮件（移到垃圾箱）
   */
  async deleteMails(ids: string[]): Promise<ApiResponse<BulkOperationResult>> {
    return apiClient.post('/mail/delete', { ids });
  }

  /**
   * 永久删除邮件
   */
  async permanentlyDelete(ids: string[]): Promise<ApiResponse<BulkOperationResult>> {
    return apiClient.post('/mail/permanent-delete', { ids });
  }

  /**
   * 恢复邮件（从垃圾箱）
   */
  async restoreMails(ids: string[]): Promise<ApiResponse<BulkOperationResult>> {
    return apiClient.post('/mail/restore', { ids });
  }

  /**
   * 批量操作
   */
  async bulkOperation(params: BulkOperationParams): Promise<ApiResponse<BulkOperationResult>> {
    return apiClient.post('/mail/bulk', params);
  }

  /**
   * 搜索邮件
   */
  async searchMails(params: MailSearchParams): Promise<PaginatedResponse<MailItem>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, String(v)));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });

    return apiClient.get(`/mail/search?${queryParams.toString()}`);
  }

  /**
   * 获取搜索建议
   */
  async getSearchSuggestions(query: string): Promise<ApiResponse<string[]>> {
    return apiClient.get(`/mail/search/suggestions?q=${encodeURIComponent(query)}`);
  }

  /**
   * 上传附件
   */
  async uploadAttachment(file: File): Promise<ApiResponse<FileUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post('/mail/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * 下载附件
   */
  async downloadAttachment(attachmentId: string): Promise<Blob> {
    const baseURL = process.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    const response = await fetch(`${baseURL}/mail/attachments/${attachmentId}/download`, {
      headers: {
        'Authorization': localStorage.getItem('auth_token') ? `Bearer ${localStorage.getItem('auth_token')}` : '',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to download attachment');
    }
    
    return response.blob();
  }

  /**
   * 获取邮件统计信息
   */
  async getMailStats(): Promise<ApiResponse<{
    total: number;
    unread: number;
    starred: number;
    drafts: number;
    spam: number;
    trash: number;
  }>> {
    return apiClient.get('/mail/stats');
  }

  /**
   * 标记垃圾邮件
   */
  async markAsSpam(ids: string[]): Promise<ApiResponse<BulkOperationResult>> {
    return apiClient.post('/mail/mark-spam', { ids });
  }

  /**
   * 取消垃圾邮件标记
   */
  async unmarkAsSpam(ids: string[]): Promise<ApiResponse<BulkOperationResult>> {
    return apiClient.post('/mail/unmark-spam', { ids });
  }

  /**
   * 训练垃圾邮件过滤器
   */
  async trainSpamFilter(mailId: string, isSpam: boolean): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post('/mail/train-spam', { mailId, isSpam });
  }
}

// 导出单例实例
export const mailApi = new MailApiService();
export default mailApi;