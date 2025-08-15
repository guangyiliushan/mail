import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Separator } from "../../../components/ui/separator";
import { Badge } from "../../../components/ui/badge";
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
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Loader2, Github, Mail, Square } from "lucide-react";

type Provider = "google" | "github" | "microsoft";
type State = Record<Provider, boolean>;

const KEY = "oauth_links_v1";

const PROVIDERS: { key: Provider; label: string; icon: any }[] = [
  { key: "google", label: "Google", icon: Mail },
  { key: "github", label: "GitHub", icon: Github },
  { key: "microsoft", label: "Microsoft", icon: Square },
];

export default function SettingsOAuth() {
  const [state, setState] = useState<State>({ google: false, github: false, microsoft: false });
  const [loading, setLoading] = useState<Provider | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw) as State);
    } catch (error) {
      console.error("Failed to load OAuth state:", error);
    }
  }, []);

  function persist(next: State) {
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  async function connect(p: Provider) {
    setOk(null);
    setLoading(p);
    try {
      // Mock OAuth 弹窗流程
      await new Promise((r) => setTimeout(r, 800));
      const next = { ...state, [p]: true };
      setState(next);
      persist(next);
      setOk(`已绑定 ${p}`);
    } finally {
      setLoading(null);
    }
  }

  async function disconnect(p: Provider) {
    setOk(null);
    setLoading(p);
    try {
      await new Promise((r) => setTimeout(r, 500));
      const next = { ...state, [p]: false };
      setState(next);
      persist(next);
      setOk(`已解除绑定 ${p}`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl">
      <div className="mb-3">
        <h1 className="text-lg font-semibold">第三方绑定</h1>
        <p className="text-sm text-muted-foreground">绑定常用平台账号以快速登录与同步基础信息。</p>
      </div>

      <Card className="p-4 md:p-6 space-y-4">
        {ok ? (
          <Alert role="status" aria-live="polite">
            <AlertDescription>{ok}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-3">
          {PROVIDERS.map(({ key, label, icon: Icon }) => {
            const connected = state[key];
            return (
              <div key={key} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-primary/10 grid place-items-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{label}</div>
                    <div className="text-xs text-muted-foreground">
                      {connected ? "已绑定，可用于快速登录" : "未绑定，绑定后可快捷登录"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={connected ? "secondary" : "outline"}>{connected ? "已绑定" : "未绑定"}</Badge>
                  {connected ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={loading === key}>
                          解绑
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认解除绑定？</AlertDialogTitle>
                          <AlertDialogDescription>
                            解绑后将无法使用 {label} 快速登录。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={() => disconnect(key)}>
                            {loading === key ? <Loader2 className="h-4 w-4 animate-spin" /> : "确认"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button variant="default" size="sm" onClick={() => connect(key)} disabled={loading === key} className="gap-2">
                      {loading === key ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      绑定
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        <div className="text-xs text-muted-foreground">
          我们仅在获得你授权后访问基础公开信息；你可以随时在此解除绑定。
        </div>
      </Card>
    </motion.div>
  );
}