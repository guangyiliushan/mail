import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Loader2, UserPlus } from "lucide-react";

/**
 * Register
 * - 校验：昵称必填、邮箱格式、密码>=8、确认密码一致
 * - 反馈：错误提示 + 按钮加载
 * - 流程：成功后跳转 /auth/verify
 */
function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function Register() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): string | null {
    if (!name.trim()) return "请输入昵称";
    if (!email.trim()) return "请输入邮箱地址";
    if (!isEmail(email.trim())) return "邮箱格式不正确";
    if (!pwd) return "请输入密码";
    if (pwd.length < 8) return "密码长度至少 8 位";
    if (confirm !== pwd) return "两次输入的密码不一致";
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
      // Mock 注册：模拟网络延迟与提交
      await new Promise((r) => setTimeout(r, 700));
      nav("/auth/verify", { replace: true });
    } catch {
      setError("注册失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-md" aria-label="注册页">
      <div className="mb-3">
        <h1 className="text-lg font-semibold">创建账户</h1>
        <p className="text-sm text-muted-foreground">使用邮箱注册新账户。</p>
      </div>

      <Card className="p-4 md:p-6">
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          {error ? (
            <Alert variant="destructive" role="alert" aria-live="assertive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <UserPlus className="h-4 w-4" />
              注册后将发送验证邮件，请前往邮箱完成验证。
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">昵称</Label>
            <Input id="name" placeholder="你的称呼" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input id="email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input id="password" type="password" autoComplete="new-password" placeholder="至少 8 位" value={pwd} onChange={(e) => setPwd(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">确认密码</Label>
            <Input id="confirm" type="password" autoComplete="new-password" placeholder="再次输入新密码" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">已有账户？</span>
            <Link to="/auth/login" className="text-primary hover:underline">去登录</Link>
          </div>

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            注册并验证
          </Button>

          <Separator />
          <div className="text-xs text-muted-foreground">提交注册即表示同意服务协议与隐私政策</div>
        </form>
      </Card>
    </motion.div>
  );
}