import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Send, Trash2, Loader2 } from "lucide-react";
import { motion } from "motion/react";

export interface TopActionsProps {
  onCompose?: () => void;
  onSend?: () => void;
  onDelete?: () => void;
  disableSend?: boolean;
  disableDelete?: boolean;
  sending?: boolean;
}

export function TopActions({
  onCompose,
  onSend,
  onDelete,
  disableSend,
  disableDelete,
  sending,
}: TopActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-2"
      role="toolbar"
      aria-label="邮件常用操作"
    >
      <Button variant="default" className="gap-2" onClick={onCompose} aria-label="写邮件">
        <Pencil className="h-4 w-4" />
        写邮件
      </Button>
      <Button
        variant="secondary"
        className="gap-2"
        onClick={onSend}
        disabled={disableSend || sending}
        aria-label="发送"
      >
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {sending ? "发送中…" : "发送"}
      </Button>
      <Button
        variant="ghost"
        className="gap-2 text-destructive hover:text-destructive"
        onClick={onDelete}
        disabled={disableDelete}
        aria-label="删除"
      >
        <Trash2 className="h-4 w-4" />
        删除
      </Button>
    </motion.div>
  );
}

export default TopActions;