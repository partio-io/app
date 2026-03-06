"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const frames = [
  "/squirrel/squirrel-02.png",
  "/squirrel/squirrel-03.png",
  "/squirrel/squirrel-05.png",
  "/squirrel/squirrel-07.png",
];

interface SquirrelLoaderProps {
  message?: string;
  className?: string;
}

export function SquirrelLoader({
  message = "Loading...",
  className,
}: SquirrelLoaderProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % frames.length);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-16",
        className
      )}
    >
      <img
        src={frames[frame]}
        alt="Loading"
        className="h-24 w-24 object-contain animate-bounce"
      />
      <p className="text-sm text-muted animate-pulse">{message}</p>
    </div>
  );
}
