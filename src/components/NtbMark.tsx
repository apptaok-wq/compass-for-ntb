import { cn } from "@/lib/utils";

/** Abstract mark evoking the three main landmasses of Nusa Tenggara Barat. */
export function NtbMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      role="img"
      aria-label="Lambang NTB-PIS"
      className={cn("shrink-0", className)}
    >
      <rect width="40" height="40" rx="9" fill="currentColor" opacity="0.12" />
      <path
        d="M7 24.5c2.6-3.4 5.4-5 8.4-4.6 3 .4 4.2 2.6 7 2.2 2.8-.4 4-3 6.8-2.4 2 .4 3.3 1.9 3.8 4.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="13" cy="14" r="2.6" fill="currentColor" />
      <circle cx="21" cy="11.5" r="1.8" fill="currentColor" opacity="0.6" />
      <circle cx="28.5" cy="14" r="2.2" fill="currentColor" opacity="0.8" />
    </svg>
  );
}
