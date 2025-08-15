import React from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Filter, Calendar, X, Folder, Star, Wand2 } from "lucide-react";
import type { Category } from "@/shared/types/rules";
export type { Category } from "@/shared/types/rules";


export type MockMail = {
  id: string;
  subject: string;
  from: string;
  to?: string;
  cc?: string;
  bcc?: string;
  snippet: string;
  date: string;
  ts: number;
  starred?: boolean;
  category?: Category;
  read?: boolean;
  deleted?: boolean;
};

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
export function Highlight({ text, query }: { text: string; query: string }) {
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

export type FilterBarProps = {
  views: readonly string[];
  view: string;
  onChangeView: (v: string) => void;

  keyword: string;
  onKeyword: (v: string) => void;

  showAdv: boolean;
  onToggleAdv: () => void;

  fromFilter: string;
  onFromFilter: (v: string) => void;

  start: string;
  onStart: (v: string) => void;

  end: string;
  onEnd: (v: string) => void;

  tagSet: Set<Category>;
  toggleTag: (t: Category) => void;

  clearAllAdv: () => void;
  hasAdv: boolean;
};

export function FilterBar(props: FilterBarProps) {
  const {
    views, view, onChangeView, keyword, onKeyword,
    showAdv, onToggleAdv, fromFilter, onFromFilter,
    start, onStart, end, onEnd, tagSet, toggleTag,
    clearAllAdv, hasAdv
  } = props;

  return (
    <Card className="p-2 md:p-3 space-y-2">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {views.map((v) => (
            <Button key={v} size="sm" variant={view === v ? "default" : "secondary"} onClick={() => onChangeView(v)}>
              {v}
            </Button>
          ))}
          <Button size="sm" variant="outline" className="gap-2" onClick={onToggleAdv} aria-expanded={showAdv}>
            <Filter className="h-4 w-4" />
            高级筛选
          </Button>
        </div>
        <div className="w-full md:w-[320px]">
          <Input placeholder="搜索主题、发件人、摘要…" value={keyword} onChange={(e) => onKeyword(e.target.value)} />
        </div>
      </div>

      {showAdv && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden">
          <div className="pt-2 grid grid-cols-1 gap-2 md:grid-cols-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input type="date" value={start} onChange={(e) => onStart(e.target.value)} aria-label="开始日期" />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input type="date" value={end} onChange={(e) => onEnd(e.target.value)} aria-label="结束日期" />
            </div>
            <div className="md:col-span-1">
              <Input placeholder="发件人（模糊匹配）" value={fromFilter} onChange={(e) => onFromFilter(e.target.value)} />
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
            <Button size="sm" onClick={onToggleAdv}>应用</Button>
            <Button size="sm" variant="ghost" onClick={clearAllAdv}>重置</Button>
          </div>
        </motion.div>
      )}

      {hasAdv && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {start && <Chip label={`开始: ${start}`} onClear={() => onStart("")} />}
          {end && <Chip label={`结束: ${end}`} onClear={() => onEnd("")} />}
          {fromFilter && <Chip label={`发件人: ${fromFilter}`} onClear={() => onFromFilter("")} />}
          {[...tagSet].map((t) => (
            <Chip key={t} label={`标签: ${t}`} onClear={() => toggleTag(t)} />
          ))}
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={clearAllAdv}>
            清除全部
          </Button>
        </div>
      )}
    </Card>
  );
}

export function BulkToolbar(props: {
  isAllSelected: boolean;
  isSomeSelected: boolean;
  selectedCount: number;
  onToggleAll: (checked: boolean) => void;
  onMarkRead: (read: boolean) => void;
  onMoveTo: (c: Category) => void;
  onMarkSpam: () => void;
  canRestoreSpam: boolean;
  onRestoreFromSpam: () => void;
  onDelete: () => void;
}) {
  const {
    isAllSelected, isSomeSelected, selectedCount, onToggleAll,
    onMarkRead, onMoveTo, onMarkSpam, canRestoreSpam, onRestoreFromSpam, onDelete
  } = props;

  return (
    <div className="flex items-center justify-between gap-2 px-2 py-1">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={(v) => onToggleAll(Boolean(v))}
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
        <Button size="sm" variant="secondary" onClick={() => onMarkRead(true)} disabled={selectedCount === 0}>
          标记已读
        </Button>
        <Button size="sm" variant="outline" onClick={() => onMarkRead(false)} disabled={selectedCount === 0}>
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
            <DropdownMenuItem onClick={() => onMoveTo("重要")}>重要</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMoveTo("广告")}>广告</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMoveTo("推广")}>推广</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" variant="outline" onClick={onMarkSpam} disabled={selectedCount === 0}>
          标记为垃圾
        </Button>
        {canRestoreSpam ? (
          <Button size="sm" variant="secondary" onClick={onRestoreFromSpam} disabled={selectedCount === 0}>
            还原
          </Button>
        ) : null}

        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={onDelete} disabled={selectedCount === 0}>
          删除
        </Button>
      </div>
    </div>
  );
}

export function MailList(props: {
  mails: MockMail[];
  q: string;
  selected: Set<string>;
  activeId: string;
  onToggleRow: (id: string, checked: boolean) => void;
  onItemClick: (id: string) => void;
  matchedIds?: Set<string>;
}) {
  const { mails, q, selected, onToggleRow, onItemClick, activeId, matchedIds } = props;
  const matched = matchedIds ?? new Set<string>();
  return (
    <ul className="divide-y">
      {mails.map((m) => {
        const unread = !m.read;
        return (
          <motion.li
            key={m.id}
            whileHover={{ backgroundColor: "hsl(var(--accent))" }}
            className={`p-3 cursor-pointer ${activeId === m.id ? "bg-accent ring-1 ring-border" : ""}`}
            onClick={() => onItemClick(m.id)}
            aria-current={activeId === m.id ? "true" : undefined}
          >
            <div className="flex items-start gap-3">
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selected.has(m.id)}
                  onCheckedChange={(v) => onToggleRow(m.id, Boolean(v))}
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
                    {matched.has(m.id) ? (
                      <Wand2 className="h-3.5 w-3.5 text-violet-500" aria-label="命中规则" />
                    ) : null}
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
  );
}

export function ReaderPane({ mail }: { mail: MockMail | null }) {
  if (!mail) {
    return <div className="text-sm text-muted-foreground">无可显示的邮件，请在左侧选择或调整筛选条件。</div>;
  }
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">{mail.subject}</div>
        <div className="text-xs text-muted-foreground">{mail.date}</div>
      </div>
      <div className="text-sm text-muted-foreground">来自 {mail.from}</div>
      <Separator />
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p>{mail.snippet}（正文占位：此处将渲染邮件 HTML 内容与附件列表。）</p>
      </div>
    </>
  );
}