"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import VentCard, { type VentData } from "./VentCard";
import VentComposer from "./VentComposer";
import VentComments from "./VentComments";
import ProfileCard from "./ProfileCard";

export default function VentFeed() {
  const [vents, setVents] = useState<VentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showComposer, setShowComposer] = useState(false);
  const [expandedVentId, setExpandedVentId] = useState<string | null>(null);
  const [profileTarget, setProfileTarget] = useState<{ displayName: string; avatarKey: string | null } | null>(null);
  const { toast } = useToast();

  const fetchVents = useCallback(async () => {
    setError(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/community/vents?page=${page}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setVents(data.vents);
      setTotalPages(data.pages);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchVents();
  }, [fetchVents]);

  async function handleDelete(id: string) {
    const prev = vents;
    setVents((v) => v.filter((vent) => vent.id !== id));
    try {
      const res = await fetch(`/api/community/vents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast("Vent deleted.", "success");
    } catch {
      setVents(prev);
      toast("Couldn\u2019t delete. Try again.", "error");
    }
  }

  function handleExpand(id: string) {
    setExpandedVentId(expandedVentId === id ? null : id);
  }

  function handleProfileClick(displayName: string, avatarKey: string | null) {
    setProfileTarget({ displayName, avatarKey });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Guidelines banner */}
      <div className="bg-cove-sage-light/50 border border-cove-sage/20 rounded-xl px-4 py-3">
        <p className="text-xs text-cove-charcoal leading-relaxed">
          A safe space to let things out. Be kind — everyone here is figuring it out.
        </p>
      </div>

      {/* New vent button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-cove-charcoal">Recent vents</h3>
        <button
          onClick={() => setShowComposer(!showComposer)}
          className="text-sm text-cove-muted hover:text-cove-charcoal transition-colors"
        >
          {showComposer ? "Cancel" : "+ New vent"}
        </button>
      </div>

      {/* Composer */}
      {showComposer && (
        <div className="animate-fade-in-up">
          <VentComposer
            onCreated={() => {
              setShowComposer(false);
              fetchVents();
            }}
            onCancel={() => setShowComposer(false)}
          />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-cove-border-light animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-xl bg-cove-card border border-cove-border-light p-8 text-center">
          <p className="text-cove-muted">Couldn&apos;t load vents.</p>
          <button
            onClick={fetchVents}
            className="mt-3 px-5 py-2.5 text-sm font-medium rounded-xl bg-cove-accent text-white hover:bg-cove-accent-hover transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && vents.length === 0 && !showComposer && (
        <div className="text-center py-8 px-6 rounded-xl bg-cove-card border border-cove-border-light">
          <p className="text-base font-medium text-cove-charcoal mb-2">No vents yet</p>
          <p className="text-sm text-cove-muted leading-relaxed max-w-md mx-auto">
            Sometimes you just need to get something off your chest. Post a vent and it&apos;ll disappear after the time you choose.
          </p>
        </div>
      )}

      {/* Vent list */}
      {!loading && !error && vents.length > 0 && (
        <div className="flex flex-col gap-3">
          {vents.map((vent) => (
            <div key={vent.id}>
              <VentCard
                vent={vent}
                onDelete={handleDelete}
                onExpand={handleExpand}
                onProfileClick={handleProfileClick}
              />
              {expandedVentId === vent.id && (
                <div className="mt-2 ml-4 animate-fade-in-up">
                  <VentComments ventId={vent.id} onProfileClick={handleProfileClick} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="text-sm px-3 py-1.5 rounded-lg text-cove-muted hover:text-cove-charcoal disabled:opacity-40 transition-colors"
          >
            Previous
          </button>
          <span className="text-xs text-cove-muted">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="text-sm px-3 py-1.5 rounded-lg text-cove-muted hover:text-cove-charcoal disabled:opacity-40 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Profile card modal */}
      {profileTarget && (
        <ProfileCard
          displayName={profileTarget.displayName}
          avatarKey={profileTarget.avatarKey}
          onClose={() => setProfileTarget(null)}
        />
      )}
    </div>
  );
}
