import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { timeAgo, useComments, useIsAdmin, usePost, useSession } from "@/lib/data";
import { findBannedWord } from "@/lib/moderation";

export const Route = createFileRoute("/post/$postId")({
  head: () => ({
    meta: [
      { title: "Trade post & discussion | TradeHub Marketplace" },
      {
        name: "description",
        content:
          "View full details of this yarn, cotton or fabric offer, join the discussion and contact the seller on WhatsApp.",
      },
      { property: "og:title", content: "Trade post & discussion | TradeHub" },
      {
        property: "og:description",
        content: "Full offer details with quantity, rate and public comments.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PostDetailPage,
  errorComponent: () => (
    <AppShell>
      <p className="text-sm text-muted-foreground">This post could not be loaded.</p>
    </AppShell>
  ),
  notFoundComponent: () => (
    <AppShell>
      <p className="text-sm text-muted-foreground">Post not found.</p>
    </AppShell>
  ),
});

function PostDetailPage() {
  const { postId } = Route.useParams();
  const { user } = useSession();
  const { data: isAdmin } = useIsAdmin(user?.id);
  const { data: post, isLoading } = usePost(postId);
  const { data: comments = [] } = useComments(postId);
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function addComment(event: React.FormEvent) {
    event.preventDefault();
    if (!user) {
      toast.error("Sign in to join the discussion.");
      return;
    }
    const text = body.trim();
    if (!text) return;
    if (findBannedWord(text)) {
      toast.error("Please keep comments respectful.");
      return;
    }
    setSending(true);
    const { error } = await supabase
      .from("comments")
      .insert({ post_id: postId, user_id: user.id, body: text } as never);
    setSending(false);
    if (error) {
      toast.error("Could not post your comment.");
      return;
    }
    setBody("");
    await queryClient.invalidateQueries({ queryKey: ["comments", postId] });
  }

  async function removeComment(id: string) {
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) {
      toast.error("Could not delete the comment.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["comments", postId] });
  }

  return (
    <AppShell>
      <Link
        to="/"
        className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to feed
      </Link>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !post ? (
        <p className="text-sm text-muted-foreground">Post not found.</p>
      ) : (
        <PostCard post={post} />
      )}

      <section className="mt-5">
        <h2 className="text-sm font-bold tracking-wide uppercase">
          Discussion ({comments.length})
        </h2>

        <div className="mt-3 space-y-2">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No comments yet. Start the conversation.
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="rounded-xl rounded-tl-sm bg-card p-3 shadow-card">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold">
                      {comment.profiles?.full_name || "Member"}
                      <span className="ml-2 font-normal text-muted-foreground">
                        {comment.profiles?.company_name}
                        {comment.profiles?.city ? ` · ${comment.profiles.city}` : ""}
                      </span>
                    </p>
                    <p className="mt-1 text-sm whitespace-pre-wrap">{comment.body}</p>
                  </div>
                  <span className="text-[11px] whitespace-nowrap text-muted-foreground">
                    {timeAgo(comment.created_at)}
                  </span>
                  {isAdmin || comment.user_id === user?.id ? (
                    <button
                      type="button"
                      aria-label="Delete comment"
                      onClick={() => removeComment(comment.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>

        {user ? (
          <form onSubmit={addComment} className="mt-4 flex items-end gap-2">
            <Textarea
              rows={2}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write a comment…"
              className="flex-1 resize-none bg-card"
            />
            <Button type="submit" size="icon" disabled={sending} aria-label="Send comment">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <Button asChild className="mt-4 w-full">
            <Link to="/auth">Sign in to comment</Link>
          </Button>
        )}
      </section>
    </AppShell>
  );
}
