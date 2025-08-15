import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Separator } from "../../../components/ui/separator";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../components/ui/alert-dialog";
import { Loader2, Shield, AlertTriangle, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { signOut } from "@/features/auth/stores/auth-store";


/**
 * Settings/Security
 * - 修改密码（强密码校验 + 显示/隐藏）
 * - 危险操作：注销登录、删除账户（需输入 DELETE 二次确认）
 * - 纯前端 Mock 交互
 */
export default function SettingsSecurity() {
  const nav = useNavigate();

  // 改密表单状态
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 密码可见性
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // 删除账户二次确认
  const [delConfirm, setDelConfirm] = useState("");

  // 强度与规则校验
  const checks = useMemo(() => {
    return {
      len: newPwd.length >= 8,
      upper: /[A-Z]/.test(newPwd),
      lower: /[a-z]/.test(newPwd),
      num: /\d/.test(newPwd),
      sym: /[^A-Za-z0-9]/.test(newPwd),
    };
  }, [newPwd]);

  const categoryCount = (checks.upper ? 1 : 0) + (checks.lower ? 1 : 0) + (checks.num ? 1 : 0) + (checks.sym ? 1 : 0);
  const strength = newPwd.length === 0 ? 0 : (checks.len ? Math.min(4, Math.max(1, categoryCount)) : 0); // 0~4
  const strengthLabel = ["", "弱", "中", "强", "极强"][strength] ?? "";

  function validate(): string | null {
    if (!oldPwd) return "请输入当前密码";
    if (!newPwd) return "请输入新密码";
    if (!checks.len) return "新密码长度至少 8 位";
    if (categoryCount < 3) return "新密码需包含大小写、数字、符号中的至少三类";
    if (newPwd === oldPwd) return "新密码不能与当前密码相同";
    if (!confirm) return "请再次输入新密码";
    if (confirm !== newPwd) return "两次输入的新密码不一致";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOk(null);
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // Mock 修改密码：模拟网络延迟
      await new Promise((r) => setTimeout(r, 800));
      setOk("密码已更新");
      setOldPwd("");
      setNewPwd("");
      setConfirm("");
    } catch {
      setError("修改失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await new Promise((r) => setTimeout(r, 300));
    signOut();
    nav("/auth/login", { replace: true });
  }

  async function handleDeleteAccount() {
    // Mock 删除账户：可替换为真实 API 调用
    await new Promise((r) => setTimeout(r, 800));
    signOut();
    nav("/auth/register", { replace: true });
  }

  const Bar = ({ activeIndex }: { activeIndex: number }) => {
    const base = "h-1.5 rounded-full flex-1 transition-colors";
    return (
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => {
          const active = i < activeIndex;
          const color =
            activeIndex <= 1 ? "bg-red-500/80" :
            activeIndex === 2 ? "bg-amber-500/80" :
            "bg-emerald-600/90";
          return <div key={i} className={`${base} ${active ? color : "bg-muted"}`} />;
        })}
      </div>
    );
  };

  const RuleItem = ({ ok, label }: { ok: boolean; label: string }) => (
    <div className={`flex items-center gap-1.5 ${ok ? "text-emerald-600" : "text-muted-foreground"}`}>
      {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
      <span className="text-xs">{label}</span>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl">
      <div className="mb-3">
        <h1 className="text-lg font-semibold">安全设置</h1>
        <p className="text-sm text-muted-foreground">修改密码与账户安全相关操作。</p>
      </div>

      <Card className="p-4 md:p-6 space-y-4">
        {/* 顶部提示/错误 */}
        {error ? (
          <Alert variant="destructive" role="alert" aria-live="assertive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4" />
            建议启用强密码并定期更新。
          </div>
        )}
        {ok ? (
          <Alert role="status" aria-live="polite">
            <AlertDescription>{ok}</AlertDescription>
          </Alert>
        ) : null}

        {/* 修改密码表单 */}
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <div className="grid gap-3 md:grid-cols-2">
            {/* 当前密码 */}
            <div className="space-y-2">
              <Label htmlFor="old">当前密码</Label>
              <div className="relative">
                <Input
                  id="old"
                  type={showOld ? "text" : "password"}
                  placeholder="••••••••"
                  value={oldPwd}
                  onChange={(e) => setOldPwd(e.target.value)}
                  aria-invalid={!!error && !oldPwd ? "true" : "false"}
                />
                <button
                  type="button"
                  aria-label="显示或隐藏密码"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowOld((v) => !v)}
                >
                  {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* 新密码 */}
            <div className="space-y-2">
              <Label htmlFor="new">新密码</Label>
              <div className="relative">
                <Input
                  id="new"
                  type={showNew ? "text" : "password"}
                  placeholder="至少 8 位，包含多类字符"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  aria-invalid={!!error && (!checks.len || categoryCount < 3) ? "true" : "false"}
                />
                <button
                  type="button"
                  aria-label="显示或隐藏密码"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNew((v) => !v)}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* 强度条 + 规则 */}
            <div className="space-y-1 md:col-span-2">
              <Bar activeIndex={strength} />
              <div className="text-xs text-muted-foreground">
                {strength > 0 ? `密码强度：${strengthLabel}（建议包含 3 类以上字符组合）` : "建议至少 8 位，包含大小写、数字和符号的组合"}
              </div>
              <div className="flex flex-wrap gap-3">
                <RuleItem ok={checks.len} label="≥ 8 位" />
                <RuleItem ok={checks.upper} label="大写字母" />
                <RuleItem ok={checks.lower} label="小写字母" />
                <RuleItem ok={checks.num} label="数字" />
                <RuleItem ok={checks.sym} label="符号" />
              </div>
            </div>

            {/* 确认新密码 */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="confirm">确认新密码</Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="再次输入新密码"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  aria-invalid={!!error && confirm !== newPwd ? "true" : "false"}
                />
                <button
                  type="button"
                  aria-label="显示或隐藏密码"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              更新密码
            </Button>
            <Button type="button" variant="ghost" onClick={() => { setError(null); setOk(null); }}>
              取消
            </Button>
          </div>
        </form>

        <Separator />

        {/* 危险操作 */}
        <div className="space-y-2">
          <div className="text-sm font-medium">危险操作</div>
          <p className="text-sm text-muted-foreground">
            注销将退出当前设备的登录状态；删除账户将清除所有数据（Mock UI）。
          </p>
          <div className="flex gap-2 flex-wrap">
            {/* 注销确认 */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="secondary">注销登录</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认注销？</AlertDialogTitle>
                  <AlertDialogDescription>
                    将退出当前设备的登录状态。你可以稍后重新登录。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSignOut}>确认</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* 删除账户确认（需输入 DELETE） */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={() => setDelConfirm("")}
                  title="删除账户（不可撤销）"
                >
                  <AlertTriangle className="h-4 w-4" />
                  删除账户
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>删除账户（不可撤销）</AlertDialogTitle>
                  <AlertDialogDescription>
                    该操作将永久删除账户与数据（Mock）。为确认，请在下方输入大写单词 DELETE。
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-2">
                  <Label htmlFor="confirm-delete">输入 DELETE 以确认</Label>
                  <Input
                    id="confirm-delete"
                    placeholder="DELETE"
                    value={delConfirm}
                    onChange={(e) => setDelConfirm(e.target.value)}
                    aria-describedby="confirm-delete-hint"
                  />
                  <div id="confirm-delete-hint" className="text-xs text-muted-foreground">
                    安全提示：输入正确后才能继续。
                  </div>
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={delConfirm !== "DELETE"}
                    onClick={handleDeleteAccount}
                  >
                    确认删除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}