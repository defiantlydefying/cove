"use client";

import AvatarDisplay from "./AvatarDisplay";

interface ProfileCardProps {
  displayName: string;
  avatarKey: string | null;
  onRequestChat?: () => void;
  onClose: () => void;
}

export default function ProfileCard({ displayName, avatarKey, onRequestChat, onClose }: ProfileCardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative bg-white rounded-2xl p-6 flex flex-col items-center gap-4 shadow-xl max-w-xs w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <AvatarDisplay avatarKey={avatarKey} size="lg" />
        <p className="text-base font-semibold text-cove-charcoal">{displayName}</p>

        <div className="flex flex-col gap-2 w-full">
          {onRequestChat && (
            <button
              onClick={onRequestChat}
              className="w-full py-2.5 text-sm font-medium text-white bg-cove-accent rounded-xl hover:bg-cove-accent-hover transition-colors"
            >
              Request to chat
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm text-cove-muted hover:text-cove-charcoal rounded-xl border border-cove-border-light transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
