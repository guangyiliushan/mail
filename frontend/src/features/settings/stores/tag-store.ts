export type Tag = {
  id: string;
  name: string;
  color: string; // hex color
  system?: boolean; // 是否内置
};

const KEY = "mail.tags.v1";

const DEFAULT_TAGS: Tag[] = [
  { id: "t1", name: "重要", color: "#ef4444", system: true }, // red-500
  { id: "t2", name: "广告", color: "#8b5cf6", system: true }, // violet-500
  { id: "t3", name: "推广", color: "#10b981", system: true }, // emerald-500
];

function safeParse(json: string | null): Tag[] | null {
  if (!json) return null;
  try {
    const obj = JSON.parse(json);
    if (Array.isArray(obj)) return obj as Tag[];
    return null;
  } catch {
    return null;
  }
}

function read(): Tag[] {
  const parsed = safeParse(typeof window !== "undefined" ? localStorage.getItem(KEY) : null);
  if (parsed && parsed.length >= 0) return parsed;
  return DEFAULT_TAGS;
}

function write(tags: Tag[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(tags));
  }
}

export function listTags(): Tag[] {
  const data = read();
  if (!data || data.length === 0) {
    write(DEFAULT_TAGS);
    return DEFAULT_TAGS;
  }
  return data;
}

export function createTag(name: string, color: string): Tag {
  const id = "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const tags = listTags();
  const next: Tag = { id, name: name.trim(), color: color || "#10b981" };
  write([...tags, next]);
  return next;
}

export function updateTag(id: string, patch: Partial<Omit<Tag, "id">>): Tag | null {
  const tags = listTags();
  const idx = tags.findIndex((t) => t.id === id);
  if (idx < 0) return null;
  const updated: Tag = { ...tags[idx], ...patch, id: tags[idx].id };
  tags[idx] = updated;
  write(tags);
  return updated;
}

export function deleteTag(id: string): boolean {
  const tags = listTags();
  const next = tags.filter((t) => t.id !== id);
  write(next);
  return true;
}

/**
 * 覆盖式保存新的标签顺序（拖拽排序后调用）
 */
export function reorderTags(nextOrder: Tag[]): void {
  // 仅保留必要字段，避免被临时 UI 字段污染
  const cleaned = nextOrder.map((t) => ({ id: t.id, name: t.name, color: t.color, system: t.system }));
  write(cleaned);
}