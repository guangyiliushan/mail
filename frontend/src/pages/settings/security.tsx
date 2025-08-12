import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { Alert, AlertDescription } from "../../components/ui/alert";
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
} from "../../components/ui/alert-dialog";
import { Loader2, Shield, AlertTriangle } from "lucide-react";
import { signOut } from "../../stores/auth-store";

/**
 * Settings/Security
 * - 修改密码（表单校验 + 加载/成功反馈）
 * - 危险操作：注销登录、删除账户（AlertDialog 确认）
 * - 纯前端 Mock 交互，后续可替换为真实 API
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

  function validate(): string | null {
    if (!oldPwd) return "请输入当前密码";
    if (!newPwd) return "请输入新密码";
    if (newPwd.length < 8) return "新密码长度至少 8 位";
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
            <div className="space-y-2">
              <Label htmlFor="old">当前密码</Label>
              <Input
                id="old"
                type="password"
                placeholder="••••••••"
                value={oldPwd}
                onChange={(e) => setOldPwd(e.target.value)}
                aria-invalid={!!error && !oldPwd ? "true" : "false"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">新密码</Label>
              <Input
                id="new"
                type="password"
                placeholder="至少 8 位"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                aria-invalid={!!error && newPwd.length < 8 ? "true" : "false"}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="confirm">确认新密码</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="再次输入新密码"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                aria-invalid={!!error && confirm !== newPwd ? "true" : "false"}
              />
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

            {/* 删除账户确认 */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  删除账户
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>删除账户（不可撤销）</AlertDialogTitle>
                  <AlertDialogDescription>
                    该操作将永久删除账户与数据（Mock）。确认继续？
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount}>
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