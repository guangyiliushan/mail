import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "../../components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "../../components/ui/popover";
import { toast } from "sonner";
import { Tag as TagIcon, Plus, Pencil, Trash2, Palette, Save, X, GripVertical } from "lucide-react";
import { createTag, deleteTag, listTags, Tag, updateTag, reorderTags } from "../../stores/tag-store";

const PALETTE = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16",
  "#10b981", "#14b8a6", "#06b6d4", /* avoid deep blue/indigo */ "#a78bfa",
  "#8b5cf6", "#d946ef", "#ec4899", "#f43f5e"
];

export default function SettingsTags() {
  const [tags, setTags] = useState<Tag[]>(() => listTags());
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addColor, setAddColor] = useState(PALETTE[4]); // default green
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [colorOpenFor, setColorOpenFor] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // DnD state
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const refresh = () => setTags(listTags());

  const canSaveAdd = addName.trim().length > 0;

  const title = useMemo(() => "标签管理", []);

  const onCreate = () => {
    if (!canSaveAdd) return;
    const t = createTag(addName.trim(), addColor);
    setAddOpen(false);
    setAddName("");
    setAddColor(PALETTE[4]);
    refresh();
    toast.success(`已创建标签「${t.name}」`);
  };

  const startEdit = (t: Tag) => {
    setEditingId(t.id);
    setEditingName(t.name);
  };

  const saveEdit = (id: string) => {
    if (!editingName.trim()) return;
    updateTag(id, { name: editingName.trim() });
    setEditingId(null);
    setEditingName("");
    refresh();
    toast.success("已重命名");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const changeColor = (id: string, color: string) => {
    updateTag(id, { color });
    setColorOpenFor(null);
    refresh();
    toast.success("已更新颜色");
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteTag(deleteId);
    setDeleteId(null);
    refresh();
    toast.success("标签已删除");
  };

  // Drag & Drop helpers
  function reorderArray(arr: Tag[], fromId: string, toId: string) {
    const fromIdx = arr.findIndex((t) => t.id === fromId);
    const toIdx = arr.findIndex((t) => t.id === toId);
    if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return arr;
    const next = arr.slice();
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    return next;
  }

  function onDragStart(e: React.DragEvent<HTMLLIElement>, id: string) {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("text/plain", id);
    } catch {}
  }

  function onDragOver(e: React.DragEvent<HTMLLIElement>, overId: string) {
    e.preventDefault();
    if (dragOverId !== overId) setDragOverId(overId);
    e.dataTransfer.dropEffect = "move";
  }

  function onDrop(e: React.DragEvent<HTMLLIElement>, toId: string) {
    e.preventDefault();
    const fromId = dragId || e.dataTransfer.getData("text/plain");
    if (!fromId || fromId === toId) {
      setDragId(null);
      setDragOverId(null);
      return;
    }
    const next = reorderArray(tags, fromId, toId);
    setTags(next);
    reorderTags(next);
    setDragId(null);
    setDragOverId(null);
    toast.success("已保存标签排序");
  }

  function onDragEnd() {
    setDragId(null);
    setDragOverId(null);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary/10 grid place-items-center">
            <TagIcon className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              新增标签
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新增标签</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="tagName">名称</Label>
                <Input id="tagName" placeholder="例如：待处理、个人、项目A…" value={addName} onChange={(e) => setAddName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>颜色</Label>
                <ColorGrid value={addColor} onChange={setAddColor} />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="secondary" onClick={() => setAddOpen(false)}>取消</Button>
              <Button onClick={onCreate} disabled={!canSaveAdd}>
                <Save className="h-4 w-4 mr-1" />
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-3">
        <div className="text-sm text-muted-foreground px-1 pb-2">
          共 {tags.length} 个标签（支持拖拽排序）
        </div>
        <Separator className="mb-2" />
        <ul className="divide-y">
          {tags.map((t) => {
            const isDragging = dragId === t.id;
            const isOver = dragOverId === t.id && dragId !== t.id;
            return (
              <motion.li
                key={t.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={[
                  "py-2 px-1 bg-transparent",
                  isOver ? "ring-1 ring-primary/50 rounded-md" : "",
                  isDragging ? "opacity-60" : ""
                ].join(" ")}
                draggable
                onDragStart={(e) => onDragStart(e as any, t.id)}
                onDragOver={(e) => onDragOver(e as any, t.id)}
                onDrop={(e) => onDrop(e as any, t.id)}
                onDragEnd={onDragEnd}
                aria-grabbed={isDragging ? "true" : "false"}
                aria-dropeffect="move"
              >
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" aria-hidden />
                    <div className="h-4 w-4 rounded-sm border border-border" style={{ backgroundColor: t.color }} aria-hidden />
                    {editingId === t.id ? (
                      <div className="flex items-center gap-2">
                        <Input className="h-8 w-[200px]" value={editingName} onChange={(e) => setEditingName(e.target.value)} />
                        <Button size="sm" onClick={() => saveEdit(t.id)} aria-label="保存名称"><Save className="h-4 w-4" /></Button>
                        <Button size="sm" variant="secondary" onClick={cancelEdit} aria-label="取消"><X className="h-4 w-4" /></Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="truncate font-medium">{t.name}</div>
                        {t.system ? <Badge variant="secondary">内置</Badge> : null}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Popover open={colorOpenFor === t.id} onOpenChange={(o) => setColorOpenFor(o ? t.id : null)}>
                      <PopoverTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-2" aria-label="选择颜色">
                          <Palette className="h-4 w-4" />
                          颜色
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-64">
                        <ColorGrid value={t.color} onChange={(c) => changeColor(t.id, c)} />
                      </PopoverContent>
                    </Popover>

                    {editingId === t.id ? null : (
                      <Button size="sm" variant="secondary" onClick={() => startEdit(t)} aria-label="重命名">
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">重命名</span>
                      </Button>
                    )}

                    <AlertDialog open={deleteId === t.id} onOpenChange={(o) => setDeleteId(o ? t.id : null)}>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" aria-label="删除">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>删除标签</AlertDialogTitle>
                          <AlertDialogDescription>
                            确认删除标签“{t.name}”吗？该操作不可撤销。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </Card>
    </motion.div>
  );
}

function ColorGrid({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {PALETTE.map((c) => {
        const active = c.toLowerCase() === value.toLowerCase();
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={[
              "h-7 w-7 rounded-md border",
              active ? "ring-2 ring-offset-2 ring-primary" : "hover:opacity-90"
            ].join(" ")}
            style={{ backgroundColor: c, borderColor: "hsl(var(--border))" }}
            aria-label={`选择颜色 ${c}`}
            aria-pressed={active}
          />
        );
      })}
    </div>
  );
}