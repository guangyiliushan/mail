import React, { useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { UploadCloud, File as FileIcon, X, Eye } from "lucide-react";

export type Attachment = {
  id: string;
  file: File;
  url?: string;
  kind: "image" | "file";
  name: string;
  size: number;
  mime: string;
};

function fmtSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  const kb = bytes / 1024;
  if (kb < 1024) return kb.toFixed(1) + " KB";
  const mb = kb / 1024;
  if (mb < 1024) return mb.toFixed(1) + " MB";
  const gb = mb / 1024;
  return gb.toFixed(1) + " GB";
}

function createAttachment(file: File): Attachment {
  const isImg = /^image\//.test(file.type);
  return {
    id: "att_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    file,
    url: isImg ? URL.createObjectURL(file) : undefined,
    kind: isImg ? "image" : "file",
    name: file.name,
    size: file.size,
    mime: file.type || "application/octet-stream",
  };
}

type AttachmentZoneProps = {
  files: Attachment[];
  onChange: (next: Attachment[]) => void;
  disabled?: boolean;
  maxCount?: number;
  className?: string;
};

export default function AttachmentZone({
  files,
  onChange,
  disabled,
  maxCount = 20,
  className,
}: AttachmentZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const countHint = useMemo(() => `已选择 ${files.length}/${maxCount} 个文件`, [files.length, maxCount]);

  function addFiles(list: FileList | File[]) {
    if (disabled) return;
    const arr = Array.from(list);
    if (!arr.length) return;
    const left = Math.max(0, maxCount - files.length);
    const pick = arr.slice(0, left);
    const atts = pick.map(createAttachment);
    if (atts.length === 0) {
      toast.warning("已达到最大附件数量");
      return;
    }
    onChange([...files, ...atts]);
    toast.success(`添加 ${atts.length} 个附件`);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer?.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(e.target.files);
    // reset value to allow re-pick the same file
    e.target.value = "";
  }

  function removeOne(id: string) {
    const att = files.find((f) => f.id === id);
    if (att?.url) URL.revokeObjectURL(att.url);
    const next = files.filter((f) => f.id !== id);
    onChange(next);
  }

  function preview(att: Attachment) {
    if (att.kind === "image" && att.url) {
      window.open(att.url, "_blank", "noopener,noreferrer");
    } else {
      toast.info("仅图片支持浏览器内预览");
    }
  }

  return (
    <Card className={["p-3", className || ""].join(" ")}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={[
          "rounded-md border border-dashed p-4 text-sm",
          dragOver ? "border-primary bg-primary/5" : "border-border",
          disabled ? "opacity-60 pointer-events-none" : "hover:bg-accent/40",
        ].join(" ")}
        aria-label="附件拖拽区域"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <UploadCloud className="h-5 w-5 text-muted-foreground" />
            <div className="space-y-0.5">
              <div className="font-medium">拖拽文件到此处，或点击选择</div>
              <div className="text-xs text-muted-foreground">{countHint}</div>
            </div>
          </div>
          <div>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={onPick}
              aria-hidden
              disabled={disabled}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || files.length >= maxCount}
            >
              选择文件
            </Button>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <>
          <Separator className="my-3" />
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.map((att) => (
              <motion.li
                key={att.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-md border border-border p-3 bg-card"
              >
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-md border border-border overflow-hidden bg-accent grid place-items-center shrink-0">
                    {att.kind === "image" && att.url ? (
                      <img
                        src={att.url}
                        alt={att.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FileIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate" title={att.name}>{att.name}</div>
                    <div className="text-xs text-muted-foreground">{att.mime} · {fmtSize(att.size)}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <Button variant="secondary" size="sm" className="h-7 px-2 gap-1" onClick={() => preview(att)}>
                        <Eye className="h-3.5 w-3.5" />
                        预览
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive hover:text-destructive" onClick={() => removeOne(att.id)}>
                        <X className="h-3.5 w-3.5" />
                        移除
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}