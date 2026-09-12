import { Link } from "@tanstack/react-router";
import { Building2, MapPin, MessageCircle, Phone, Pin, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { timeAgo, useSignedImage, whatsappLink, type Post } from "@/lib/data";

export function PostImage({ path, alt }: { path: string | null; alt: string }) {
  const { data: url } = useSignedImage(path);
  if (!path || !url) return null;
  return (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      className="mt-3 max-h-96 w-full rounded-xl border border-border object-cover"
    />
  );
}

export function PostCard({
  post,
  isAdmin,
  onTogglePin,
  onDelete,
  showImage = true,
}: {
  post: Post;
  isAdmin?: boolean;
  onTogglePin?: (post: Post) => void;
  onDelete?: (post: Post) => void;
  showImage?: boolean;
}) {
  const poster = post.profiles;
  const message = `Hello ${poster?.full_name ?? ""}, I saw your ${post.category} post "${post.title}" and would like to discuss.`;

  return (
    <article className="rounded-2xl bg-card p-4 shadow-card">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bubble text-sm font-bold text-accent-foreground">
          {(poster?.full_name || "?").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{poster?.full_name || "Member"}</p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {poster?.company_name || "—"}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {poster?.city || "—"}
            </span>
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge variant="secondary">{post.category}</Badge>
          <span className="text-[11px] text-muted-foreground">{timeAgo(post.created_at)}</span>
        </div>
      </div>

      {post.is_pinned ? (
        <p className="mt-2 inline-flex items-center gap-1 rounded-md bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
          <Pin className="h-3 w-3" /> Pinned
        </p>
      ) : null}

      <div className="mt-3 rounded-xl rounded-tl-sm bg-bubble/60 p-3">
        <h3 className="font-semibold">{post.title}</h3>
        {post.details ? (
          <p className="mt-1 text-sm whitespace-pre-wrap text-foreground/85">{post.details}</p>
        ) : null}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {post.quantity ? (
            <span>
              <span className="text-muted-foreground">Qty:</span>{" "}
              <span className="font-semibold">{post.quantity}</span>
            </span>
          ) : null}
          {post.rate ? (
            <span>
              <span className="text-muted-foreground">Rate:</span>{" "}
              <span className="font-semibold">{post.rate}</span>
            </span>
          ) : null}
        </div>
      </div>

      {showImage ? <PostImage path={post.image_path} alt={`${post.category} rate list`} /> : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button asChild size="sm" className="flex-1 sm:flex-none">
          <a
            href={whatsappLink(poster?.whatsapp ?? "", message)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Phone className="h-4 w-4" /> Contact on WhatsApp
          </a>
        </Button>
        <Button asChild size="sm" variant="secondary">
          <Link to="/post/$postId" params={{ postId: post.id }}>
            <MessageCircle className="h-4 w-4" /> Comments
          </Link>
        </Button>

        {isAdmin ? (
          <>
            <Button size="sm" variant="outline" onClick={() => onTogglePin?.(post)}>
              <Pin className="h-4 w-4" /> {post.is_pinned ? "Unpin" : "Pin"}
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete?.(post)}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </>
        ) : null}
      </div>
    </article>
  );
}
