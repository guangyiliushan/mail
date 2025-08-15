import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Separator } from "../../../components/ui/separator";
import { Switch } from "../../../components/ui/switch";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Loader2, Image as ImageIcon, User, Save, RotateCcw } from "lucide-react";
import SignatureEditor from "../components/signature-editor";

const KEY = "profile_settings_v1";
const SIG_KEY = "profile_signature_v1";

type ProfileData = {
  name: string;
  bio: string;
  avatar?: string; // dataURL
  marketing: boolean;
};

export default function SettingsProfile() {
  const [data, setData] = useState<ProfileData>({ name: "", bio: "", avatar: undefined, marketing: false });
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState<string | null>(null);

  const [signature, setSignature] = useState<string>("");
  const [sigSaving, setSigSaving] = useState(false);
  const [sigOk, setSigOk] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setData(JSON.parse(raw) as ProfileData);
    } catch (e) {
      console.error("Error loading profile data:", e);
    }
    try {
      const rawSig = localStorage.getItem(SIG_KEY);
      if (rawSig) setSignature(String(rawSig));
    } catch (e) {
      console.error("Error loading signature data:", e);
    }
  }, []);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setData((d) => ({ ...d, avatar: String(reader.result || "") }));
    reader.readAsDataURL(file);
  }

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setOk(null);
    try {
      await new Promise((r) => setTimeout(r, 500));
      localStorage.setItem(KEY, JSON.stringify(data));
      setOk("资料已保存");
    } finally {
      setSaving(false);
    }
  }

  async function onSaveSignature() {
    setSigSaving(true);
    setSigOk(null);
    try {
      await new Promise((r) => setTimeout(r, 400));
      localStorage.setItem(SIG_KEY, signature || "");
      setSigOk("签名已保存");
    } finally {
      setSigSaving(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl space-y-4">
      <div className="mb-2">
        <h1 className="text-lg font-semibold">个人资料与签名</h1>
        <p className="text-sm text-muted-foreground">更新头像、昵称、简介与邮件签名。</p>
      </div>

      {/* 资料 */}
      <Card className="p-4 md:p-6 space-y-4">
        {ok ? (
          <Alert role="status" aria-live="polite">
            <AlertDescription>{ok}</AlertDescription>
          </Alert>
        ) : null}

        <form className="space-y-4" onSubmit={onSaveProfile} noValidate>
          {/* 头像 */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                {data.avatar ? (
                  <img src={data.avatar} alt="用户头像预览" className="h-full w-full object-cover" />
                ) : (
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar">头像</Label>
              <div className="flex items-center gap-2">
                <Input id="avatar" type="file" accept="image/*" onChange={onFileChange} className="max-w-xs" />
                <Button type="button" variant="secondary" onClick={() => setData((d) => ({ ...d, avatar: undefined }))}>
                  移除
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">支持常见图片格式，预览仅保存在本地。</p>
            </div>
          </div>

          <Separator />

          {/* 基本信息 */}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">昵称</Label>
              <Input
                id="name"
                placeholder="你的称呼"
                value={data.name}
                onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">个人简介</Label>
              <Textarea
                id="bio"
                placeholder="一句话介绍你自己…"
                value={data.bio}
                onChange={(e) => setData((d) => ({ ...d, bio: e.target.value }))}
                rows={4}
              />
            </div>
          </div>

          {/* 偏好设置 */}
          <div className="space-y-2">
            <Label>偏好</Label>
            <div className="flex items-center gap-3">
              <Switch
                id="marketing"
                checked={data.marketing}
                onCheckedChange={(v) => setData((d) => ({ ...d, marketing: !!v }))}
              />
              <label htmlFor="marketing" className="text-sm text-muted-foreground cursor-pointer">
                接收产品更新与活动通知邮件
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
              保存更改
            </Button>
            <Button type="button" variant="ghost" onClick={() => window.history.back()}>
              取消
            </Button>
          </div>
        </form>
      </Card>

      {/* 签名 */}
      <Card className="p-4 md:p-6 space-y-4">
        <div>
          <h2 className="text-base font-medium">邮件签名</h2>
          <p className="text-xs text-muted-foreground">支持加粗、列表、引用、链接等基础样式。签名将在撰写邮件时自动插入（后续可对接后端偏好接口）。</p>
        </div>

        {sigOk ? (
          <Alert role="status" aria-live="polite">
            <AlertDescription>{sigOk}</AlertDescription>
          </Alert>
        ) : null}

        <SignatureEditor value={signature} onChange={setSignature} />

        <div className="flex items-center gap-2">
          <Button type="button" onClick={onSaveSignature} disabled={sigSaving} className="gap-2">
            {sigSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            保存签名
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setSignature("")}
            className="gap-2"
            title="清空编辑器内容"
          >
            <RotateCcw className="h-4 w-4" />
            重置
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}