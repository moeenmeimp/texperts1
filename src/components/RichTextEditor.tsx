import { useEffect, useRef } from "react";
import { Bold, Heading2, Italic, Link2, List, Underline } from "lucide-react";

const TOOLS = [
  { cmd: "bold", label: "Bold", icon: Bold },
  { cmd: "italic", label: "Italic", icon: Italic },
  { cmd: "underline", label: "Underline", icon: Underline },
  { cmd: "insertUnorderedList", label: "Bullet list", icon: List },
] as const;

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value;
  }, [value]);

  function run(command: string, argument?: string) {
    ref.current?.focus();
    document.execCommand(command, false, argument);
    onChange(ref.current?.innerHTML ?? "");
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 p-1.5">
        {TOOLS.map((tool) => (
          <button
            key={tool.cmd}
            type="button"
            title={tool.label}
            aria-label={tool.label}
            onClick={() => run(tool.cmd)}
            className="rounded-lg p-2 hover:bg-accent"
          >
            <tool.icon className="h-4 w-4" />
          </button>
        ))}
        <button
          type="button"
          title="Heading"
          aria-label="Heading"
          onClick={() => run("formatBlock", "<h2>")}
          className="rounded-lg p-2 hover:bg-accent"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Insert link"
          aria-label="Insert link"
          onClick={() => {
            const url = window.prompt("Link address (https://…)");
            if (url) run("createLink", url);
          }}
          className="rounded-lg p-2 hover:bg-accent"
        >
          <Link2 className="h-4 w-4" />
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Page content"
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        className="prose-page min-h-48 bg-card p-3 text-sm outline-none"
      />
    </div>
  );
}
