import CoveLogo from "./CoveLogo";

export default function Footer() {
  return (
    <footer className="w-full py-8 text-center border-t border-cove-border-light bg-cove-offwhite">
      <div className="flex items-center justify-center gap-2 mb-1.5">
        <CoveLogo size={18} />
        <span className="text-sm font-medium text-cove-muted">cove</span>
      </div>
      <p className="text-xs text-cove-muted">
        Your executive function companion &middot; Already have an account?{" "}
        <a href="/login" className="text-cove-accent underline hover:text-cove-accent-hover transition-colors">Log in</a>
      </p>
    </footer>
  );
}
