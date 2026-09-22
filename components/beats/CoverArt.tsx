import Image from "next/image";
import { cn } from "@/lib/utils";

export default function CoverArt({
  src,
  alt,
  className,
  sizes,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-surface via-[#0a1a10] to-background",
          className
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(0,255,102,0.14),transparent_60%)]" />
        <svg
          width="30%"
          height="30%"
          viewBox="0 0 24 24"
          fill="none"
          className="relative text-green/40"
        >
          <path
            d="M9 18V5l12-2v13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "(max-width: 768px) 50vw, 25vw"}
        className="object-cover"
        priority={priority}
      />
    </div>
  );
}
