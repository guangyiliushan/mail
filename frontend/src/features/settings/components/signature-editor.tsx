import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Bold, Italic, Strikethrough, List, ListOrdered, Quote, Code2, Undo2, Redo2, Link2, Minus } from "lucide-react";

type Props = {
  value?: string;
  onChange?: (html: string) => void;
  className?: string;
  placeholder?: string;
};

export default function SignatureEditor({ value = "", onChange, className, placeholder = "在此编辑你的签名…"}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
    ],
    content: value || "<p></p>",
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none dark:prose-invert focus:outline-none min-h-[120px] px-3 py-2",
        "aria-label": "签名编辑器",
        role: "textbox",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    // 外部传入更新时同步（避免首次初始化覆盖）
    const current = editor.getHTML();
    if (value && value !== current) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  if (!editor) return null;

  const askLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("输入链接地址（留空可移除）", prev || "https://");
    if (url === null) return;
    if (!url || url.trim() === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .setLink({ href: url.trim(), target: "_blank", rel: "noopener" })
        .run();
    }
  };

  return (
    <div className={cn("rounded-md border", className)}>
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-1 p-2">
        <Button type="button" size="sm" variant={editor.isActive("bold") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleBold().run()} aria-label="加粗">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant={editor.isActive("italic") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleItalic().run()} aria-label="斜体">
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant={editor.isActive("strike") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleStrike().run()} aria-label="删除线">
          <Strikethrough className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Button type="button" size="sm" variant={editor.isActive("bulletList") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleBulletList().run()} aria-label="无序列表">
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant={editor.isActive("orderedList") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleOrderedList().run()} aria-label="有序列表">
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant={editor.isActive("blockquote") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleBlockquote().run()} aria-label="引用">
          <Quote className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant={editor.isActive("codeBlock") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleCodeBlock().run()} aria-label="代码块">
          <Code2 className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => editor.chain().focus().setHorizontalRule().run()} aria-label="分隔线">
          <Minus className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Button type="button" size="sm" variant={editor.isActive("link") ? "default" : "ghost"} onClick={askLink} aria-label="链接">
          <Link2 className="h-4 w-4" />
        </Button>

        <div className="ml-auto flex items-center gap-1">
          <Button type="button" size="sm" variant="ghost" onClick={() => editor.chain().focus().undo().run()} aria-label="撤销">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => editor.chain().focus().redo().run()} aria-label="重做">
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* 编辑区域 */}
      <div className="relative">
        {!value && (
          <div className="pointer-events-none absolute left-3 top-2 text-xs text-muted-foreground">
            {placeholder}
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}