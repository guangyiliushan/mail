import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Switch } from "../../components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "../../components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Filter,
  Upload,
  Download,
  Sparkles,
} from "lucide-react";

type Condition = {
  id: string;
  field: string;
  operator: string;
  value: string;
};
type Action = {
  id: string;
  type: string;
  arg?: string;
};
type Rule = {
  id: string;
  name: string;
  enabled: boolean;
  conditions: Condition[];
  actions: Action[];
  updatedAt: number;
};

const LS_KEY = "mail_rules_all";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function seedRules(): Rule[] {
  const now = Date.now();
  return [
    {
      id: uid(),
      name: "发票归档到重要",
      enabled: true,
      conditions: [
        { id: uid(), field: "subject", operator: "contains", value: "发票" },
      ],
      actions: [{ id: uid(), type: "move_to", arg: "重要" }],
      updatedAt: now,
    },
    {
      id: uid(),
      name: "促销信息移至推广",
      enabled: true,
      conditions: [
        { id: uid(), field: "subject", operator: "contains", value: "促销" },
        { id: uid(), field: "from", operator: "contains", value: "noreply" },
      ],
      actions: [{ id: uid(), type: "move_to", arg: "推广" }],
      updatedAt: now - 3600_000,
    },
    {
      id: uid(),
      name: "有附件加星标",
      enabled: false,
      conditions: [
        { id: uid(), field: "hasAttachment", operator: "is", value: "true" },
      ],
      actions: [{ id: uid(), type: "mark_starred", arg: "true" }],
      updatedAt: now - 24 * 3600_000,
    },
  ];
}

function loadRules(): Rule[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return seedRules();
    const arr = JSON.parse(raw) as Rule[];
    if (!Array.isArray(arr)) return seedRules();
    return arr;
  } catch {
    return seedRules();
  }
}

function saveRules(rules: Rule[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(rules));
}

