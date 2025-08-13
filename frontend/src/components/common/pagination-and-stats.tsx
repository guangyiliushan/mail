import React from "react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface ListStatsProps {
  count: number;
  unit?: string;
  segments?: string[];
  className?: string;
}

export function ListStats({ count, unit, segments, className }: ListStatsProps) {
  const tail =
    segments && segments.length
      ? " · " + segments.filter(Boolean).join(" · ")
      : "";
  return (
    <div className={cn("text-xs text-muted-foreground", className)}>
      共 {count}
      {unit ? ` ${unit}` : ""}{tail}
    </div>
  );
}

export interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  summary?: string;
  className?: string;
}

export function PaginationControls({
  page,
  totalPages,
  onPrev,
  onNext,
  summary,
  className,
}: PaginationControlsProps) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="text-xs text-muted-foreground">{summary}</div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="gap-1"
          onClick={onPrev}
          disabled={!canPrev}
          aria-label="上一页"
        >
          <ChevronLeft className="h-4 w-4" />
          上一页
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1"
          onClick={onNext}
          disabled={!canNext}
          aria-label="下一页"
        >
          下一页
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}