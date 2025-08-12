import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { Skeleton } from "../../components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { BulkToolbar, FilterBar, MailList, ReaderPane, type Category, type MockMail } from "../../components/mail/mail-modules";
import TopActions from "../../components/mail/top-actions";

const INIT_MAILS: MockMail[] = [
  { id: "1", subject: "项目进度同步与下周计划", from: "Alice", snippet: "这周我们完成了 A/B 两项里程碑，详细见文档...", date: "10:24", ts: new Date("2025-08-12T10:24:00").getTime(), starred: true, category: "重要", read: false },
  { id: "2", subject: "八月促销专享优惠", from: "ShopPlus", snippet: "限时 72 小时满减，会员再享 9 折...", date: "昨天", ts: new Date("2025-08-11T13:10:00").getTime(), category: "推广", read: true },
  { id: "3", subject: "发票开具提醒", from: "Finance Bot", snippet: "您七月账期的增值税专用发票已开具...", date: "周一", ts: new Date("2025-08-11T09:00:00").getTime(), category: "重要", read: false },
  { id: "4", subject: "新品上架通知", from: "AdCorp", snippet: "全新系列上新，点击查看详情...", date: "周一", ts: new Date("2025-08-11T08:00:00").getTime(), category: "广告", read: true },
];

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

  // 首屏骨架加载
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

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
      <TopActions />

      {/* 筛选条（含高级筛选与条件 Chips） */}
      <FilterBar
        views={VIEWS}
        view={view}
        onChangeView={(v) => setView(v as View)}
        keyword={keyword}
        onKeyword={setKeyword}
        showAdv={showAdv}
        onToggleAdv={() => setShowAdv((s) => !s)}
        fromFilter={fromFilter}
        onFromFilter={setFromFilter}
        start={start}
        onStart={setStart}
        end={end}
        onEnd={setEnd}
        tagSet={tagSet}
        toggleTag={toggleTag}
        clearAllAdv={clearAllAdv}
        hasAdv={hasAdv}
      />

      {/* 内容区域：首屏骨架屏 */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[380px_1fr]">
          <Card className="p-2">
            <div className="px-2 py-1">
              <Skeleton className="h-3 w-24" />
            </div>
            <Separator className="my-1" />
            <ul className="divide-y">
              {Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-3 w-10" />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-3 w-14" />
            </div>
            <Skeleton className="h-3 w-24" />
            <Separator />
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[380px_1fr]">
          {/* 列表 */}
          <Card className="p-2">
            <BulkToolbar
              isAllSelected={isAllSelected}
              isSomeSelected={isSomeSelected}
              selectedCount={selectedCount}
              onToggleAll={handleToggleAll}
              onMarkRead={markRead}
              onMoveTo={moveTo}
              onMarkSpam={markSpam}
              canRestoreSpam={view === "垃圾"}
              onRestoreFromSpam={restoreFromSpam}
              onDelete={bulkDelete}
            />

            <div className="px-2 py-1 text-xs text-muted-foreground">
              共 {filtered.length} 封 {view !== "全部" ? `· ${view}` : ""}{hasAdv ? " · 已应用高级筛选" : ""}
            </div>
            <Separator className="my-1" />

            {filtered.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">无匹配邮件。尝试清除筛选或更换关键字。</div>
            ) : (
              <MailList
                mails={paged}
                q={q}
                selected={selected}
                onToggleRow={handleToggleRow}
                onItemClick={(id) => setActiveId(id)}
                activeId={activeId}
              />
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
            <ReaderPane mail={active ?? null} />
          </Card>
        </div>
      )}
    </motion.div>
  );
}