export default function RulesListPage() {
  const navigate = useNavigate();
  const [rules, setRules] = useState<Rule[]>([]);
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRules(loadRules());
  }, []);

  const q = keyword.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      rules.filter((r) =>
        r.name.toLowerCase().includes(q)
      ),
    [rules, q]
  );

  const isAllSelected =
    filtered.length > 0 && filtered.every((r) => selected.has(r.id));
  const isSomeSelected =
    !isAllSelected && filtered.some((r) => selected.has(r.id));

  const toggleSelectAll = (checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) filtered.forEach((r) => next.add(r.id));
      else filtered.forEach((r) => next.delete(r.id));
      return next;
    });
  };

  const toggleRow = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const moveRule = (id: string, dir: "up" | "down") => {
    setRules((list) => {
      const idx = list.findIndex((r) => r.id === id);
      if (idx < 0) return list;
      const target = dir === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= list.length) return list;
      const copy = list.slice();
      const [item] = copy.splice(idx, 1);
      copy.splice(target, 0, item);
      return copy;
    });
  };

  const updateEnabled = (id: string, enabled: boolean) => {
    setRules((list) =>
      list.map((r) => (r.id === id ? { ...r, enabled, updatedAt: Date.now() } : r))
    );
  };

  const duplicateRule = (id: string) => {
    setRules((list) => {
      const r = list.find((x) => x.id === id);
      if (!r) return list;
      const copy: Rule = {
        ...r,
        id: uid(),
        name: `${r.name}（副本）`,
        updatedAt: Date.now(),
      };
      const idx = list.findIndex((x) => x.id === id);
      const next = list.slice();
      next.splice(idx + 1, 0, copy);
      return next;
    });
    toast.success("已创建副本");
  };

  const deleteRule = (id: string) => {
    setRules((list) => list.filter((r) => r.id !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    toast.success("规则已删除");
  };

  const bulkEnable = (enabled: boolean) => {
    if (selected.size === 0) return;
    setRules((list) =>
      list.map((r) =>
        selected.has(r.id) ? { ...r, enabled, updatedAt: Date.now() } : r
      )
    );
    toast.success(enabled ? "已批量启用" : "已批量停用");
    setSelected(new Set());
  };

  const bulkDelete = () => {
    if (selected.size === 0) return;
    setRules((list) => list.filter((r) => !selected.has(r.id)));
    toast.success("已批量删除");
    setSelected(new Set());
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      saveRules(rules);
      toast.success("顺序与更改已保存");
    } catch {
      toast.error("保存失败，请稍后再试");
    } finally {
      setSaving(false);
    }
  };

  // 导出当前规则为 JSON 文件
  const handleExport = () => {
    try {
      const data = JSON.stringify(rules, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mail-rules-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("已导出规则 JSON");
    } catch {
      toast.error("导出失败");
    }
  };

  // 触发文件选择对话框
  const handleImportClick = () => fileRef.current?.click();

  // 从 JSON 文件导入并覆盖当前规则
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = ""; // 允许重复选择同一文件
    if (!file) return;
    try {
      const text = await file.text();
      const arr = JSON.parse(text);
      if (!Array.isArray(arr)) throw new Error("格式错误");
      const normalized = (arr as any[]).map((r) => ({
        id: uid(),
        name: String(r.name ?? "未命名规则"),
        enabled: r.enabled !== false,
        conditions: Array.isArray(r.conditions) ? r.conditions : [],
        actions: Array.isArray(r.actions) ? r.actions : [],
        updatedAt: Date.now(),
      })) as Rule[];
      setRules(normalized);
      saveRules(normalized);
      setSelected(new Set());
      toast.success(`已导入 ${normalized.length} 条规则`);
    } catch {
      toast.error("导入失败：请选择有效的规则 JSON 文件");
    }
  };

  // 快速模板
  const templates = {
    invoice: {
      name: "发票归档到重要",
      enabled: true,
      conditions: [{ id: uid(), field: "subject", operator: "contains", value: "发票" }],
      actions: [{ id: uid(), type: "move_to", arg: "重要" }],
    },
    promo: {
      name: "促销移至推广",
      enabled: true,
      conditions: [{ id: uid(), field: "subject", operator: "contains", value: "促销" }],
      actions: [{ id: uid(), type: "move_to", arg: "推广" }],
    },
    attachStar: {
      name: "有附件加星标",
      enabled: true,
      conditions: [{ id: uid(), field: "hasAttachment", operator: "is", value: "true" }],
      actions: [{ id: uid(), type: "mark_starred", arg: "true" }],
    },
    spam: {
      name: "垃圾关键词 → 垃圾箱",
      enabled: true,
      conditions: [{ id: uid(), field: "subject", operator: "contains", value: "中奖" }],
      actions: [{ id: uid(), type: "delete" }],
    },
  };

  const addTemplate = (key: keyof typeof templates) => {
    const tpl = templates[key];
    const rule: Rule = {
      id: uid(),
      name: tpl.name,
      enabled: tpl.enabled,
      conditions: tpl.conditions,
      actions: tpl.actions,
      updatedAt: Date.now(),
    };
    setRules((list) => {
      const next = [...list, rule];
      saveRules(next);
      return next;
    });
    toast.success(`已添加模板：${tpl.name}`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">规则列表</h2>
            <p className="text-sm text-muted-foreground">管理启用状态、顺序与批量操作。可新建或编辑规则。</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* 隐藏的文件选择用于导入 */}
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImportFile}
          />

          <Button variant="secondary" onClick={() => navigate("/mail/rules")}>
            <Plus className="h-4 w-4 mr-1" />
            新建规则
          </Button>

          <Button variant="outline" onClick={handleExport} className="gap-1">
            <Download className="h-4 w-4" />
            导出
          </Button>
          <Button variant="outline" onClick={handleImportClick} className="gap-1">
            <Upload className="h-4 w-4" />
            导入
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="gap-1">
                <Sparkles className="h-4 w-4" />
                模板
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>快速启用模板</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => addTemplate("invoice")}>发票归档到重要</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addTemplate("promo")}>促销移至推广</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addTemplate("attachStar")}>有附件加星标</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addTemplate("spam")}>垃圾关键词 → 垃圾箱</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleSaveOrder} disabled={saving} className="gap-1">
            {saving ? (
              <span className="h-4 w-4 animate-spin border-2 rounded-full border-primary border-r-transparent" />
            ) : null}
            保存更改
          </Button>
        </div>
      </div>

      <Card className="p-3 space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="search">搜索</Label>
            <Input
              id="search"
              placeholder="按规则名称过滤…"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <div className="text-xs text-muted-foreground">
              共 {filtered.length} 条规则 · {selected.size > 0 ? `已选 ${selected.size}` : "未选择"}
            </div>
          </div>
        </div>

        <Separator />

        {/* 批量工具条 */}
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => bulkEnable(true)}>批量启用</Button>
            <Button size="sm" variant="outline" onClick={() => bulkEnable(false)}>批量停用</Button>
            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={bulkDelete}>
              批量删除
            </Button>
          </div>
        )}

        <div role="table" aria-label="规则列表" className="divide-y rounded-md border">
          {/* 表头 */}
          <div role="row" className="grid grid-cols-[44px_32px_1fr_140px_220px] items-center gap-2 px-2 py-2 bg-muted/50">
            <div role="columnheader" className="flex items-center justify-center">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={(v) => toggleSelectAll(Boolean(v))}
                aria-label="选择全部"
              />
            </div>
            <div role="columnheader" className="text-xs text-muted-foreground">序</div>
            <div role="columnheader" className="text-xs text-muted-foreground">名称</div>
            <div role="columnheader" className="text-xs text-muted-foreground">状态</div>
            <div role="columnheader" className="text-xs text-muted-foreground">操作</div>
          </div>

          <AnimatePresence initial={false}>
            {filtered.map((r, idx) => (
              <motion.div
                role="row"
                key={r.id}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="grid grid-cols-[44px_32px_1fr_140px_220px] items-center gap-2 px-2 py-2"
              >
                {/* 选择 */}
                <div role="cell" className="flex items-center justify-center">
                  <Checkbox
                    checked={selected.has(r.id)}
                    onCheckedChange={(v) => toggleRow(r.id, Boolean(v))}
                    aria-label={`选择 ${r.name}`}
                  />
                </div>

                {/* 排序 */}
                <div role="cell" className="flex items-center justify-center text-muted-foreground">
                  <GripVertical className="h-4 w-4 mr-1" aria-hidden />
                  <div className="flex flex-col -my-2">
                    <button
                      className="p-1 rounded hover:bg-accent"
                      aria-label="上移"
                      onClick={() => moveRule(r.id, "up")}
                      disabled={idx === 0}
                      title="上移"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      className="p-1 rounded hover:bg-accent"
                      aria-label="下移"
                      onClick={() => moveRule(r.id, "down")}
                      disabled={idx === filtered.length - 1 && filtered.length === rules.length}
                      title="下移"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* 名称 + 统计 + 更新时间 */}
                <div role="cell" className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{r.name}</span>
                    <Badge variant={r.enabled ? "default" : "secondary"}>{r.enabled ? "启用中" : "停用"}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    条件 {r.conditions.length} · 动作 {r.actions.length} · 更新 {new Date(r.updatedAt).toLocaleString()}
                  </div>
                </div>

                {/* 开关 */}
                <div role="cell" className="flex items-center gap-2">
                  <Switch
                    id={`switch-${r.id}`}
                    checked={r.enabled}
                    onCheckedChange={(v) => updateEnabled(r.id, Boolean(v))}
                    aria-label={`切换 ${r.name} 启用状态`}
                  />
                  <Label htmlFor={`switch-${r.id}`} className="text-xs text-muted-foreground">
                    {r.enabled ? "已启用" : "未启用"}
                  </Label>
                </div>

                {/* 行操作 */}
                <div role="cell" className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => navigate(`/mail/rules?id=${r.id}`)}
                    title="编辑此规则"
                  >
                    <Pencil className="h-4 w-4" /> 编辑
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => duplicateRule(r.id)}>
                    <Copy className="h-4 w-4" /> 复制
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1 text-destructive hover:text-destructive"
                    onClick={() => deleteRule(r.id)}
                  >
                    <Trash2 className="h-4 w-4" /> 删除
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}