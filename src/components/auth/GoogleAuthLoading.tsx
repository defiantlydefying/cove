interface GoogleAuthLoadingProps {
  message: string;
}

export default function GoogleAuthLoading({ message }: GoogleAuthLoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-cove-offwhite/95 px-8 text-center backdrop-blur-sm"
    >
      <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-cove-accent-light shadow-sm">
        <span className="absolute inset-0 animate-ping rounded-2xl bg-cove-accent/10" aria-hidden="true" />
        <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-cove-accent/20 border-t-cove-accent" aria-hidden="true" />
      </div>
      <div>
        <p className="text-lg font-semibold text-cove-charcoal">{message}</p>
        <p className="mt-1 text-sm text-cove-muted">Finishing securely with Google&hellip;</p>
      </div>
    </div>
  );
}
