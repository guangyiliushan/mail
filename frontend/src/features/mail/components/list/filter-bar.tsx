import React from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Filter, Calendar, X } from "lucide-react";
import type { Category } from "../../types/index";

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