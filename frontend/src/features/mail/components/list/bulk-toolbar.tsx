import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Folder } from "lucide-react";
import type { Category } from "../../types/index";

export type BulkToolbarProps = {
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
};

export function BulkToolbar(props: BulkToolbarProps) {
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