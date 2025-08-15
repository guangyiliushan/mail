/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * API通用类型定义
 * 包含请求响应格式、分页、排序等通用类型
 */

// 基础API响应格式
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
  timestamp?: string;
}

// 分页请求参数
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 分页响应数据
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 分页响应
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PaginatedResponse<T> extends ApiResponse<PaginatedData<T>> {}

// 搜索参数
export interface SearchParams extends PaginationParams {
  keyword?: string;
  filters?: Record<string, any>;
}

// 批量操作参数
export interface BulkOperationParams {
  ids: string[];
  action: string;
  params?: Record<string, any>;
}

// 批量操作响应
export interface BulkOperationResult {
  success: number;
  failed: number;
  errors?: Array<{
    id: string;
    error: string;
  }>;
}

// 文件上传响应
export interface FileUploadResponse {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
}

// 认证相关类型
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  verificationCode: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// 邮件相关类型
export interface MailItem {
  id: string;
  subject: string;
  from: MailAddress;
  to: MailAddress[];
  cc?: MailAddress[];
  bcc?: MailAddress[];
  body: string;
  snippet: string;
  date: string;
  read: boolean;
  starred: boolean;
  important: boolean;
  hasAttachment: boolean;
  attachments?: MailAttachment[];
  labels: string[];
  category?: string;
  threadId?: string;
  replyTo?: MailAddress;
}

export interface MailAddress {
  email: string;
  name?: string;
}

export interface MailAttachment {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  contentId?: string;
  inline: boolean;
}

export interface SendMailRequest {
  to: MailAddress[];
  cc?: MailAddress[];
  bcc?: MailAddress[];
  subject: string;
  body: string;
  attachments?: string[]; // 附件ID列表
  replyToId?: string;
  forwardFromId?: string;
}

export interface MailSearchParams extends SearchParams {
  folder?: string;
  category?: string;
  labels?: string[];
  hasAttachment?: boolean;
  starred?: boolean;
  read?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sender?: string;
}

// 设置相关类型
export interface UserSettings {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  emailSignature: string;
  autoReply: {
    enabled: boolean;
    message: string;
    startDate?: string;
    endDate?: string;
  };
  notifications: {
    email: boolean;
    desktop: boolean;
    mobile: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    allowReadReceipts: boolean;
  };
}

export interface UpdateSettingsRequest {
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  timezone?: string;
  emailSignature?: string;
  autoReply?: {
    enabled: boolean;
    message: string;
    startDate?: string;
    endDate?: string;
  };
  notifications?: {
    email: boolean;
    desktop: boolean;
    mobile: boolean;
  };
  privacy?: {
    showOnlineStatus: boolean;
    allowReadReceipts: boolean;
  };
}

// OAuth相关类型
export interface OAuthProvider {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  email?: string;
  connectedAt?: string;
}

export interface OAuthConnectRequest {
  provider: string;
  code: string;
  state?: string;
}

// 标签相关类型
export interface MailLabel {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLabelRequest {
  name: string;
  color: string;
}

export interface UpdateLabelRequest {
  name?: string;
  color?: string;
}

// 规则相关类型（扩展现有的规则类型）
export interface MailRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: RuleCondition[];
  actions: RuleAction[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RuleCondition {
  field: string;
  operator: string;
  value: string;
}

export interface RuleAction {
  type: string;
  arg?: string;
}

export interface CreateRuleRequest {
  name: string;
  enabled: boolean;
  conditions: RuleCondition[];
  actions: RuleAction[];
}

export interface UpdateRuleRequest {
  name?: string;
  enabled?: boolean;
  conditions?: RuleCondition[];
  actions?: RuleAction[];
}