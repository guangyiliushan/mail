import React from "react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, Wand2 } from "lucide-react";
import type { MockMail } from "../../types/index";

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200/60 dark:bg-yellow-600/40 rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export type MailListProps = {
  mails: MockMail[];
  q: string;
  selected: Set<string>;
  activeId: string;
  onToggleRow: (id: string, checked: boolean) => void;
  onItemClick: (id: string) => void;
  matchedIds?: Set<string>;
};

export function MailList(props: MailListProps) {
  const { mails, q, selected, onToggleRow, onItemClick, activeId, matchedIds } = props;
  const matched = matchedIds ?? new Set<string>();
  
  return (
    <ul className="divide-y">
      {mails.map((m) => {
        const unread = !m.read;
        return (
          <motion.li
            key={m.id}
            whileHover={{ backgroundColor: "hsl(var(--accent))" }}
            className={`p-3 cursor-pointer ${activeId === m.id ? "bg-accent ring-1 ring-border" : ""}`}
            onClick={() => onItemClick(m.id)}
            aria-current={activeId === m.id ? "true" : undefined}
          >
            <div className="flex items-start gap-3">
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selected.has(m.id)}
                  onCheckedChange={(v) => onToggleRow(m.id, Boolean(v))}
                  aria-label={`选择邮件 ${m.subject}`}
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className={`font-medium ${unread ? "font-semibold" : ""}`}>
                    {unread && <span className="inline-block h-2 w-2 rounded-full bg-primary mr-2 align-middle" aria-hidden />}
                    <Highlight text={m.subject} query={q} />
                  </div>
                  <div className="flex items-center gap-2">
                    {matched.has(m.id) ? (
                      <Wand2 className="h-3.5 w-3.5 text-violet-500" aria-label="命中规则" />
                    ) : null}
                    {m.category ? <Badge variant="secondary">{m.category}</Badge> : null}
                    <span className="text-xs text-muted-foreground">{m.date}</span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <Highlight text={`${m.from} · ${m.snippet}`} query={q} />
                </div>
              </div>

              <div className="pt-1">
                {m.starred ? (
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                ) : (
                  <Star className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}