import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Separator } from "../../../components/ui/separator";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Loader2, ShieldCheck } from "lucide-react";
import { signIn } from "../stores/auth-store";

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): string | null {
    if (!email.trim()) return "请输入邮箱地址";
    if (!isEmail(email.trim())) return "邮箱格式不正确";
    if (!pwd) return "请输入密码";
    if (pwd.length < 8) return "密码长度至少 8 位";
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
    // Mock 登录：模拟网络延迟与结果
    try {
      await new Promise((r) => setTimeout(r, 600));
      signIn(email);
      nav("/mail/inbox", { replace: true });
    } catch (error) {
      console.error(error);
      setError("登录失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-md"
      aria-label="登录页"
    >
      <div className="mb-3">
        <h1 className="text-lg font-semibold">登录</h1>
        <p className="text-sm text-muted-foreground">欢迎回来，请使用邮箱与密码登录。</p>
      </div>

      <Card className="p-4 md:p-6">
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          {error ? (
            <Alert variant="destructive" role="alert" aria-live="assertive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              已启用受保护路由，登录后可访问应用。
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!error && !email ? "true" : "false"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              aria-invalid={!!error && !pwd ? "true" : "false"}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link to="/auth/forgot" className="text-primary hover:underline">
              忘记密码？
            </Link>
            <Link to="/auth/register" className="text-muted-foreground hover:underline">
              去注册
            </Link>
          </div>

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            登录
          </Button>

          <Separator />

          <div className="text-xs text-muted-foreground">
            登录即表示同意服务协议与隐私政策
          </div>
        </form>
      </Card>
    </motion.div>
  );
}