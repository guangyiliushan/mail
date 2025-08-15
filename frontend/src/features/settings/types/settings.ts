// src/types/settings.ts
import type { ID } from '@/shared/types/common';

export interface Profile {
  id: ID;
  displayName: string;
  avatarUrl?: string;
  signatureHtml?: string;
}

export type OAuthProvider = 'google' | 'github' | 'microsoft';
