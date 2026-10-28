/** Triángulo de advertencia de trazo plano; decorativo, siempre acompañado de texto. */
export function IconoAdvertencia({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3.5 22 20.5H2z" />
      <path d="M12 10v5" />
      <path d="M12 17.8v.2" />
    </svg>
  );
}
