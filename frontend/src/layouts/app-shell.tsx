import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Outlet, Link } from "react-router-dom";
import { Mail, Menu, Pencil, Search, Sun, Moon } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "../components/ui/dropdown-menu";
import { Toaster } from "sonner";
import MailSidebar from "../shared/components/mail-sidebar";

function useTheme() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const useDark = saved ? saved === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", useDark);
    setIsDark(useDark);
  }, []);
  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };
  return { isDark, toggle };
}

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark, toggle } = useTheme();


  return (
    <div className="min-h-dvh w-full bg-background text-foreground flex flex-col">
      <Toaster richColors position="top-center" closeButton />
      {/* Topbar */}
      <motion.header
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="sticky top-0 z-40 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border flex-shrink-0"
      >
        <div className="mx-auto max-w-[1400px] px-2 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen((s) => !s)} aria-label="Toggle Sidebar">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 grid place-items-center">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold tracking-tight">Mail</span>
          </div>

          <div className="flex-1" />

          <div className="hidden md:flex items-center gap-2">
            <div className="relative max-w-md w-[420px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="搜索邮件、发件人、主题…" className="pl-9" />
            </div>
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle Theme">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button asChild variant="default" className="gap-2">
              <Link to="/mail/compose">
                <Pencil className="h-4 w-4" />
                写邮件
              </Link>
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-1">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              <DropdownMenuLabel>账号</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings/profile">个人资料</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings/security">安全设置</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings/oauth">第三方账号</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/mail/rules">规则构建器</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/mail/rules/list">规则列表</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/auth/login";
              }}>
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.header>

      {/* Layout - 优化后的紧密布局 */}
      <div className="flex-1 flex overflow-hidden">
        <div className="mx-auto max-w-[1400px] w-full flex gap-1 sm:gap-2 p-1 sm:p-2">
          {/* Sidebar - 响应式侧边栏 */}
          <motion.aside
            initial={{ x: -16, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className={[
              "bg-card border border-border rounded-lg flex-shrink-0",
              "w-full sm:w-[240px] md:w-[260px] lg:w-[280px]",
              "p-2 sm:p-3 md:p-4",
              "md:static md:flex md:flex-col",
              sidebarOpen ? "flex flex-col absolute inset-x-1 top-1 z-30 sm:relative sm:inset-auto" : "hidden md:flex"
            ].join(" ")}
          >
            <MailSidebar onNavigate={() => setSidebarOpen(false)} />
          </motion.aside>

          {/* Content - 最大化内容区域 */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* 移动端搜索栏 */}
            <div className="md:hidden mb-1 sm:mb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="搜索邮件…" className="pl-9 h-9" />
              </div>
            </div>

            {/* 主内容区域 */}
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-card border border-border rounded-lg flex-1 overflow-hidden flex flex-col p-3 sm:p-4 md:p-6"
            >
              <Outlet />
            </motion.section>
          </main>
        </div>
      </div>
    </div>
  );
}

