export type ComposeDraft = {
  to: string;
  cc: string;
  subject: string;
  html: string;
  updatedAt: number;
};

const KEY = "compose_draft_v1";

/**
 * 模拟异步保存草稿（写入 localStorage），可替换为真实 API。
 */
export async function saveDraft(draft: Omit<ComposeDraft, "updatedAt">) {
  const data: ComposeDraft = { ...draft, updatedAt: Date.now() };
  // 模拟网络延迟
  await new Promise((r) => setTimeout(r, 500));
  localStorage.setItem(KEY, JSON.stringify(data));
  return data;
}

/**
 * 读取草稿（如不存在返回 null）
 */
export function loadDraft(): ComposeDraft | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ComposeDraft) : null;
  } catch {
    return null;
  }
}

/**
 * 清除草稿（用于发送成功后）
 */
export function clearDraft() {
  localStorage.removeItem(KEY);
}