import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { Mail, Star, Send, Trash2, Pencil, Loader2, Shield, EyeOff, Eye } from "lucide-react";

/**
 * 通用小组件
 */
function SectionTitle({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {desc ? <p className="text-sm text-muted-foreground">{desc}</p> : null}
    </div>
  );
}

/**
 * Auth: Login
 */
export function LoginPage() {
  const [loading, setLoading] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-md">
      <SectionTitle title="登录" desc="欢迎回来，请使用邮箱与密码登录。" />
      <Card className="p-4 md:p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">邮箱</Label>
          <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">密码</Label>
          <Input id="password" type="password" placeholder="••••••••" autoComplete="current-password" />
        </div>
        <div className="flex items-center justify-between text-sm">
          <a className="text-primary hover:underline" href="/auth/forgot">忘记密码？</a>
          <a className="text-muted-foreground hover:underline" href="/auth/register">去注册</a>
        </div>
        <Button className="w-full" disabled={loading} onClick={() => setLoading(true)}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          登录
        </Button>
        <Separator />
        <div className="text-xs text-muted-foreground">
          登录即表示同意服务协议与隐私政策
        </div>
      </Card>
    </motion.div>
  );
}

/**
 * Auth: Register
 */
export function RegisterPage() {
  const [loading, setLoading] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-md">
      <SectionTitle title="创建账户" desc="使用邮箱注册新账户。" />
      <Card className="p-4 md:p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">昵称</Label>
          <Input id="name" placeholder="你的称呼" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">邮箱</Label>
          <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">密码</Label>
          <Input id="password" type="password" placeholder="至少 8 位" autoComplete="new-password" />
        </div>
        <Button className="w-full" disabled={loading} onClick={() => setLoading(true)}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          注册并验证
        </Button>
        <div className="text-sm">
          已有账户？<a className="text-primary hover:underline" href="/auth/login">去登录</a>
        </div>
      </Card>
    </motion.div>
  );
}

/**
 * Auth: Verify (OTP)
 */
export function VerifyPage() {
  const [code, setCode] = useState("");
  const digits = 6;
  const onChange = (v: string) => setCode(v.replace(/\D/g, "").slice(0, digits));

  const boxes = Array.from({ length: digits }, (_, i) => code[i] ?? "");
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-md">
      <SectionTitle title="邮箱验证" desc="我们已向你的邮箱发送验证码，请输入 6 位数字以完成验证。" />
      <Card className="p-4 md:p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otp" className="sr-only">验证码</Label>
          <Input
            id="otp"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="输入 6 位验证码"
            value={code}
            onChange={(e) => onChange(e.target.value)}
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
          <button className="text-muted-foreground hover:underline" type="button">重发验证码</button>
          <span className="text-muted-foreground">未收到？检查垃圾邮件</span>
        </div>
        <Button className="w-full">
          完成验证
        </Button>
      </Card>
    </motion.div>
  );
}

/**
 * Mail: Inbox (列表 + 阅读窗格)
 */
type MockMail = {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  date: string;
  starred?: boolean;
  category?: "重要" | "广告" | "推广";
};

const MOCK_MAILS: MockMail[] = [
  { id: "1", subject: "项目进度同步与下周计划", from: "Alice", snippet: "这周我们完成了 A/B 两项里程碑，详细见文档...", date: "10:24", starred: true, category: "重要" },
  { id: "2", subject: "八月促销专享优惠", from: "ShopPlus", snippet: "限时 72 小时满减，会员再享 9 折...", date: "昨天", category: "推广" },
  { id: "3", subject: "发票开具提醒", from: "Finance Bot", snippet: "您七月账期的增值税专用发票已开具...", date: "周一", category: "重要" },
  { id: "4", subject: "新品上架通知", from: "AdCorp", snippet: "全新系列上新，点击查看详情...", date: "周一", category: "广告" },
];

