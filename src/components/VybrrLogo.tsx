interface VybrrLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function VybrrLogo({ size = "md", className = "" }: VybrrLogoProps) {
  const iconSize = size === "sm" ? 28 : size === "lg" ? 44 : 36;
  const textClass =
    size === "sm"
      ? "text-base"
      : size === "lg"
      ? "text-2xl"
      : "text-xl";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Icon: two interlocked rings on a violet rounded square */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="20" cy="20" r="20" fill="#7c5cfc" />
        {/* Left ring */}
        <circle cx="15" cy="20" r="7.5" stroke="white" strokeWidth="2.5" fill="none" opacity="0.95" />
        {/* Right ring */}
        <circle cx="25" cy="20" r="7.5" stroke="white" strokeWidth="2.5" fill="none" opacity="0.95" />
        {/* Intersection highlight — a subtle fill to emphasise the link */}
        <path
          d="M20 12.99A7.5 7.5 0 0 1 20 27.01A7.5 7.5 0 0 1 20 12.99Z"
          fill="white"
          opacity="0.12"
        />
      </svg>

      {/* Wordmark */}
      <span className={`relative font-heading font-bold ${textClass} text-foreground tracking-tight select-none`}>
        Vybrr
        {/* Accent dot above the last r — brand signature */}
        <span className="absolute -top-1.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
      </span>
    </div>
  );
}
