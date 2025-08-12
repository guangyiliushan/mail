import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { Star, Send, Trash2, Pencil } from "lucide-react";

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

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200/60 dark:bg-yellow-600/40 rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function Inbox() {
  const VIEWS = ["全部", "重要", "广告", "推广", "星标"] as const;
  type View = typeof VIEWS[number];

  const [view, setView] = useState<View>("全部");
  const [keyword, setKeyword] = useState("");
  const [activeId, setActiveId] = useState("1");

  const q = keyword.trim().toLowerCase();
  const filtered = MOCK_MAILS.filter((m) => {
    const viewOk = view === "全部" ? true : view === "星标" ? !!m.starred : m.category === view;
    const text = `${m.subject} ${m.from} ${m.snippet}`.toLowerCase();
    const kwOk = q ? text.includes(q) : true;
    return viewOk && kwOk;
  });

  const active = filtered.find((m) => m.id === activeId) ?? filtered[0] ?? null;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {/* 顶部动作 */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="default" className="gap-2"><Pencil className="h-4 w-4" /> 写邮件</Button>
        <Button variant="secondary" className="gap-2"><Send className="h-4 w-4" /> 发送</Button>
        <Button variant="ghost" className="gap-2"><Trash2 className="h-4 w-4" /> 删除</Button>
      </div>

      {/* 筛选 + 搜索 */}
      <Card className="p-2 md:p-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {VIEWS.map((v) => (
              <Button key={v} size="sm" variant={view === v ? "default" : "secondary"} onClick={() => setView(v)}>
                {v}
              </Button>
            ))}
          </div>
          <div className="w-full md:w-[320px]">
            <Input placeholder="搜索主题、发件人、摘要…" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
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
            <div className="p-6 text-sm text-muted-foreground">无匹配邮件。尝试清除筛选或更换关键字。</div>
          ) : (
            <ul className="divide-y">
              {filtered.map((m) => (
                <motion.li
                  key={m.id}
                  whileHover={{ backgroundColor: "hsl(var(--accent))" }}
                  className={`p-3 cursor-pointer ${activeId === m.id ? "bg-accent ring-1 ring-border" : ""}`}
                  onClick={() => setActiveId(m.id)}
                  aria-current={activeId === m.id ? "true" : undefined}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      <Highlight text={m.subject} query={q} />
                    </div>
                    <div className="flex items-center gap-2">
                      {m.category ? <Badge variant="secondary">{m.category}</Badge> : null}
                      {m.starred ? <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> : <Star className="h-4 w-4 text-muted-foreground" />}
                      <span className="text-xs text-muted-foreground">{m.date}</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <Highlight text={`${m.from} · ${m.snippet}`} query={q} />
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </Card>

        {/* 阅读窗格 */}
        <Card className="p-4 space-y-2">
          {!active ? (
            <div className="text-sm text-muted-foreground">无可显示的邮件，请在左侧选择或调整筛选条件。</div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">{active.subject}</div>
                <div className="text-xs text-muted-foreground">{active.date}</div>
              </div>
              <div className="text-sm text-muted-foreground">来自 {active.from}</div>
              <Separator />
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p>{active.snippet}（正文占位：此处将渲染邮件 HTML 内容与附件列表。）</p>
              </div>
            </>
          )}
        </Card>
      </div>
    </motion.div>
  );
}