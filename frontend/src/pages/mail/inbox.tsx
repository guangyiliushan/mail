import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Card } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { Skeleton } from "../../components/ui/skeleton";
import FolderActions from "../../components/mail/folder-actions";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BulkToolbar, FilterBar, MailList, ReaderPane, type Category, type MockMail } from "../../components/mail/mail-modules";
import TopActions from "../../components/mail/top-actions";
import { evaluateAndApplyRules } from "../../lib/mail-rules";
import { ListStats, PaginationControls } from "../../components/common/pagination-and-stats";

const INIT_MAILS: MockMail[] = [
  { id: "1", subject: "项目进度同步与下周计划", from: "Alice", snippet: "这周我们完成了 A/B 两项里程碑，详细见文档...", date: "10:24", ts: new Date("2025-08-12T10:24:00").getTime(), starred: true, category: "重要", read: false },
  { id: "2", subject: "八月促销专享优惠", from: "ShopPlus", snippet: "限时 72 小时满减，会员再享 9 折...", date: "昨天", ts: new Date("2025-08-11T13:10:00").getTime(), category: "推广", read: true },
  { id: "3", subject: "发票开具提醒", from: "Finance Bot", snippet: "您七月账期的增值税专用发票已开具...", date: "周一", ts: new Date("2025-08-11T09:00:00").getTime(), category: "重要", read: false },
  { id: "4", subject: "新品上架通知", from: "AdCorp", snippet: "全新系列上新，点击查看详情...", date: "周一", ts: new Date("2025-08-11T08:00:00").getTime(), category: "广告", read: true },
];

export default function Inbox() {
  const navigate = useNavigate();
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

  // 规则匹配/摘要
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [ruleSummary, setRuleSummary] = useState("");
  const [bannerOpen, setBannerOpen] = useState(false);
  useEffect(() => {
    if (ruleSummary) setBannerOpen(true);
  }, [ruleSummary]);

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

  const [params] = useSearchParams();
  const folder = (params.get("folder") || "").toLowerCase();
  const folderLabel = folder === "starred" ? "星标邮件" : folder === "sent" ? "已发送" : folder === "drafts" ? "草稿箱" : folder === "trash" ? "垃圾箱" : "";
  const isDraftsView = folder === "drafts";
  const isSentView = folder === "sent";
  type LocalFolderViewType = "drafts" | "sent";
  const DraftsView: LocalFolderViewType = "drafts";
  const SentView: LocalFolderViewType = "sent";
  const selectedDraftCount = useMemo(
    () => mails.filter((m) => selected.has(m.id) && m.category === "草稿").length,
    [mails, selected]
  );
  const selectedSentCount = useMemo(
    () => mails.filter((m) => selected.has(m.id) && m.category === "已发送").length,
    [mails, selected]
  );

  const filtered = useMemo(() => {
    const sMs = start ? new Date(`${start}T00:00:00`).getTime() : undefined;
    const eMs = end ? new Date(`${end}T23:59:59`).getTime() : undefined;
    return mails.filter((m) => {
      // 视图
      const viewOk = view === "全部" ? true : view === "星标" ? !!m.starred : m.category === view;
      if (!viewOk) return false;
      // URL folder 视图
      let folderOk = true;
      if (folder === "starred") folderOk = !!m.starred;
      else if (folder === "trash") folderOk = m.category === "垃圾";
      else if (folder === "sent") folderOk = m.category === "已发送";
      else if (folder === "drafts") folderOk = m.category === "草稿";
      if (!folderOk) return false;
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
  }, [mails, view, q, fromFilter, start, end, tagSet, folder]);

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

  // 应用规则（实时）
  useEffect(() => {
    const res = evaluateAndApplyRules(mails as any);
    setMatchedIds(res.matchedIds);
    if (!loading && res.changed) {
      setMails(res.updated as any);
      if (res.summary) {
        toast.success(`规则已应用：${res.summary}`);
        setRuleSummary(res.summary);
      }
    }
  }, [mails, loading]);

  const active = filtered.find((m) => m.id === activeId) ?? filtered[0] ?? null;

  const isAllSelected = paged.length > 0 && paged.every((m) => selected.has(m.id));
  const isSomeSelected = !isAllSelected && paged.some((m) => selected.has(m.id));
  const selectedCount = selected.size;
  const matchedCount = useMemo(() => filtered.filter((m) => matchedIds.has(m.id)).length, [filtered, matchedIds]);

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

  // 草稿视图：编辑与发送
  const editSelectedDraft = () => {
    if (selectedDraftCount !== 1) {
      toast.info("请选择一封草稿进行编辑");
      return;
    }
    const draft = mails.find((m) => selected.has(m.id) && m.category === "草稿");
    if (draft) navigate(`/mail/compose?draft=${draft.id}`);
  };

  const sendSelectedDrafts = () => {
    const ids = mails.filter((m) => selected.has(m.id) && m.category === "草稿").map((m) => m.id);
    if (ids.length === 0) {
      toast.info("未选择草稿");
      return;
    }
    setMails((prev) =>
      prev.map((m) => (ids.includes(m.id) ? { ...m, category: "已发送" as any, read: true } : m))
    );
    toast.success(`已发送 ${ids.length} 封草稿`);
    setSelected(new Set());
  };

  // 已发送视图：撤回（移回草稿）
  const recallSelectedSent = () => {
    const ids = mails.filter((m) => selected.has(m.id) && m.category === "已发送").map((m) => m.id);
    if (ids.length === 0) {
      toast.info("未选择已发送邮件");
      return;
    }
    setMails((prev) =>
      prev.map((m) => (ids.includes(m.id) ? { ...m, category: "草稿" as any, read: false } : m))
    );
    toast.success(`已撤回 ${ids.length} 封已发送邮件至草稿`);
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
      <TopActions onCompose={() => navigate("/mail/compose")} />
      {bannerOpen && ruleSummary ? (
        <Alert className="relative pr-10">
          <AlertDescription className="text-sm">
            规则已应用：{ruleSummary}
          </AlertDescription>
          <button
            type="button"
            aria-label="关闭提示"
            className="absolute top-2 right-2 rounded p-1 hover:bg-accent"
            onClick={() => setBannerOpen(false)}
          >
            ×
          </button>
        </Alert>
      ) : null}

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
              canRestoreSpam={view === "垃圾" || folder === "trash"}
              onRestoreFromSpam={restoreFromSpam}
              onDelete={bulkDelete}
            />

            {(isDraftsView || isSentView) ? (
              <FolderActions
                view={isDraftsView ? DraftsView : SentView}
                selectedCount={isDraftsView ? selectedDraftCount : selectedSentCount}
                onEditDraft={isDraftsView ? editSelectedDraft : undefined}
                onSendDrafts={isDraftsView ? sendSelectedDrafts : undefined}
                onRecallSent={isSentView ? recallSelectedSent : undefined}
              />
            ) : null}

            <ListStats
              className="px-2 py-1"
              count={filtered.length}
              unit="封"
              segments={[view !== "全部" ? view : "", folderLabel, hasAdv ? "已应用高级筛选" : "", matchedCount > 0 ? `规则命中 ${matchedCount}` : ""]}
            />
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
                matchedIds={matchedIds}
              />
            )}

            {/* 分页 */}
            <PaginationControls
              className="px-2 py-2"
              page={pageClamped}
              totalPages={totalPages}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
              summary={`第 ${pageClamped} / ${totalPages} 页 · 每页 ${pageSize} 封`}
            />
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