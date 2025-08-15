import { useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  Link as LinkIcon,
} from "lucide-react";

type Props = {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
};

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "开始输入内容…",
  minHeight = 220,
  className = "",
}: Props) {
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { HTMLAttributes: { class: "rounded-md p-3 bg-muted" } },
        blockquote: { HTMLAttributes: { class: "border-l-2 pl-3" } },
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
        protocols: ["http", "https", "mailto"],
      }),
      Placeholder.configure({
        placeholder,
        includeChildren: true,
      }),
    ],
    [placeholder]
  );

  const editor = useEditor({
    extensions,
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none",
      },
    },
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  });

  function setLink() {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("输入链接地址（含 http/https/mailto）：", prev || "");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url.trim(), target: "_blank" })
        .run();
    }
  }

  return (
    <div className={["rounded-md border border-border bg-card", className].join(" ")}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2">
        <RteButton
          label="粗体"
          isActive={!!editor?.isActive("bold")}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </RteButton>
        <RteButton
          label="斜体"
          isActive={!!editor?.isActive("italic")}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </RteButton>
        <RteButton
          label="删除线"
          isActive={!!editor?.isActive("strike")}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </RteButton>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <RteButton
          label="标题"
          isActive={!!editor?.isActive("heading", { level: 1 })}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 className="h-4 w-4" />
        </RteButton>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <RteButton
          label="无序列表"
          isActive={!!editor?.isActive("bulletList")}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </RteButton>
        <RteButton
          label="有序列表"
          isActive={!!editor?.isActive("orderedList")}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </RteButton>
        <RteButton
          label="引用"
          isActive={!!editor?.isActive("blockquote")}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </RteButton>
        <RteButton
          label="行内代码"
          isActive={!!editor?.isActive("code")}
          onClick={() => editor?.chain().focus().toggleCode().run()}
        >
          <Code className="h-4 w-4" />
        </RteButton>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8"
          onClick={setLink}
          title="插入/编辑链接"
          type="button"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
            title="撤销"
            type="button"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
            title="重做"
            type="button"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div
        className="rounded-b-md border-t border-border bg-background p-3"
        style={{ minHeight }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function RteButton({
  isActive,
  onClick,
  label,
  children,
}: {
  isActive?: boolean;
  onClick?: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant={isActive ? "default" : "secondary"}
      size="icon"
      className="h-8 w-8"
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </Button>
  );
}