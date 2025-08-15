// src/types/rules.ts
// 规则与分类相关的共享类型

export type Category = "重要" | "广告" | "推广" | "垃圾" | "已发送" | "草稿" | string;

export type Field = "subject" | "from" | "to" | "body" | "hasAttachment" | "category" | "starred";
export type TextOp = "contains" | "not_contains" | "equals" | "starts_with" | "ends_with" | "regex";
export type BoolOp = "is";
export type CategoryOp = "equals" | "in";
export type Operator = TextOp | BoolOp | CategoryOp;

export type Condition = {
  id: string;
  field: Field;
  operator: Operator;
  value: string; // 布尔: "true"/"false"; 多选(in): 逗号分隔
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