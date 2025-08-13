import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "../../components/ui/select";
import { toast } from "sonner";
import { Plus, Minus, Filter, Wand2, Play } from "lucide-react";
import { cn } from "../../lib/utils";

type Field = "subject" | "from" | "to" | "body" | "hasAttachment" | "category" | "starred";
type TextOp = "contains" | "not_contains" | "equals" | "starts_with" | "ends_with" | "regex";
type BoolOp = "is";
type CategoryOp = "equals" | "in";
type Operator = TextOp | BoolOp | CategoryOp;

type Condition = {
  id: string;
  field: Field;
  operator: Operator;
  value: string; // 对于布尔: "true"/"false"; 对于多选: 逗号分隔
};

type ActionType = "move_to" | "mark_read" | "mark_starred" | "delete";
type Action = {
  id: string;
  type: ActionType;
  arg?: string; // move_to: 类别
};

const CATEGORIES = ["重要", "广告", "推广", "垃圾"];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function RulesBuilder() {
  const [enabled, setEnabled] = useState(true);
  const [name, setName] = useState("我的规则");
  const [conditions, setConditions] = useState<Condition[]>([
    { id: uid(), field: "subject", operator: "contains", value: "发票" },
  ]);
  const [actions, setActions] = useState<Action[]>([
    { id: uid(), type: "move_to", arg: "重要" },
  ]);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const addCondition = () =>
    setConditions((list) => [
      ...list,
      { id: uid(), field: "subject", operator: "contains", value: "" },
    ]);

  const removeCondition = (id: string) =>
    setConditions((list) => list.filter((c) => c.id !== id));

  const updateCondition = (id: string, patch: Partial<Condition>) =>
    setConditions((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const addAction = () =>
    setActions((list) => [...list, { id: uid(), type: "mark_read", arg: "true" }]);

  const removeAction = (id: string) =>
    setActions((list) => list.filter((a) => a.id !== id));

  const updateAction = (id: string, patch: Partial<Action>) =>
    setActions((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  // 预览文案
  const preview = useMemo(() => {
    const conds = conditions.map((c) => {
      const fieldMap: Record<Field, string> = {
        subject: "主题",
        from: "发件人",
        to: "收件人",
        body: "正文",
        hasAttachment: "有附件",
        category: "分类",
        starred: "星标",
      };
      const opMap: Record<Operator, string> = {
        contains: "包含",
        not_contains: "不包含",
        equals: "等于",
        starts_with: "开头为",
        ends_with: "结尾为",
        regex: "匹配正则",
        is: "为",
        in: "属于",
      };
      let val = c.value;
      if (c.field === "hasAttachment" || c.field === "starred") {
        val = c.value === "true" ? "是" : "否";
      }
      return `${fieldMap[c.field]} ${opMap[c.operator]} ${val || "（空）"}`;
    });
    const acts = actions.map((a) => {
      switch (a.type) {
        case "move_to":
          return `移动到「${a.arg || "未指定"}」`;
        case "mark_read":
          return a.arg === "true" ? "标记已读" : "标记未读";
        case "mark_starred":
          return a.arg === "true" ? "加星标" : "去星标";
        case "delete":
          return "删除邮件";
      }
    });
    return { conds, acts };
  }, [conditions, actions]);

  // 简单测试：对一封 mock 邮件进行匹配
  async function handleTest() {
    setTesting(true);
    try {
      const mock = {
        subject: "发票开具提醒",
        from: "finance@example.com",
        to: "you@example.com",
        body: "您七月账期的增值税专用发票已开具…",
        hasAttachment: false,
        category: "重要",
        starred: false,
      } as Record<string, any>;

      const pass = conditions.every((c) => checkCond(mock, c));
      if (pass) {
        toast.success("测试匹配：通过（这封示例邮件将触发规则）");
      } else {
        toast.info("测试匹配：未通过（这封示例邮件不满足条件）");
      }
    } finally {
      setTesting(false);
    }
  }

  function checkCond(mail: Record<string, any>, c: Condition) {
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
        const bool = c.value === "true";
        return (v === true) === bool;
      }
      case "category": {
        if ((c.operator as CategoryOp) === "equals") {
          return String(v) === input;
        } else {
          const set = input.split(",").map((s) => s.trim()).filter(Boolean);
          return set.includes(String(v));
        }
      }
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      // 模拟保存：仅本地存储
      const payload = { name, enabled, conditions, actions, updatedAt: Date.now() };
      localStorage.setItem("mail_rule_last", JSON.stringify(payload));
      toast.success("规则已保存");
    } catch {
      toast.error("保存失败，请稍后再试");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">过滤规则构建器</h2>
            <p className="text-sm text-muted-foreground">按条件筛选邮件并执行相应动作。支持文本、布尔和分类等类型。</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="rule-enabled" className="text-sm text-muted-foreground">启用</Label>
          <Switch id="rule-enabled" checked={enabled} onCheckedChange={setEnabled} />
        </div>
      </div>

      <Card className="p-4 space-y-4">
        {/* 基本信息 */}
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="rule-name">规则名称</Label>
            <Input id="rule-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="如：发票自动归档到重要" />
          </div>
          <div className="space-y-2">
            <Label>状态</Label>
            <div className={cn("h-10 rounded-md border grid place-items-center text-sm",
              enabled ? "text-emerald-600/90 bg-emerald-500/5" : "text-muted-foreground bg-muted/50")}>
              {enabled ? "已启用" : "未启用"}
            </div>
          </div>
        </div>

        <Separator />

        {/* 条件 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">条件（满足全部条件时触发）</div>
            <Button size="sm" variant="secondary" className="gap-1" onClick={addCondition}>
              <Plus className="h-4 w-4" />
              添加条件
            </Button>
          </div>

          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {conditions.map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="grid gap-2 md:grid-cols-[160px_160px_1fr_40px]"
                >
                  {/* 字段 */}
                  <Select
                    value={c.field}
                    onValueChange={(v: Field) => {
                      // 根据字段重置合适的 operator/value
                      if (v === "hasAttachment" || v === "starred") {
                        updateCondition(c.id, { field: v, operator: "is", value: "true" });
                      } else if (v === "category") {
                        updateCondition(c.id, { field: v, operator: "equals", value: "重要" });
                      } else {
                        updateCondition(c.id, { field: v, operator: "contains", value: "" });
                      }
                    }}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="选择字段" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subject">主题</SelectItem>
                      <SelectItem value="from">发件人</SelectItem>
                      <SelectItem value="to">收件人</SelectItem>
                      <SelectItem value="body">正文</SelectItem>
                      <SelectItem value="hasAttachment">有附件</SelectItem>
                      <SelectItem value="category">分类</SelectItem>
                      <SelectItem value="starred">星标</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* 运算符 */}
                  <Select
                    value={c.operator}
                    onValueChange={(v: Operator) => updateCondition(c.id, { operator: v })}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="选择运算符" />
                    </SelectTrigger>
                    <SelectContent>
                      {["subject", "from", "to", "body"].includes(c.field) ? (
                        <>
                          <SelectItem value="contains">包含</SelectItem>
                          <SelectItem value="not_contains">不包含</SelectItem>
                          <SelectItem value="equals">等于</SelectItem>
                          <SelectItem value="starts_with">开头为</SelectItem>
                          <SelectItem value="ends_with">结尾为</SelectItem>
                          <SelectItem value="regex">匹配正则</SelectItem>
                        </>
                      ) : null}
                      {["hasAttachment", "starred"].includes(c.field) ? (
                        <SelectItem value="is">为</SelectItem>
                      ) : null}
                      {["category"].includes(c.field) ? (
                        <>
                          <SelectItem value="equals">等于</SelectItem>
                          <SelectItem value="in">属于（多选）</SelectItem>
                        </>
                      ) : null}
                    </SelectContent>
                  </Select>

                  {/* 值 */}
                  <div className="min-h-10">
                    {["subject", "from", "to", "body"].includes(c.field) ? (
                      <Input
                        placeholder="输入匹配内容"
                        value={c.value}
                        onChange={(e) => updateCondition(c.id, { value: e.target.value })}
                      />
                    ) : null}

                    {["hasAttachment", "starred"].includes(c.field) ? (
                      <Select
                        value={c.value}
                        onValueChange={(v: string) => updateCondition(c.id, { value: v })}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">是</SelectItem>
                          <SelectItem value="false">否</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : null}

                    {c.field === "category" ? (
                      c.operator === "equals" ? (
                        <Select
                          value={c.value}
                          onValueChange={(v: string) => updateCondition(c.id, { value: v })}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="选择分类" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          placeholder="输入多个分类，以逗号分隔（如：重要, 推广）"
                          value={c.value}
                          onChange={(e) => updateCondition(c.id, { value: e.target.value })}
                        />
                      )
                    ) : null}
                  </div>

                  {/* 删除 */}
                  <div className="flex items-center justify-end">
                    <Button variant="ghost" size="icon" onClick={() => removeCondition(c.id)} aria-label="删除条件">
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <Separator />

        {/* 动作 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">动作（条件满足后执行）</div>
            <Button size="sm" variant="secondary" className="gap-1" onClick={addAction}>
              <Plus className="h-4 w-4" />
              添加动作
            </Button>
          </div>

          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {actions.map((a) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="grid gap-2 md:grid-cols-[220px_1fr_40px]"
                >
                  <Select
                    value={a.type}
                    onValueChange={(v: ActionType) => {
                      const defaultArg = v === "move_to" ? "重要" : v === "mark_read" ? "true" : v === "mark_starred" ? "true" : "";
                      updateAction(a.id, { type: v, arg: defaultArg });
                    }}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="选择动作" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="move_to">移动到分类</SelectItem>
                      <SelectItem value="mark_read">标记已读/未读</SelectItem>
                      <SelectItem value="mark_starred">加星/去星</SelectItem>
                      <SelectItem value="delete">删除邮件</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="min-h-10">
                    {a.type === "move_to" ? (
                      <Select
                        value={a.arg}
                        onValueChange={(v: string) => updateAction(a.id, { arg: v })}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="选择分类" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : null}

                    {a.type === "mark_read" ? (
                      <Select
                        value={a.arg ?? "true"}
                        onValueChange={(v: string) => updateAction(a.id, { arg: v })}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">标记已读</SelectItem>
                          <SelectItem value="false">标记未读</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : null}

                    {a.type === "mark_starred" ? (
                      <Select
                        value={a.arg ?? "true"}
                        onValueChange={(v: string) => updateAction(a.id, { arg: v })}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">加星标</SelectItem>
                          <SelectItem value="false">去星标</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : null}

                    {a.type === "delete" ? (
                      <div className="h-10 grid place-items-center text-xs text-muted-foreground">
                        执行后将移至“已删除”
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-end">
                    <Button variant="ghost" size="icon" onClick={() => removeAction(a.id)} aria-label="删除动作">
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <Separator />

        {/* 预览 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm font-medium">规则预览</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {preview.conds.map((t, i) => (
              <Badge key={i} variant="secondary">{t}</Badge>
            ))}
            <span className="text-xs text-muted-foreground">→</span>
            {preview.acts.map((t, i) => (
              <Badge key={i} className="bg-primary/10 text-primary border-primary/20">{t}</Badge>
            ))}
          </div>
        </div>

        {/* 操作 */}
        <div className="flex items-center gap-2 pt-2">
          <Button className="gap-2" onClick={handleSave} disabled={saving}>
            {saving ? <span className="h-4 w-4 animate-spin border-2 rounded-full border-primary border-r-transparent" /> : null}
            保存规则
          </Button>
          <Button variant="secondary" className="gap-2" onClick={handleTest} disabled={testing}>
            <Play className="h-4 w-4" />
            测试匹配
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}