export function InboxPage() {
  // 视图筛选 + 搜索关键字 + 当前选中
  const VIEWS = ["全部", "重要", "广告", "推广", "星标"] as const;
  type View = typeof VIEWS[number];

  const [view, setView] = useState<View>("全部");
  const [keyword, setKeyword] = useState("");
  const [activeId, setActiveId] = useState("1");

  // 过滤逻辑
  const q = keyword.trim().toLowerCase();
  const filtered = MOCK_MAILS.filter((m) => {
    const viewOk =
      view === "全部" ? true : view === "星标" ? !!m.starred : m.category === view;
    const text = `${m.subject} ${m.from} ${m.snippet}`.toLowerCase();
    const kwOk = q ? text.includes(q) : true;
    return viewOk && kwOk;
  });

  // 当前阅读项（若当前选中不在过滤结果中，则为空或取第一个）
  const active =
    filtered.find((m) => m.id === activeId) ?? filtered[0] ?? null;

  // 高亮匹配
  function escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function highlight(text: string, query: string) {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark
          key={i}
          className="bg-yellow-200/60 dark:bg-yellow-600/40 rounded px-0.5"
        >
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* 顶部动作 */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="default" className="gap-2">
          <Pencil className="h-4 w-4" /> 写邮件
        </Button>
        <Button variant="secondary" className="gap-2">
          <Send className="h-4 w-4" /> 发送
        </Button>
        <Button variant="ghost" className="gap-2">
          <Trash2 className="h-4 w-4" /> 删除
        </Button>
      </div>

      {/* 筛选 + 搜索 */}
      <Card className="p-2 md:p-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {VIEWS.map((v) => (
              <Button
                key={v}
                size="sm"
                variant={view === v ? "default" : "secondary"}
                onClick={() => setView(v)}
              >
                {v}
              </Button>
            ))}
          </div>
          <div className="w-full md:w-[320px]">
            <Input
              placeholder="搜索主题、发件人、摘要…"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[380px_1fr]">
        {/* 列表 */}
        <Card className="p-2">
          <div className="px-2 py-1 text-xs text-muted-foreground">
            共 {filtered.length} 封 {view !== "全部" ? `· ${view}` : ""}
          </div>
          <Separator className="my-1" />

          {filtered.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              无匹配邮件。尝试清除筛选或更换关键字。
            </div>
          ) : (
            <ul className="divide-y">
              {filtered.map((m) => (
                <motion.li
                  key={m.id}
                  whileHover={{ backgroundColor: "hsl(var(--accent))" }}
                  className={`p-3 cursor-pointer ${
                    activeId === m.id ? "bg-accent ring-1 ring-border" : ""
                  }`}
                  onClick={() => setActiveId(m.id)}
                  aria-current={activeId === m.id ? "true" : undefined}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {highlight(m.subject, q)}
                    </div>
                    <div className="flex items-center gap-2">
                      {m.category ? (
                        <Badge variant="secondary">{m.category}</Badge>
                      ) : null}
                      {m.starred ? (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      ) : (
                        <Star className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {m.date}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {highlight(`${m.from} · ${m.snippet}`, q)}
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </Card>

        {/* 阅读窗格 */}
        <Card className="p-4 space-y-2">
          {!active ? (
            <div className="text-sm text-muted-foreground">
              无可显示的邮件，请在左侧选择或调整筛选条件。
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">{active.subject}</div>
                <div className="text-xs text-muted-foreground">{active.date}</div>
              </div>
              <div className="text-sm text-muted-foreground">来自 {active.from}</div>
              <Separator />
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  {active.snippet}
                  （正文占位：此处将渲染邮件 HTML 内容与附件列表。）
                </p>
              </div>
            </>
          )}
        </Card>
      </div>
    </motion.div>
  );
}

/**
 * Mail: Compose (富文本占位)
 */
export function ComposePage() {
  const [showPwd, setShowPwd] = useState(false); // 仅示例交互
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <SectionTitle title="撰写邮件" desc="支持草稿自动保存与富文本编辑（占位）。" />
      <Card className="p-4 space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="to">收件人 (To)</Label>
            <Input id="to" placeholder="user@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cc">抄送 (Cc)</Label>
            <Input id="cc" placeholder="cc@example.com" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">主题</Label>
          <Input id="subject" placeholder="请输入主题" />
        </div>

        {/* 工具栏占位 */}
        <div className="flex flex-wrap items-center gap-2 py-1">
          <Button variant="secondary" size="sm">B</Button>
          <Button variant="secondary" size="sm"><i>I</i></Button>
          <Button variant="secondary" size="sm">H1</Button>
          <Button variant="secondary" size="sm">链接</Button>
          <Button variant="secondary" size="sm">列表</Button>
        </div>

        {/* 富文本编辑器占位（Tiptap 接入位） */}
        <div className="min-h-[220px] border rounded-md p-3 text-sm text-muted-foreground">
          富文本编辑器占位：后续集成 Tiptap 2
        </div>

        <div className="flex items-center gap-2">
          <Button className="gap-2"><Send className="h-4 w-4" /> 发送</Button>
          <Button variant="secondary">保存草稿</Button>
          <Button variant="ghost" className="ml-auto gap-2" onClick={() => setShowPwd(s => !s)}>
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} 示例切换
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

/**
 * Settings: Security（修改密码与注销）
 */
export function SettingsSecurityPage() {
  const [loading, setLoading] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl">
      <SectionTitle title="安全设置" desc="修改密码与账户操作。" />
      <Card className="p-4 md:p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          建议启用强密码，定期更新。
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="old">当前密码</Label>
            <Input id="old" type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new">新密码</Label>
            <Input id="new" type="password" placeholder="至少 8 位" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="confirm">确认新密码</Label>
            <Input id="confirm" type="password" placeholder="再次输入新密码" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button disabled={loading} onClick={() => setLoading(true)}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            更新密码
          </Button>
          <Button variant="ghost">取消</Button>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="text-sm font-medium">危险操作</div>
          <p className="text-sm text-muted-foreground">
            注销将退出当前设备的登录状态；删除账户将清除所有数据（占位 UI）。
          </p>
          <div className="flex gap-2">
            <Button variant="secondary">注销登录</Button>
            <Button variant="destructive">删除账户</Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}