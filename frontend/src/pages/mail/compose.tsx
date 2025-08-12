import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card } from "../../components/ui/card";
import { Send, EyeOff, Eye } from "lucide-react";
import RichTextEditor from "../../components/rich-text-editor";

export default function Compose() {
  const [showPwd, setShowPwd] = useState(false); // 示例交互
  const [html, setHtml] = useState<string>("");

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <div className="mb-3">
        <h2 className="text-lg font-semibold">撰写邮件</h2>
        <p className="text-sm text-muted-foreground">支持草稿自动保存与富文本编辑（占位）。</p>
      </div>
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

        <RichTextEditor value={html} onChange={setHtml} placeholder="撰写邮件内容…" minHeight={280} />

        <div className="flex items-center gap-2">
          <Button className="gap-2"><Send className="h-4 w-4" /> 发送</Button>
          <Button variant="secondary">保存草稿</Button>
          <Button variant="ghost" className="ml-auto gap-2" onClick={() => setShowPwd((s) => !s)}>
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} 示例切换
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}