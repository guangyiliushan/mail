import { Button } from "@/components/ui/button";

import { Send, Undo2, FilePenLine } from "lucide-react";

export type FolderViewType = "drafts" | "sent";

export interface FolderActionsProps {
  view: FolderViewType;
  selectedCount: number;
  onEditDraft?: () => void;   // drafts 专用：编辑所选（要求单选）
  onSendDrafts?: () => void;  // drafts 专用：批量发送
  onRecallSent?: () => void;  // sent 专用：撤回（移回草稿）
  className?: string;
}

/**
 * 仅用于“草稿/已发送”两类视图的专属操作条。
 * - 不涉足具体数据结构与分类判断（如 m.category）
 * - 由父组件提供当前视图类型、已选数量与相应回调
 */
export default function FolderActions({
  view,
  selectedCount,
  onEditDraft,
  onSendDrafts,
  onRecallSent,
  className,
}: FolderActionsProps) {
  if (view !== "drafts" && view !== "sent") return null;

  const wrapperCls = `px-2 py-2 ${className ?? ""}`;

  if (view === "drafts") {
    const canEdit = selectedCount === 1;
    const canSend = selectedCount > 0;
    return (
      <div className={wrapperCls}>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onEditDraft?.()}
            disabled={!canEdit}
            className="gap-1"
            aria-label="编辑草稿"
          >
            <FilePenLine className="h-4 w-4" />
            编辑草稿
          </Button>
          <Button
            size="sm"
            onClick={() => onSendDrafts?.()}
            disabled={!canSend}
            className="gap-1"
            aria-label="发送选中草稿"
          >
            <Send className="h-4 w-4" />
            发送选中
          </Button>
          <span className="text-xs text-muted-foreground">
            已选草稿 {selectedCount} 封
          </span>
        </div>
      </div>
    );
  }

  // view === "sent"
  const canRecall = selectedCount > 0;
  return (
    <div className={wrapperCls}>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onRecallSent?.()}
          disabled={!canRecall}
          className="gap-1"
          aria-label="撤回已发送邮件"
        >
          <Undo2 className="h-4 w-4" />
          撤回发送
        </Button>
        <span className="text-xs text-muted-foreground">
          已选已发送 {selectedCount} 封
        </span>
      </div>
    </div>
  );
}