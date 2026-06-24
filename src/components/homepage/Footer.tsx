import CoveLogo from "./CoveLogo";

export default function Footer() {
  return (
    <footer className="w-full py-10 border-t border-cove-border-light bg-cove-offwhite">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left: brand */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CoveLogo size={20} />
              <span className="text-sm font-semibold text-cove-charcoal">cove</span>
            </div>
            <p className="text-xs text-cove-muted max-w-xs">
              Your executive function companion. Built with care for brains that work differently.
            </p>
          </div>

          {/* Center: links */}
          <div className="flex gap-8">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-medium tracking-wider uppercase text-cove-muted/60">Product</span>
              <a href="/features" className="text-xs text-cove-muted hover:text-cove-charcoal transition-colors">Features</a>
              <a href="/register" className="text-xs text-cove-muted hover:text-cove-charcoal transition-colors">Get started</a>
              <a href="/login" className="text-xs text-cove-muted hover:text-cove-charcoal transition-colors">Log in</a>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-medium tracking-wider uppercase text-cove-muted/60">Legal</span>
              <a href="/privacy" className="text-xs text-cove-muted hover:text-cove-charcoal transition-colors">Privacy</a>
              <a href="/terms" className="text-xs text-cove-muted hover:text-cove-charcoal transition-colors">Terms</a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-cove-border-light flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-cove-muted/50">
            &copy; {new Date().getFullYear()} Cove. All rights reserved.
          </p>
          <p className="text-[11px] text-cove-muted/50 max-w-md sm:text-right">
            Cove is a wellness and productivity tool, not a medical device. It does not
            diagnose, treat, or cure any condition and is not a substitute for professional
            care. If you&apos;re in crisis, contact your local emergency services or call or
            text 988 (US).
          </p>
        </div>
      </div>
    </footer>
  );
}
