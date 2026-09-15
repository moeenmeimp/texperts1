import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Download, Paperclip, Send } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  getOrCreateConversation,
  timeAgo,
  useConversations,
  useMessages,
  useSession,
  useSignedFile,
  type ChatMessage,
  type ConversationThread,
} from "@/lib/data";

export const Route = createFileRoute("/chat")({
  validateSearch: (search: Record<string, unknown>) => ({
    u: typeof search['u'] === "string" ? (search['u'] as string) : undefined,
    c: typeof search['c'] === "string" ? (search['c'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Messages | TradeHub Marketplace" },
      {
        name: "description",
        content:
          "Private messenger for verified textile traders: chat in real time and share rate lists, images and documents.",
      },
      { property: "og:title", content: "Messages | TradeHub Marketplace" },
      {
        property: "og:description",
        content: "Chat directly with buyers and sellers and share files securely.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { user, loading } = useSession();
  const { u, c } = Route.useSearch();
  const navigate = useNavigate();
  const { data: threads = [], isLoading } = useConversations(user?.id);
  const [active, setActive] = useState<string | undefined>(c);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!u || !user?.id || u === user.id) return;
    let cancelled = false;
    getOrCreateConversation(user.id, u)
      .then((id) => {
        if (cancelled) return;
        setActive(id);
        void navigate({ to: "/chat", search: { u: undefined, c: id }, replace: true });
      })
      .catch(() => toast.error("Could not open that conversation."));
    return () => {
      cancelled = true;
    };
  }, [u, user?.id, navigate]);

  const thread = threads.find((item) => item.id === active);

  return (
    <AppShell>
      <h1 className="mb-3 text-xl font-bold">Messages</h1>
      <div className="grid gap-4 md:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className={`${active ? "hidden md:block" : "block"} space-y-2`}>
          {isLoading ? <p className="text-sm text-muted-foreground">Loading chats…</p> : null}
          {!isLoading && threads.length === 0 ? (
            <p className="rounded-2xl bg-card p-4 text-sm text-muted-foreground shadow-card">
              No conversations yet. Open a post and tap “Message” to start one.
            </p>
          ) : null}
          {threads.map((item) => (
            <ThreadRow
              key={item.id}
              thread={item}
              active={item.id === active}
              onSelect={() => {
                setActive(item.id);
                void navigate({ to: "/chat", search: { u: undefined, c: item.id }, replace: true });
              }}
            />
          ))}
        </aside>

        <section className={`${active ? "block" : "hidden md:block"} min-w-0`}>
          {active && user ? (
            <ChatThread
              conversationId={active}
              meId={user.id}
              title={thread?.other?.full_name || thread?.other?.company_name || "Conversation"}
              onBack={() => {
                setActive(undefined);
                void navigate({ to: "/chat", search: { u: undefined, c: undefined }, replace: true });
              }}
            />
          ) : (
            <div className="hidden rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground shadow-card md:block">
              Select a conversation to start chatting.
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function ThreadRow({
  thread,
  active,
  onSelect,
}: {
  thread: ConversationThread;
  active: boolean;
  onSelect: () => void;
}) {
  const name = thread.other?.full_name || "Member";
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors ${
        active ? "bg-accent" : "bg-card hover:bg-accent/60"
      } shadow-card`}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-bubble text-sm font-bold">
        {name.charAt(0).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold">{name}</span>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {timeAgo(thread.last_message_at)}
          </span>
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {thread.last_body || thread.other?.company_name || "Say hello"}
        </span>
      </span>
    </button>
  );
}

function ChatThread({
  conversationId,
  meId,
  title,
  onBack,
}: {
  conversationId: string;
  meId: string;
  title: string;
  onBack: () => void;
}) {
  const { data: messages = [] } = useMessages(conversationId);
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function send(file?: File) {
    if (!file && !text.trim()) return;
    setSending(true);
    let filePath: string | null = null;

    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setSending(false);
        toast.error("Files must be 10 MB or smaller.");
        return;
      }
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${conversationId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("chat-files")
        .upload(path, file, { contentType: file.type || "application/octet-stream" });
      if (uploadError) {
        setSending(false);
        toast.error("Could not upload that file.");
        return;
      }
      filePath = path;
    }

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: meId,
      body: text.trim(),
      file_path: filePath,
      file_name: file?.name ?? null,
      file_type: file?.type ?? null,
    } as never);
    setSending(false);
    if (error) {
      toast.error("Message could not be sent.");
      return;
    }
    setText("");
    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() } as never)
      .eq("id", conversationId);
    await queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    await queryClient.invalidateQueries({ queryKey: ["conversations"] });
  }

  return (
    <div className="flex h-[70vh] flex-col overflow-hidden rounded-2xl bg-card shadow-card">
      <header className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="rounded-lg p-1.5 hover:bg-accent md:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <p className="truncate text-sm font-bold">{title}</p>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto bg-background/40 p-3">
        {messages.map((message) => (
          <Bubble key={message.id} message={message} mine={message.sender_id === meId} />
        ))}
        {messages.length === 0 ? (
          <p className="pt-6 text-center text-xs text-muted-foreground">
            No messages yet — say hello.
          </p>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
        className="flex items-center gap-2 border-t border-border p-2"
      >
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void send(file);
          }}
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Attach a file"
          onClick={() => fileRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Write a message…"
          aria-label="Message"
          className="h-10"
        />
        <Button type="submit" size="icon" disabled={sending} aria-label="Send message">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

function Bubble({ message, mine }: { message: ChatMessage; mine: boolean }) {
  const { data: url } = useSignedFile("chat-files", message.file_path);
  const isImage = (message.file_type ?? "").startsWith("image/");

  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
          mine
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm bg-card text-foreground shadow-card"
        }`}
      >
        {message.file_path ? (
          isImage && url ? (
            <a href={url} target="_blank" rel="noopener noreferrer">
              <img
                src={url}
                alt={message.file_name ?? "Attachment"}
                loading="lazy"
                className="mb-1 max-h-60 rounded-xl object-cover"
              />
            </a>
          ) : (
            <a
              href={url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-1 flex items-center gap-2 rounded-xl bg-background/20 px-2 py-1.5 text-xs font-semibold underline"
            >
              <Download className="h-3.5 w-3.5" />
              {message.file_name ?? "Attachment"}
            </a>
          )
        ) : null}
        {message.body ? <p className="whitespace-pre-wrap">{message.body}</p> : null}
        <p className={`mt-0.5 text-[10px] ${mine ? "opacity-70" : "text-muted-foreground"}`}>
          {timeAgo(message.created_at)}
        </p>
      </div>
    </div>
  );
}
