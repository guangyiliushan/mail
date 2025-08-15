// src/types/mail.ts
import type { ID, Timestamp, Pagination } from '../../../shared/types/common';

export interface Recipient {
  name?: string;
  email: string;
}

export interface Attachment {
  id: ID;
  name: string;
  size: number; // bytes
  mime: string;
  url?: string;
}

export interface MailItem {
  id: ID;
  subject: string;
  from: Recipient;
  to: Recipient[];
  cc?: Recipient[];
  bcc?: Recipient[];
  bodyHtml?: string;
  bodyText?: string;
  tags?: string[];
  hasAttachment?: boolean;
  createdAt: Timestamp;
  read?: boolean;
  folder: 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | string;
}

export interface MailListQuery {
  folder?: MailItem['folder'];
  keyword?: string;
  tag?: string;
  sort?: 'date_desc' | 'date_asc';
  pagination: Pick<Pagination, 'page' | 'pageSize'>;
}

export type FolderViewType = 'drafts' | 'sent';