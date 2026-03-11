import * as React from 'react'

// ---------------------------------------------------------------------------
// Styles — injected into <head> so they are parsed before any Tailwind CSS
// loads and before React runs. The .dark selector works because the theme-
// detection inline script (in __root.tsx <head>) already adds .dark / .light
// to <html> before anything is painted.
// ---------------------------------------------------------------------------
export const SPLASH_STYLES = `
  #app-splash {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    background-color: oklch(0.9383 0.0042 236.4993);
    opacity: 1;
    transition: opacity 0.4s ease;
  }

  .dark #app-splash {
    background-color: oklch(0.2598 0.0306 262.6666);
  }

  #app-splash-logo {
    width: 72px;
    height: 72px;
    object-fit: contain;
  }

  #app-splash-name {
    font-family: Inter, system-ui, sans-serif;
    font-size: 0.9375rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    color: oklch(0.551 0.0234 264.3637);
  }

  .dark #app-splash-name {
    color: oklch(0.7155 0 0);
  }

  #app-splash-spinner {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 2.5px solid oklch(0.9022 0.0052 247.8822);
    border-top-color: oklch(0.6397 0.172 36.4421);
    animation: splash-spin 0.65s linear infinite;
  }

  .dark #app-splash-spinner {
    border-color: oklch(0.3843 0.0301 269.7337);
    border-top-color: oklch(0.6397 0.172 36.4421);
  }

  @keyframes splash-spin {
    to { transform: rotate(360deg); }
  }
`

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const AppSplash = () => {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return

    // Trigger CSS opacity transition
    el.style.opacity = '0'

    // Remove from DOM after the transition finishes so it leaves no trace
    const id = setTimeout(() => el.remove(), 450)
    return () => clearTimeout(id)
  }, [])

  return (
    <div ref={ref} id="app-splash">
      <img
        id="app-splash-logo"
        src="/logo-moriuchi.svg"
        alt=""
        aria-hidden="true"
      />
      <span id="app-splash-name">Loading...</span>
      <div id="app-splash-spinner" role="status" aria-label="Loading" />
    </div>
  )
}
