/**
 * 规则引擎（前端 Mock）
 * - 统一加载/合并规则来源
 * - 条件匹配：文本/布尔/分类/正则
 * - 动作应用：移动分类、标记已读/未读、加星/去星、删除(移至垃圾)
 * - 返回变更统计以避免无意义 setState 造成循环
 */

export type Field = "subject" | "from" | "to" | "body" | "hasAttachment" | "category" | "starred";
export type TextOp = "contains" | "not_contains" | "equals" | "starts_with" | "ends_with" | "regex";
export type BoolOp = "is";
export type CategoryOp = "equals" | "in";
export type Operator = TextOp | BoolOp | CategoryOp;

export type Condition = {
  id: string;
  field: Field;
  operator: Operator;
  value: string; // 对于布尔: "true"/"false"; 多选(in): 逗号分隔
};

export type ActionType = "move_to" | "mark_read" | "mark_starred" | "delete";
export type Action = {
  id: string;
  type: ActionType;
  arg?: string; // move_to: 目标分类；mark_*: "true"/"false"
};

export type Rule = {
  id: string;
  name: string;
  enabled: boolean;
  conditions: Condition[];
  actions: Action[];
  updatedAt: number;
};

export type MailLike = {
  id: string;
  subject: string;
  from: string;
  to?: string;
  body?: string;
  snippet?: string;
  date?: string;
  ts?: number;
  read?: boolean;
  starred?: boolean;
  hasAttachment?: boolean;
  category?: string; // "重要" | "广告" | "推广" | "垃圾" | undefined
};

const LS_LIST_KEY = "mail_rules_all";
const LS_SINGLE_KEY = "mail_rule_last";

/**
 * 加载所有有效规则（合并规则列表与构建器最近一次保存的单条规则）
 */
export function loadAllRules(): Rule[] {
  let list: Rule[] = [];
  try {
    const raw = localStorage.getItem(LS_LIST_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) list = arr as Rule[];
    }
  } catch {
    // ignore
  }

  try {
    const rawOne = localStorage.getItem(LS_SINGLE_KEY);
    if (rawOne) {
      const one = JSON.parse(rawOne) as Rule | null;
      if (one && one.id) {
        // 若同 id 已存在则按更新日期择新
        const idx = list.findIndex((r) => r.id === one.id);
        if (idx >= 0) {
          if ((one.updatedAt ?? 0) > (list[idx].updatedAt ?? 0)) {
            list[idx] = one;
          }
        } else {
          list.push(one);
        }
      }
    }
  } catch {
    // ignore
  }

  // 仅返回启用规则
  return list.filter((r) => r && r.enabled !== false);
}

function checkCond(mail: Record<string, any>, c: Condition): boolean {
  const v = mail[c.field];
  const input = c.value ?? "";

  switch (c.field) {
    case "subject":
    case "from":
    case "to":
    case "body": {
      const text = String(v ?? "");
      const q = input;
      switch (c.operator as TextOp) {
        case "contains":
          return text.toLowerCase().includes(q.toLowerCase());
        case "not_contains":
          return !text.toLowerCase().includes(q.toLowerCase());
        case "equals":
          return text === q;
        case "starts_with":
          return text.startsWith(q);
        case "ends_with":
          return text.endsWith(q);
        case "regex":
          try {
            const reg = new RegExp(q);
            return reg.test(text);
          } catch {
            return false;
          }
      }
      return false;
    }
    case "hasAttachment":
    case "starred": {
      const bool = input === "true";
      return (v === true) === bool;
    }
    case "category": {
      if ((c.operator as CategoryOp) === "equals") {
        return String(v ?? "") === input;
      } else {
        const set = input.split(",").map((s) => s.trim()).filter(Boolean);
        return set.includes(String(v ?? ""));
      }
    }
  }
}

/**
 * 对单封邮件应用规则，返回是否匹配/是否变更及新邮件
 */
function applyRulesToMail(mail: MailLike, rules: Rule[]) {
  let changed = false;
  let matched = false;
  let next: MailLike = mail;

  for (const rule of rules) {
    if (!rule.enabled) continue;
    const pass = rule.conditions.length === 0 || rule.conditions.every((c) => checkCond(next as any, c));
    if (!pass) continue;

    matched = true;

    for (const act of rule.actions) {
      switch (act.type) {
        case "move_to": {
          const to = act.arg ?? "";
          if (to && next.category !== to) {
            next = { ...next, category: to };
            changed = true;
          }
          break;
        }
        case "mark_read": {
          const val = (act.arg ?? "true") === "true";
          if (next.read !== val) {
            next = { ...next, read: val };
            changed = true;
          }
          break;
        }
        case "mark_starred": {
          const val = (act.arg ?? "true") === "true";
          if (next.starred !== val) {
            next = { ...next, starred: val };
            changed = true;
          }
          break;
        }
        case "delete": {
          if (next.category !== "垃圾") {
            next = { ...next, category: "垃圾" };
            changed = true;
          }
          break;
        }
      }
    }
  }

  return { next, matched, changed };
}

/**
 * 对列表应用规则。
 * 返回：
 * - updated：更新后的邮件列表（保序）
 * - matchedIds：命中过规则的邮件 id 集合（用于高亮/统计）
 * - changed：是否有任何邮件发生变更（用于避免无意义 setState 循环）
 * - summary：变更摘要（移动/已读/加星/删除的数量估算）
 */
export function evaluateAndApplyRules(mails: MailLike[], rules?: Rule[]) {
  const r = (rules ?? loadAllRules()).filter(Boolean);
  if (r.length === 0) {
    return { updated: mails, matchedIds: new Set<string>(), changed: false, summary: "" };
  }

  let anyChanged = false;
  const matched = new Set<string>();

  // 粗略统计（基于前/后状态对比）
  let moved = 0;
  let readChanged = 0;
  let starChanged = 0;
  let deleted = 0;

  const updated = mails.map((m) => {
    const before = m;
    const { next, matched: hit, changed } = applyRulesToMail(before, r);
    if (hit) matched.add(m.id);
    if (changed) {
      anyChanged = true;
      if (before.category !== next.category) {
        if (next.category === "垃圾") deleted++;
        else moved++;
      }
      if (before.read !== next.read) readChanged++;
      if (before.starred !== next.starred) starChanged++;
    }
    return changed ? next : before;
  });

  const segments: string[] = [];
  if (moved > 0) segments.push(`搬移 ${moved}`);
  if (deleted > 0) segments.push(`删除 ${deleted}`);
  if (readChanged > 0) segments.push(`已读变更 ${readChanged}`);
  if (starChanged > 0) segments.push(`星标变更 ${starChanged}`);
  const summary = segments.join(" · ");

  return { updated, matchedIds: matched, changed: anyChanged, summary };
}