import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
}

export function Avatar({ src, alt = "Avatar", size = 32, className }: AvatarProps) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-surface-light text-xs font-medium text-muted",
          className
        )}
        style={{ width: size, height: size }}
      >
        {alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("rounded-full", className)}
    />
  );
}
