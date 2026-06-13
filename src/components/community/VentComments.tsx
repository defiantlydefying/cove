"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import AvatarDisplay from "./AvatarDisplay";

interface Comment {
  id: string;
  body: string;
  displayName: string | null;
  avatarKey: string | null;
  createdAt: string;
  isOwn: boolean;
}

interface VentCommentsProps {
  ventId: string;
  onProfileClick?: (displayName: string, avatarKey: string | null) => void;
}

export default function VentComments({ ventId, onProfileClick }: VentCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch(`/api/community/vents/${ventId}/comments`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ventId]);

  async function handlePost() {
    if (!newComment.trim() || posting) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/community/vents/${ventId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newComment.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast(data.error || "Couldn\u2019t post comment.", "error");
        return;
      }
      const comment = await res.json();
      setComments((prev) => [...prev, comment]);
      setNewComment("");
    } catch {
      toast("Couldn\u2019t post comment.", "error");
    } finally {
      setPosting(false);
    }
  }

  function formatTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  if (loading) {
    return <div className="h-12 animate-pulse rounded-lg bg-cove-border-light" />;
  }

  return (
    <div className="flex flex-col gap-3 border-t border-cove-border-light pt-3">
      {comments.length > 0 && (
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <button
                onClick={() => onProfileClick?.(comment.displayName ?? "anonymous", comment.avatarKey)}
                className="shrink-0"
              >
                <AvatarDisplay avatarKey={comment.avatarKey} size="sm" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-cove-charcoal">
                    {comment.displayName ?? "anonymous"}
                  </span>
                  <span className="text-xs text-cove-muted">{formatTime(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-cove-charcoal mt-0.5">{comment.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          maxLength={500}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handlePost();
            }
          }}
          className="flex-1 px-3 py-2 text-sm border border-cove-border-light rounded-lg bg-cove-offwhite text-cove-charcoal placeholder:text-cove-muted focus:outline-none focus:ring-1 focus:ring-cove-accent/30"
        />
        <button
          onClick={handlePost}
          disabled={posting || !newComment.trim()}
          className="px-3 py-2 text-sm font-medium text-white bg-cove-accent rounded-lg hover:bg-cove-accent-hover disabled:opacity-50 transition-colors"
        >
          Post
        </button>
      </div>
    </div>
  );
}
