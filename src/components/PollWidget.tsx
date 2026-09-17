import { useQueryClient } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { castPollVote, useActivePoll, useSession } from "@/lib/data";

export function PollWidget({ className = "" }: { className?: string }) {
  const { data } = useActivePoll();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  const myVote = useMemo(
    () => data?.votes.find((vote) => vote.user_id === user?.id) ?? null,
    [data, user?.id],
  );
  const [revealed, setRevealed] = useState(false);
  const showResults = !!myVote || revealed;

  if (!data) return null;
  const total = data.votes.length;

  async function vote(optionId: string) {
    if (!user || !data) return;
    setBusy(true);
    try {
      await castPollVote(data.poll.id, optionId, user.id);
      await queryClient.invalidateQueries({ queryKey: ["active-poll"] });
    } catch {
      toast.error("Could not save your vote.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={`rounded-2xl bg-card p-4 shadow-card ${className}`}>
      <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
        <BarChart3 className="h-3.5 w-3.5" /> Market poll
      </p>
      <h3 className="mt-1.5 text-sm font-extrabold">{data.poll.question}</h3>

      <div className="mt-3 space-y-2">
        {data.options.map((option) => {
          const count = data.votes.filter((vote) => vote.option_id === option.id).length;
          const pct = total === 0 ? 0 : Math.round((count / total) * 100);
          const mine = myVote?.option_id === option.id;
          return (
            <button
              key={option.id}
              type="button"
              disabled={busy || !user}
              onClick={() => void vote(option.id)}
              className={`relative w-full overflow-hidden rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-colors ${
                mine ? "border-primary" : "border-border hover:bg-accent"
              } ${!user ? "cursor-default opacity-90" : ""}`}
            >
              {showResults ? (
                <span
                  className="absolute inset-y-0 left-0 bg-primary/15"
                  style={{ width: `${pct}%` }}
                  aria-hidden
                />
              ) : null}
              <span className="relative flex items-center justify-between">
                <span>{option.label}</span>
                {showResults ? <span className="tabular-nums">{pct}%</span> : null}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground">
        {total} vote{total === 1 ? "" : "s"}
        {" · "}
        {user ? (
          myVote ? (
            "Tap another option to change your vote"
          ) : (
            <button type="button" className="underline" onClick={() => setRevealed(true)}>
              See results
            </button>
          )
        ) : (
          <Link to="/auth" className="underline">
            Login to vote
          </Link>
        )}
      </p>
    </section>
  );
}
