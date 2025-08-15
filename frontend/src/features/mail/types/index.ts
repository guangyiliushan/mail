// 重新导出原有的类型定义
export type { Category } from "../../../types/rules";
import type { Category } from "../../../types/rules";

// 邮件相关类型定义
export type MockMail = {
  id: string;
  subject: string;
  from: string;
  to?: string;
  cc?: string;
  bcc?: string;
  snippet: string;
  date: string;
  ts: number;
  starred?: boolean;
  category?: Category;
  read?: boolean;
  deleted?: boolean;
};

// 导出所有组件类型
export type { FilterBarProps } from "../components/list/filter-bar";
export type { BulkToolbarProps } from "../components/list/bulk-toolbar";
export type { MailListProps } from "../components/list/mail-list";
export type { ReaderPaneProps } from "../components/reader/reader-pane";