import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Card } from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Progress } from "../../../components/ui/progress";
import { Send, Eye, Loader2, CheckCircle2, Undo2 } from "lucide-react";
import RichTextEditor from "../components/compose/rich-text-editor";
import { useDebouncedCallback } from "@/shared/hooks/use-debounce";
import { loadDraft, saveDraft, clearDraft } from "@/lib/draft";
import AttachmentZone, { type Attachment } from "../components/compose/attachment-zone";
import RecipientInput, { type Recipient } from "../components/recipient-input";

type SaveStatus = "idle" | "saving" | "saved" | "error";
type SendState = "idle" | "sending" | "sent";

function formatTime(ts?: number) {
  if (!ts) return "";
  const d = new Date(ts);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// 将字符串解析为收件人数组（按逗号/分号/空格/换行分割）
function parseRecipients(raw?: string): Recipient[] {
  if (!raw) return [];
  return raw
    .split(/[,;\s\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map<Recipient>((email) => ({
      email,
      valid: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email),
    }));
}

// 将收件人数组序列化为保存用字符串
function joinRecipients(list: Recipient[]): string {
  return list.map((r) => r.email).join(", ");
}

export default function Compose() {
  // 表单状态
  const [toRecipients, setToRecipients] = useState<Recipient[]>([]);
  const [ccRecipients, setCcRecipients] = useState<Recipient[]>([]);
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState<string>("");

  // Bcc 密送
  const [bccRecipients, setBccRecipients] = useState<Recipient[]>([]);

  // 附件
  const [files, setFiles] = useState<Attachment[]>([]);

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
      setToRecipients(parseRecipients(d.to));
      setCcRecipients(parseRecipients(d.cc));
      // Bcc 兼容：从 localStorage 恢复（避免修改 draft 类型）
      const bccRaw = window.localStorage.getItem("draft_bcc") || "";
      setBccRecipients(parseRecipients(bccRaw));
      setSubject(d.subject || "");
      setHtml(d.html || "");
      setLastSavedAt(d.updatedAt);
      setSaveStatus("saved");
    } else {
      // 首次进入也尝试恢复 Bcc
      const bccRaw = window.localStorage.getItem("draft_bcc") || "";
      setBccRecipients(parseRecipients(bccRaw));
    }
  }, []);

  // 防抖保存（与原 saveDraft 接口兼容：传 string）
  const doAutoSave = useDebouncedCallback(async () => {
    try {
      setSaveStatus("saving");
      const saved = await saveDraft({
        to: joinRecipients(toRecipients),
        cc: joinRecipients(ccRecipients),
        subject,
        html,
      });
      setSaveStatus("saved");
      setLastSavedAt(saved.updatedAt);
    } catch {
      setSaveStatus("error");
    }
  }, 600);

  // 任何字段变化都触发自动保存（防抖）
  useEffect(() => {
    if (canEdit) {
      doAutoSave();
    }
  }, [toRecipients, ccRecipients, subject, html, canEdit, doAutoSave]);

  // 单独持久化 Bcc 至 localStorage（不影响 saveDraft 类型）
  useEffect(() => {
    window.localStorage.setItem("draft_bcc", joinRecipients(bccRecipients));
  }, [bccRecipients]);

  // 发送与撤销
  async function handleSend() {
    if (sendState === "sending") return;
    setSendState("sending");
    // 模拟发送（可替换为调用后端 API）
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
    // 撤销后立刻保存一次，以保证恢复草稿
    setSaveStatus("saving");
    saveDraft({
      to: joinRecipients(toRecipients),
      cc: joinRecipients(ccRecipients),
      subject,
      html,
    })
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

  const hasInvalidRecipients =
    toRecipients.some((r) => !r.valid) || ccRecipients.some((r) => !r.valid) || bccRecipients.some((r) => !r.valid);

  // 重复邮箱检测（跨 To/Cc/Bcc）
  const duplicateEmails = (() => {
    const all = [...toRecipients, ...ccRecipients, ...bccRecipients].map((r) => r.email.toLowerCase());
    const seen = new Set<string>();
    const dup = new Set<string>();
    for (const e of all) {
      if (seen.has(e)) dup.add(e);
      else seen.add(e);
    }
    return Array.from(dup);
  })();

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">撰写邮件</h2>
          <p className="text-sm text-muted-foreground">支持草稿自动保存、富文本编辑与附件。</p>
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
          <RecipientInput
            id="to"
            label="收件人 (To)"
            placeholder="输入邮箱地址，按 Tab/Enter/逗号添加"
            recipients={toRecipients}
            onChange={setToRecipients}
            disabled={!canEdit}
          />
          <RecipientInput
            id="cc"
            label="抄送 (Cc)"
            placeholder="输入邮箱地址，按 Tab/Enter/逗号添加"
            recipients={ccRecipients}
            onChange={setCcRecipients}
            disabled={!canEdit}
          />
          <RecipientInput
            id="bcc"
            label="密送 (Bcc)"
            placeholder="输入邮箱地址，按 Tab/Enter/逗号添加"
            recipients={bccRecipients}
            onChange={setBccRecipients}
            disabled={!canEdit}
            className="md:col-span-2"
          />
        </div>

        {hasInvalidRecipients && (
          <div className="text-xs text-destructive">
            收件人/抄送/密送中存在无效邮箱，请修正后再发送。
          </div>
        )}
        {duplicateEmails.length > 0 && (
          <div className="text-xs text-amber-600 dark:text-amber-400">
            发现重复邮箱：{duplicateEmails.join(", ")}（发送时将自动去重）
          </div>
        )}

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

        <div className="space-y-2">
          <Label>附件</Label>
          <AttachmentZone files={files} onChange={setFiles} disabled={!canEdit} />
        </div>

        <Separator />

        <div className="flex items-center gap-2">
          <Button
            className="gap-2"
            onClick={async () => {
              // 发送前统一去重（不改变 UI，仅用于本次提交载荷）
              const uniq = (list: Recipient[]) => {
                const map = new Map<string, Recipient>();
                list.forEach((r) => {
                  const key = r.email.toLowerCase();
                  if (!map.has(key)) map.set(key, r);
                });
                return Array.from(map.values());
              };
              const toU = uniq(toRecipients);
              const ccU = uniq(
                ccRecipients.filter(
                  (r) => !toU.find((t) => t.email.toLowerCase() === r.email.toLowerCase())
                )
              );
              const bccU = uniq(
                bccRecipients.filter(
                  (r) =>
                    !toU.find((t) => t.email.toLowerCase() === r.email.toLowerCase()) &&
                    !ccU.find((c) => c.email.toLowerCase() === r.email.toLowerCase())
                )
              );

              const payload = {
                to: toU.map(r => r.email),
                cc: ccU.map(r => r.email),
                bcc: bccU.map(r => r.email),
                subject,
                html,
                attachments: files.map(f => ({ name: f.name, size: f.size }))
              };
              // 仅用于占位展示，避免未使用变量导致的编译错误
              // eslint-disable-next-line no-console
              console.log("send payload (mock)", payload);

              await handleSend();
            }}
            disabled={sendState === "sending" || hasInvalidRecipients || toRecipients.length === 0}
            title={toRecipients.length === 0 ? "请至少添加一个收件人" : undefined}
          >
            {sendState === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sendState === "sending" ? "发送中…" : "发送"}
          </Button>
          <Button
            variant="secondary"
            disabled={!canEdit}
            onClick={() => {
              setSaveStatus("saving");
              saveDraft({
                to: joinRecipients(toRecipients),
                cc: joinRecipients(ccRecipients),
                subject,
                html,
              })
                .then((saved) => {
                  setSaveStatus("saved");
                  setLastSavedAt(saved.updatedAt);
                })
                .catch(() => setSaveStatus("error"));
            }}
          >
            保存草稿
          </Button>
          <Button
            variant="ghost"
            className="ml-auto gap-2"
            onClick={() => {}}
            disabled={!canEdit}
            title="示例开关（保留交互动效）"
          >
            <Eye className="h-4 w-4" />
            示例
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}