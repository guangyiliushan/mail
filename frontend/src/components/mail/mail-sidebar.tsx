import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Inbox, Star, Send, Trash2, Settings, Folder, Wand2, List, Plus, MoreVertical, Pencil, Trash } from "lucide-react";
import { Separator } from "../ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { toast } from "sonner";

type CustomFolder = { key: string; label: string };

function SidebarItem({
  icon: Icon,
  label,
  active,
}: {
  icon: any;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={[
        "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm",
        active ? "bg-primary/10 text-primary" : "hover:bg-accent",
      ].join(" ")}
      aria-current={active ? "page" : undefined}
      type="button"
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

const LS_KEY = "mail.customFolders";
const DEFAULT_FOLDERS: CustomFolder[] = [
  { key: "work", label: "工作" },
  { key: "personal", label: "个人" },
  { key: "receipts", label: "账单" },
];

function loadFolders(): CustomFolder[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_FOLDERS;
    const parsed = JSON.parse(raw) as CustomFolder[];
    if (!Array.isArray(parsed)) return DEFAULT_FOLDERS;
    return parsed.filter((f) => f && typeof f.key === "string" && typeof f.label === "string");
  } catch {
    return DEFAULT_FOLDERS;
  }
}

function saveFolders(folders: CustomFolder[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(folders));
}

function slugify(input: string) {
  return (input.normalize ? input.normalize("NFKD") : input)
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[']/g, "")
    .replace(/[\s._]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function MailSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const pathname = location.pathname;
  const sp = new URLSearchParams(location.search);
  const folder = sp.get("folder") || "";
  const name = sp.get("name") || "";

  // 主文件夹高亮
  const isInbox = pathname === "/mail/inbox" && !folder;
  const isStarred = pathname === "/mail/inbox" && folder === "starred";
  const isSent = pathname === "/mail/inbox" && folder === "sent";
  const isDrafts = pathname === "/mail/inbox" && folder === "drafts";
  const isTrash = pathname === "/mail/inbox" && folder === "trash";

  // 其他页面高亮
  const isRules = pathname === "/mail/rules";
  const isRulesList = pathname === "/mail/rules/list";
  const isSettings = pathname.startsWith("/settings");

  // 自定义分组
  const [folders, setFolders] = useState<CustomFolder[]>(() => loadFolders());
  useEffect(() => saveFolders(folders), [folders]);

  const customItems = useMemo(
    () =>
      folders.map((f) => ({
        ...f,
        active: pathname === "/mail/inbox" && folder === "custom" && name === f.key,
      })),
    [folders, pathname, folder, name]
  );

  const handleNav = () => {
    onNavigate?.();
  };

  // 新建
  const [addOpen, setAddOpen] = useState(false);
  const [addLabel, setAddLabel] = useState("");
  const handleAdd = () => {
    const label = addLabel.trim();
    if (!label) {
      toast.error("请输入文件夹名称");
      return;
    }
    const base = slugify(label) || "folder";
    let key = base;
    let i = 1;
    const exists = new Set(folders.map((f) => f.key));
    while (exists.has(key)) {
      key = `${base}-${i++}`;
    }
    setFolders((prev) => [...prev, { key, label }]);
    setAddLabel("");
    setAddOpen(false);
    toast.success("已创建自定义文件夹");
  };

  // 重命名
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameLabel, setRenameLabel] = useState("");
  const [renameTarget, setRenameTarget] = useState<CustomFolder | null>(null);
  const openRename = (item: CustomFolder) => {
    setRenameTarget(item);
    setRenameLabel(item.label);
    setRenameOpen(true);
  };
  const handleRename = () => {
    if (!renameTarget) return;
    const label = renameLabel.trim();
    if (!label) {
      toast.error("名称不可为空");
      return;
    }
    setFolders((prev) =>
      prev.map((f) => (f.key === renameTarget.key ? { ...f, label } : f))
    );
    setRenameOpen(false);
    toast.success("已重命名");
  };

  // 删除
  const [delOpen, setDelOpen] = useState(false);
  const [delTarget, setDelTarget] = useState<CustomFolder | null>(null);
  const openDelete = (item: CustomFolder) => {
    setDelTarget(item);
    setDelOpen(true);
  };
  const handleDelete = () => {
    if (!delTarget) return;
    setFolders((prev) => prev.filter((f) => f.key !== delTarget.key));
    setDelOpen(false);
    toast.success("已删除");
  };

  return (
    <>
      <nav aria-label="文件夹" className="space-y-1">
        <Link to="/mail/inbox" className="block" onClick={handleNav}>
          <SidebarItem icon={Inbox} label="收件箱" active={isInbox} />
        </Link>
        <Link to="/mail/inbox?folder=starred" className="block" onClick={handleNav}>
          <SidebarItem icon={Star} label="星标邮件" active={isStarred} />
        </Link>
        <Link to="/mail/inbox?folder=sent" className="block" onClick={handleNav}>
          <SidebarItem icon={Send} label="已发送" active={isSent} />
        </Link>
        <Link to="/mail/inbox?folder=drafts" className="block" onClick={handleNav}>
          <SidebarItem icon={Folder} label="草稿箱" active={isDrafts} />
        </Link>
        <Link to="/mail/inbox?folder=trash" className="block" onClick={handleNav}>
          <SidebarItem icon={Trash2} label="垃圾箱" active={isTrash} />
        </Link>

        <Accordion type="single" collapsible defaultValue="custom" className="mt-1">
          <AccordionItem value="custom" className="border-none">
            <AccordionTrigger className="px-3 py-2 text-sm h-auto hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <span>自定义</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 gap-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setAddOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  新建
                </Button>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-1">
              {customItems.length === 0 ? (
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  暂无自定义文件夹，点击“新建”添加。
                </div>
              ) : null}
              {customItems.map((c) => (
                <div key={c.key} className="flex items-center justify-between">
                  <Link
                    to={`/mail/inbox?folder=custom&name=${c.key}`}
                    className="block flex-1"
                    onClick={handleNav}
                  >
                    <SidebarItem icon={Folder} label={c.label} active={c.active} />
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-40">
                      <DropdownMenuItem onClick={() => openRename({ key: c.key, label: c.label })}>
                        <Pencil className="h-4 w-4 mr-2" />
                        重命名
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => openDelete({ key: c.key, label: c.label })}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Separator className="my-3" />
        <Link to="/mail/rules" className="block" onClick={handleNav}>
          <SidebarItem icon={Wand2} label="规则构建器" active={isRules} />
        </Link>
        <Link to="/mail/rules/list" className="block" onClick={handleNav}>
          <SidebarItem icon={List} label="规则列表" active={isRulesList} />
        </Link>
        <Link to="/settings/profile" className="block" onClick={handleNav}>
          <SidebarItem icon={Settings} label="设置" active={isSettings} />
        </Link>
      </nav>

      {/* 新建对话框 */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建自定义文件夹</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              placeholder="文件夹名称（如：项目、家庭…）"
              value={addLabel}
              onChange={(e) => setAddLabel(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              名称可随时重命名；系统将自动生成路由标识。
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">取消</Button>
            </DialogClose>
            <Button onClick={handleAdd}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 重命名对话框 */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重命名文件夹</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              placeholder="新的名称"
              value={renameLabel}
              onChange={(e) => setRenameLabel(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">取消</Button>
            </DialogClose>
            <Button onClick={handleRename}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <AlertDialog open={delOpen} onOpenChange={setDelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除该文件夹？</AlertDialogTitle>
            <AlertDialogDescription>
              删除仅移除自定义分组，不影响已有邮件数据（占位说明）。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDelete}>
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}