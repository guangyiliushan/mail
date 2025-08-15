import React from "react";
import { Separator } from "@/components/ui/separator";
import type { MockMail } from "../../types/index";

export type ReaderPaneProps = {
  mail: MockMail | null;
};

export function ReaderPane({ mail }: ReaderPaneProps) {
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