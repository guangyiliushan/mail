import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Loader2, Shield, CheckCircle2, ClipboardPaste } from "lucide-react";

/**
 * Verify (OTP)
 * - 验证 6 位数字；支持粘贴智能识别数字
 * - 倒计时重发（Mock）
 * - 成功后跳转登录页
 */
export default function Verify() {
  const nav = useNavigate();
  const digits = 6;
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(30);

  const boxes = useMemo(() => Array.from({ length: digits }, (_, i) => code[i] ?? ""), [code, digits]);

  useEffect(() => {
    // 倒计时
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function normalize(v: string) {
    return v.replace(/\D/g, "").slice(0, digits);
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      setCode(normalize(text));
    } catch {
      // ignore
    }
  }

  function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text");
    setCode(normalize(text));
    e.preventDefault();
  }

  function validate(): string | null {
    if (code.length !== digits) return `请输入 ${digits} 位验证码`;
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // Mock 校验
      await new Promise((r) => setTimeout(r, 700));
      nav("/auth/login", { replace: true });
    } catch {
      setError("验证失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-md" aria-label="邮箱验证页">
      <div className="mb-3">
        <h1 className="text-lg font-semibold">邮箱验证</h1>
        <p className="text-sm text-muted-foreground">我们已向你的邮箱发送验证码，请输入 6 位数字完成验证。</p>
      </div>

      <Card className="p-4 md:p-6">
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          {error ? (
            <Alert variant="destructive" role="alert" aria-live="assertive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-4 w-4" />
              支持粘贴自动识别验证码。
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="otp" className="sr-only">验证码</Label>
            <Input
              id="otp"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="输入 6 位验证码"
              value={code}
              onChange={(e) => setCode(normalize(e.target.value))}
              onPaste={onPaste}
              aria-invalid={!!error && code.length !== digits ? "true" : "false"}
            />
          </div>

          <div className="flex gap-2 justify-center">
            {boxes.map((b, i) => (
              <div key={i} className="h-10 w-10 border rounded-md grid place-items-center text-lg font-medium">
                {b || <span className="text-muted-foreground">•</span>}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              className="text-muted-foreground hover:underline disabled:opacity-60"
              disabled={cooldown > 0}
              onClick={() => setCooldown(30)}
              aria-disabled={cooldown > 0}
            >
              {cooldown > 0 ? `重发验证码（${cooldown}s）` : "重发验证码"}
            </button>
            <button type="button" className="inline-flex items-center gap-1 text-primary hover:underline" onClick={pasteFromClipboard}>
              <ClipboardPaste className="h-4 w-4" />
              从剪贴板粘贴
            </button>
          </div>

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
            完成验证
          </Button>

          <div className="text-xs text-muted-foreground text-center">
            验证成功后将跳转到登录页
          </div>
        </form>

        <div className="mt-4 text-sm">
          没有收到邮件？<Link to="/auth/register" className="text-primary hover:underline">返回注册</Link>
        </div>
      </Card>
    </motion.div>
  );
}