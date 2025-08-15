import React, { useState, useRef,type KeyboardEvent, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { X, Check, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";

// 模拟联系人数据
const MOCK_CONTACTS = [
  { email: "alice@example.com", name: "Alice Chen" },
  { email: "bob@company.org", name: "Bob Wang" },
  { email: "carol@mail.net", name: "Carol Liu" },
  { email: "david@tech.co", name: "David Zhang" },
  { email: "emma@design.io", name: "Emma Lin" },
  { email: "frank@corp.com", name: "Frank Wu" },
  { email: "grace@studio.dev", name: "Grace Huang" },
];

// 邮箱验证正则
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export type Recipient = {
  email: string;
  name?: string;
  valid: boolean;
};

interface RecipientInputProps {
  id: string;
  label: string;
  placeholder?: string;
  recipients: Recipient[];
  onChange: (recipients: Recipient[]) => void;
  disabled?: boolean;
  className?: string;
}

export function RecipientInput({
  id,
  label,
  placeholder = "输入邮箱地址...",
  recipients,
  onChange,
  disabled = false,
  className,
}: RecipientInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<typeof MOCK_CONTACTS>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 当输入值变化时更新建议列表
  useEffect(() => {
    if (!inputValue.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const query = inputValue.toLowerCase();
    const filtered = MOCK_CONTACTS.filter(
      (contact) =>
        contact.email.toLowerCase().includes(query) ||
        contact.name.toLowerCase().includes(query)
    ).filter(
      // 排除已添加的邮箱
      (contact) => !recipients.some((r) => r.email === contact.email)
    );

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setSelectedIndex(-1);
  }, [inputValue, recipients]);

  // 添加收件人
  const addRecipient = (email: string, name?: string) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    // 检查是否已存在
    if (recipients.some((r) => r.email === trimmedEmail)) return;

    // 验证邮箱格式
    const isValid = EMAIL_REGEX.test(trimmedEmail);

    onChange([
      ...recipients,
      { email: trimmedEmail, name, valid: isValid },
    ]);
    setInputValue("");
    setShowSuggestions(false);
  };

  // 从建议中选择
  const selectSuggestion = (contact: typeof MOCK_CONTACTS[0]) => {
    addRecipient(contact.email, contact.name);
    inputRef.current?.focus();
  };

  // 移除收件人
  const removeRecipient = (index: number) => {
    const newRecipients = [...recipients];
    newRecipients.splice(index, 1);
    onChange(newRecipients);
  };

  // 处理键盘事件
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Tab 或 Enter 添加当前输入
    if ((e.key === "Tab" || e.key === "Enter") && inputValue) {
      e.preventDefault();
      
      // 如果有选中的建议，使用建议
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        selectSuggestion(suggestions[selectedIndex]);
      } else {
        // 否则使用当前输入
        addRecipient(inputValue);
      }
    }
    // 逗号分隔添加
    else if (e.key === ",") {
      e.preventDefault();
      if (inputValue) {
        addRecipient(inputValue);
      }
    }
    // 上下键选择建议
    else if (e.key === "ArrowDown" && showSuggestions) {
      e.preventDefault();
      setSelectedIndex((prev) => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    }
    else if (e.key === "ArrowUp" && showSuggestions) {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    }
    // Backspace 删除最后一个收件人
    else if (e.key === "Backspace" && !inputValue && recipients.length > 0) {
      removeRecipient(recipients.length - 1);
    }
    // Escape 关闭建议
    else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // 点击外部关闭建议
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 处理粘贴事件，支持多个邮箱
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    
    // 分割邮箱（支持逗号、分号、空格、换行符分隔）
    const emails = pastedText
      .split(/[,;\s\n]+/)
      .map(email => email.trim())
      .filter(email => email);
    
    emails.forEach(email => {
      addRecipient(email);
    });
  };

  return (
    <div className={cn("space-y-2", className)} ref={containerRef}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
      
      <div className={cn(
        "flex flex-wrap gap-1 p-1 border rounded-md bg-background",
        "min-h-10 focus-within:outline-none focus-within:ring-2 focus-within:ring-ring",
        disabled && "opacity-50 pointer-events-none"
      )}>
        {/* 已添加的收件人 Chips */}
        <AnimatePresence>
          {recipients.map((recipient, index) => (
            <motion.div
              key={recipient.email}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 h-7 text-xs",
                recipient.valid 
                  ? "bg-primary/10 text-primary" 
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {recipient.valid ? (
                <Check className="h-3 w-3" />
              ) : (
                <AlertCircle className="h-3 w-3" />
              )}
              <span>
                {recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email}
              </span>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded hover:bg-muted/60 transition w-4 h-4"
                onClick={() => removeRecipient(index)}
                aria-label={`移除收件人 ${recipient.email}`}
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 输入框 */}
        <Input
          ref={inputRef}
          id={id}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={recipients.length ? "" : placeholder}
          disabled={disabled}
          className="flex-1 min-w-[120px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-7 px-2 py-0"
        />
      </div>

      {/* 错误提示 */}
      {recipients.some(r => !r.valid) && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          部分邮箱格式无效，请检查
        </p>
      )}

      {/* 联系人建议下拉菜单 */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-10 mt-1 left-0 right-0 bg-popover rounded-md shadow-md border"
          >
            <ul className="py-1 max-h-60 overflow-auto">
              {suggestions.map((contact, index) => (
                <li
                  key={contact.email}
                  onClick={() => selectSuggestion(contact)}
                  className={cn(
                    "px-3 py-2 text-sm cursor-pointer flex items-center justify-between",
                    "hover:bg-accent hover:text-accent-foreground",
                    selectedIndex === index && "bg-accent text-accent-foreground"
                  )}
                >
                  <div>
                    <div className="font-medium">{contact.name}</div>
                    <div className="text-xs text-muted-foreground">{contact.email}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">Tab 选择</div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* 辅助提示 */}
      <p className="text-xs text-muted-foreground">
        使用 Tab、Enter 或逗号添加多个邮箱，支持粘贴多个地址
      </p>
    </div>
  );
}

export default RecipientInput;