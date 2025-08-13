// src/types/common.ts
export type ID = string;
export type Timestamp = string;

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

export type ApiResult<T> = { data: T; error?: string };
