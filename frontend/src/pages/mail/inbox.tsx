import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { Checkbox } from "../../components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../../components/ui/dropdown-menu";
import { toast } from "sonner";
import { Star, Send, Trash2, Pencil, Filter, Calendar, X, ChevronLeft, ChevronRight, Folder } from "lucide-react";

type Category = "重要" | "广告" | "推广" | "垃圾";

type MockMail = {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  date: string; // 展示
  ts: number; // 时间戳，用于筛选
  starred?: boolean;
  category?: Category;
  read?: boolean;
};

const INIT_MAILS: MockMail[] = [
  { id: "1", subject: "项目进度同步与下周计划", from: "Alice", snippet: "这周我们完成了 A/B 两项里程碑，详细见文档...", date: "10:24", ts: new Date("2025-08-12T10:24:00").getTime(), starred: true, category: "重要", read: false },
  { id: "2", subject: "八月促销专享优惠", from: "ShopPlus", snippet: "限时 72 小时满减，会员再享 9 折...", date: "昨天", ts: new Date("2025-08-11T13:10:00").getTime(), category: "推广", read: true },
  { id: "3", subject: "发票开具提醒", from: "Finance Bot", snippet: "您七月账期的增值税专用发票已开具...", date: "周一", ts: new Date("2025-08-11T09:00:00").getTime(), category: "重要", read: false },
  { id: "4", subject: "新品上架通知", from: "AdCorp", snippet: "全新系列上新，点击查看详情...", date: "周一", ts: new Date("2025-08-11T08:00:00").getTime(), category: "广告", read: true },
];

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200/60 dark:bg-yellow-600/40 rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function Inbox() {
  const VIEWS = ["全部", "重要", "广告", "推广", "星标", "垃圾"] as const;
  type View = typeof VIEWS[number];

  // 数据源（可变更）
  const [mails, setMails] = useState<MockMail[]>(INIT_MAILS);

  // 视图/搜索
  const [view, setView] = useState<View>("全部");
  const [keyword, setKeyword] = useState("");
  const [activeId, setActiveId] = useState("1");

  // 高级筛选
  const [showAdv, setShowAdv] = useState(false);
  const [fromFilter, setFromFilter] = useState("");
  const [start, setStart] = useState(""); // yyyy-mm-dd
  const [end, setEnd] = useState(""); // yyyy-mm-dd
  const [tagSet, setTagSet] = useState<Set<Category>>(new Set());
  const hasAdv = !!fromFilter || !!start || !!end || tagSet.size > 0;

  // 选择与批量
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // 分页
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const toggleTag = (t: Category) => {
    setTagSet((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const q = keyword.trim().toLowerCase();

  const filtered = useMemo(() => {
    const sMs = start ? new Date(`${start}T00:00:00`).getTime() : undefined;
    const eMs = end ? new Date(`${end}T23:59:59`).getTime() : undefined;
    return mails.filter((m) => {
      // 视图
      const viewOk = view === "全部" ? true : view === "星标" ? !!m.starred : m.category === view;
      if (!viewOk) return false;
      // 关键字
      const text = `${m.subject} ${m.from} ${m.snippet}`.toLowerCase();
      if (q && !text.includes(q)) return false;
      // 发件人
      if (fromFilter && !m.from.toLowerCase().includes(fromFilter.toLowerCase())) return false;
      // 标签
      if (tagSet.size > 0) {
        if (!m.category || !tagSet.has(m.category)) return false;
      }
      // 日期
      if (sMs && m.ts < sMs) return false;
      if (eMs && m.ts > eMs) return false;
      return true;
    });
  }, [mails, view, q, fromFilter, start, end, tagSet]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageClamped = Math.min(Math.max(page, 1), totalPages);
  const paged = filtered.slice((pageClamped - 1) * pageSize, pageClamped * pageSize);
  useEffect(() => {
    if (page !== pageClamped) setPage(pageClamped);
  }, [page, pageClamped]);

  // 清空选择（当筛选/分页变化）
  useEffect(() => {
    setSelected(new Set());
  }, [view, keyword, fromFilter, start, end, tagSet, page]);

  const active = filtered.find((m) => m.id === activeId) ?? filtered[0] ?? null;

  const isAllSelected = paged.length > 0 && paged.every((m) => selected.has(m.id));
  const isSomeSelected = !isAllSelected && paged.some((m) => selected.has(m.id));
  const selectedCount = selected.size;

  const handleToggleRow = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };
  const handleToggleAll = (checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) {
        paged.forEach((m) => next.add(m.id));
      } else {
        paged.forEach((m) => next.delete(m.id));
      }
      return next;
    });
  };

  const markRead = (val: boolean) => {
    if (selectedCount === 0) return;
    setMails((prev) => prev.map((m) => (selected.has(m.id) ? { ...m, read: val } : m)));
    toast.success(val ? "已标记为已读" : "已标记为未读");
    setSelected(new Set());
  };

  const moveTo = (cat: Category) => {
    if (selectedCount === 0) return;
    setMails((prev) => prev.map((m) => (selected.has(m.id) ? { ...m, category: cat } : m)));
    toast.success(`已移动到「${cat}」`);
    setSelected(new Set());
  };

  const bulkDelete = () => {
    if (selectedCount === 0) return;
    setMails((prev) => prev.filter((m) => !selected.has(m.id)));
    toast.success(`已删除 ${selectedCount} 封邮件`);
    setSelected(new Set());
  };

  const markSpam = () => {
    if (selectedCount === 0) return;
    setMails((prev) => prev.map((m) => (selected.has(m.id) ? { ...m, category: "垃圾" as Category } : m)));
    toast.success("已标记为垃圾");
    setSelected(new Set());
  };

  const restoreFromSpam = () => {
    if (selectedCount === 0) return;
    setMails((prev) => prev.map((m) => (selected.has(m.id) ? { ...m, category: undefined } : m)));
    toast.success("已还原邮件");
    setSelected(new Set());
  };

  const clearAllAdv = () => {
    setFromFilter("");
    setStart("");
    setEnd("");
    setTagSet(new Set());
  };

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {/* 顶部动作 */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="default" className="gap-2"><Pencil className="h-4 w-4" /> 写邮件</Button>
        <Button variant="secondary" className="gap-2"><Send className="h-4 w-4" /> 发送</Button>
        <Button variant="ghost" className="gap-2"><Trash2 className="h-4 w-4" /> 删除</Button>
      </div>

      {/* 筛选 + 搜索 */}
      <Card className="p-2 md:p-3 space-y-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {VIEWS.map((v) => (
              <Button key={v} size="sm" variant={view === v ? "default" : "secondary"} onClick={() => setView(v)}>
                {v}
              </Button>
            ))}
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => setShowAdv((s) => !s)}
              aria-expanded={showAdv}
            >
              <Filter className="h-4 w-4" />
              高级筛选
            </Button>
          </div>
          <div className="w-full md:w-[320px]">
            <Input placeholder="搜索主题、发件人、摘要…" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </div>
        </div>

        {showAdv && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden">
            <div className="pt-2 grid grid-cols-1 gap-2 md:grid-cols-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} aria-label="开始日期" />
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} aria-label="结束日期" />
              </div>
              <div className="md:col-span-1">
                <Input placeholder="发件人（模糊匹配）" value={fromFilter} onChange={(e) => setFromFilter(e.target.value)} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(["重要", "广告", "推广"] as Category[]).map((t) => (
                  <Button
                    key={t}
                    size="sm"
                    variant={tagSet.has(t) ? "default" : "secondary"}
                    onClick={() => toggleTag(t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
            <div className="pt-2 flex items-center gap-2">
              <Button size="sm" onClick={() => setShowAdv(false)}>应用</Button>
              <Button size="sm" variant="ghost" onClick={clearAllAdv}>重置</Button>
            </div>
          </motion.div>
        )}

        {/* 条件 Chips */}
        {hasAdv && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {start && (
              <Chip onClear={() => setStart("")} label={`开始: ${start}`} />
            )}
            {end && (
              <Chip onClear={() => setEnd("")} label={`结束: ${end}`} />
            )}
            {fromFilter && (
              <Chip onClear={() => setFromFilter("")} label={`发件人: ${fromFilter}`} />
            )}
            {[...tagSet].map((t) => (
              <Chip key={t} onClear={() => toggleTag(t)} label={`标签: ${t}`} />
            ))}
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={clearAllAdv}>
              清除全部
            </Button>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[380px_1fr]">
        {/* 列表 */}
        <Card className="p-2">
          {/* 批量工具条 */}
          <div className="flex items-center justify-between gap-2 px-2 py-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={(v) => handleToggleAll(Boolean(v))}
                  aria-label="选择本页全部"
                  className={isSomeSelected ? "data-[state=indeterminate]:opacity-100" : ""}
                />
                <span className="text-xs text-muted-foreground">选择本页</span>
              </div>
              {selectedCount > 0 && (
                <span className="text-xs">已选 {selectedCount} 封</span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button size="sm" variant="secondary" onClick={() => markRead(true)} disabled={selectedCount === 0}>
                标记已读
              </Button>
              <Button size="sm" variant="outline" onClick={() => markRead(false)} disabled={selectedCount === 0}>
                标记未读
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1" disabled={selectedCount === 0}>
                    <Folder className="h-4 w-4" />
                    移至
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>移动到</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => moveTo("重要")}>重要</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => moveTo("广告")}>广告</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => moveTo("推广")}>推广</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button size="sm" variant="outline" onClick={markSpam} disabled={selectedCount === 0}>
                标记为垃圾
              </Button>
              {view === "垃圾" ? (
                <Button size="sm" variant="secondary" onClick={restoreFromSpam} disabled={selectedCount === 0}>
                  还原
                </Button>
              ) : null}

              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={bulkDelete} disabled={selectedCount === 0}>
                <Trash2 className="h-4 w-4" />
                删除
              </Button>
            </div>
          </div>

          <div className="px-2 py-1 text-xs text-muted-foreground">
            共 {filtered.length} 封 {view !== "全部" ? `· ${view}` : ""}{hasAdv ? " · 已应用高级筛选" : ""}
          </div>
          <Separator className="my-1" />

          {paged.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">无匹配邮件。尝试清除筛选或更换关键字。</div>
          ) : (
            <ul className="divide-y">
              {paged.map((m) => {
                const unread = !m.read;
                return (
                  <motion.li
                    key={m.id}
                    whileHover={{ backgroundColor: "hsl(var(--accent))" }}
                    className={`p-3 cursor-pointer ${activeId === m.id ? "bg-accent ring-1 ring-border" : ""}`}
                    onClick={() => setActiveId(m.id)}
                    aria-current={activeId === m.id ? "true" : undefined}
                  >
                    <div className="flex items-start gap-3">
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selected.has(m.id)}
                          onCheckedChange={(v) => handleToggleRow(m.id, Boolean(v))}
                          aria-label={`选择邮件 ${m.subject}`}
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className={`font-medium ${unread ? "font-semibold" : ""}`}>
                            {unread && <span className="inline-block h-2 w-2 rounded-full bg-primary mr-2 align-middle" aria-hidden />}
                            <Highlight text={m.subject} query={q} />
                          </div>
                          <div className="flex items-center gap-2">
                            {m.category ? <Badge variant="secondary">{m.category}</Badge> : null}
                            <span className="text-xs text-muted-foreground">{m.date}</span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <Highlight text={`${m.from} · ${m.snippet}`} query={q} />
                        </div>
                      </div>

                      <div className="pt-1">
                        {m.starred ? (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        ) : (
                          <Star className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          )}

          {/* 分页 */}
          <div className="flex items-center justify-between px-2 py-2">
            <div className="text-xs text-muted-foreground">
              第 {pageClamped} / {totalPages} 页 · 每页 {pageSize} 封
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pageClamped <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                上一页
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={pageClamped >= totalPages}
              >
                下一页
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* 阅读窗格 */}
        <Card className="p-4 space-y-2">
          {!active ? (
            <div className="text-sm text-muted-foreground">无可显示的邮件，请在左侧选择或调整筛选条件。</div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">{active.subject}</div>
                <div className="text-xs text-muted-foreground">{active.date}</div>
              </div>
              <div className="text-sm text-muted-foreground">来自 {active.from}</div>
              <Separator />
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p>{active.snippet}（正文占位：此处将渲染邮件 HTML 内容与附件列表。）</p>
              </div>
            </>
          )}
        </Card>
      </div>
    </motion.div>
  );
}

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-accent px-2 h-7 text-xs">
      {label}
      <button
        className="inline-flex items-center justify-center rounded hover:bg-muted/60 transition w-5 h-5"
        aria-label="清除筛选"
        onClick={onClear}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}