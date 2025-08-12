import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Progress } from "../../components/ui/progress";
import { Send, EyeOff, Eye, Loader2, CheckCircle2, Undo2 } from "lucide-react";
import RichTextEditor from "../../components/rich-text-editor";
import { useDebouncedCallback } from "../../hooks/use-debounce";
import { loadDraft, saveDraft, clearDraft } from "../../lib/draft";

type SaveStatus = "idle" | "saving" | "saved" | "error";
type SendState = "idle" | "sending" | "sent";

function formatTime(ts?: number) {
  if (!ts) return "";
  const d = new Date(ts);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function Compose() {
  // 表单状态
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState<string>("");

  // 自动保存状态
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<number | undefined>(undefined);

  // 发送流程状态
  const [sendState, setSendState] = useState<SendState>("idle");
  const [undoCountdown, setUndoCountdown] = useState(0);
  const canEdit = sendState !== "sending";

  // 初次加载草稿
  useEffect(() => {
    const d = loadDraft();
    if (d) {
      setTo(d.to || "");
      setCc(d.cc || "");
      setSubject(d.subject || "");
      setHtml(d.html || "");
      setLastSavedAt(d.updatedAt);
      setSaveStatus("saved");
    }
  }, []);

  // 防抖保存
  const doAutoSave = useDebouncedCallback(async () => {
    try {
      setSaveStatus("saving");
      const saved = await saveDraft({ to, cc, subject, html });
      setSaveStatus("saved");
      setLastSavedAt(saved.updatedAt);
    } catch {
      setSaveStatus("error");
    }
  }, 600);

  // 任何字段变化都触发自动保存（防抖）
  useEffect(() => {
    // 仅在可编辑时保存，发送中不触发
    if (canEdit) {
      doAutoSave();
    }
  }, [to, cc, subject, html, canEdit, doAutoSave]);

  // 发送与撤销
  async function handleSend() {
    if (sendState === "sending") return;
    setSendState("sending");
    // 模拟发送
    await new Promise((r) => setTimeout(r, 900));
    setSendState("sent");
    clearDraft();
    setUndoCountdown(5);
  }

  // 撤销计时器
  useEffect(() => {
    if (sendState !== "sent" || undoCountdown <= 0) return;
    const t = setTimeout(() => setUndoCountdown((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [sendState, undoCountdown]);

  function handleUndo() {
    // 撤销发送：仅 UI 恢复为可继续编辑状态
    setSendState("idle");
    // 撤销后立刻保存一次，以保证恢复草稿（这里直接触发保存）
    setSaveStatus("saving");
    saveDraft({ to, cc, subject, html })
      .then((saved) => {
        setSaveStatus("saved");
        setLastSavedAt(saved.updatedAt);
      })
      .catch(() => setSaveStatus("error"));
  }

  // 顶部状态条
  const saveBar = useMemo(() => {
    switch (saveStatus) {
      case "saving":
        return (
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground">保存中…</div>
            <div className="w-32">
              <Progress value={66} />
            </div>
          </div>
        );
      case "saved":
        return (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            已自动保存 {lastSavedAt ? `· ${formatTime(lastSavedAt)}` : ""}
          </div>
        );
      case "error":
        return (
          <div className="text-xs text-red-500">
            保存失败，请稍后重试
          </div>
        );
      default:
        return null;
    }
  }, [saveStatus, lastSavedAt]);

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">撰写邮件</h2>
          <p className="text-sm text-muted-foreground">支持草稿自动保存与富文本编辑。</p>
        </div>
        {saveBar}
      </div>

      {/* 发送成功可撤销提示 */}
      {sendState === "sent" && (
        <Alert role="status" aria-live="polite">
          <AlertDescription className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              邮件已发送。{undoCountdown > 0 ? `可在 ${undoCountdown}s 内撤销。` : "撤销时间已结束。"}
            </span>
            {undoCountdown > 0 ? (
              <Button variant="ghost" size="sm" className="gap-1" onClick={handleUndo}>
                <Undo2 className="h-4 w-4" />
                撤销
              </Button>
            ) : null}
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-4 space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="to">收件人 (To)</Label>
            <Input
              id="to"
              placeholder="user@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cc">抄送 (Cc)</Label>
            <Input
              id="cc"
              placeholder="cc@example.com"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              disabled={!canEdit}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">主题</Label>
          <Input
            id="subject"
            placeholder="请输入主题"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={!canEdit}
          />
        </div>

        <RichTextEditor
          value={html}
          onChange={setHtml}
          placeholder="撰写邮件内容…"
          minHeight={280}
          className={canEdit ? "" : "opacity-60 pointer-events-none"}
        />

        <Separator />

        <div className="flex items-center gap-2">
          <Button className="gap-2" onClick={handleSend} disabled={sendState === "sending"}>
            {sendState === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sendState === "sending" ? "发送中…" : "发送"}
          </Button>
          <Button variant="secondary" disabled={!canEdit}>
            保存草稿
          </Button>
          <Button
            variant="ghost"
            className="ml-auto gap-2"
            onClick={() => {}}
            disabled={!canEdit}
            title="示例开关（保留交互动效）"
          >
            {/* 保留示例开关的按钮占位（避免 UI 跳动） */}
            <Eye className="h-4 w-4" />
            示例
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}