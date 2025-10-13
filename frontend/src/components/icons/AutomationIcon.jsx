export default function AutomationIcon({ width = 24, height = 24, className = "" }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6" />
      <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24" />
      <path d="M1 12h6m6 0h6" />
      <path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24" />
    </svg>
  );
}