import * as React from "react";

type AvatarProps = {
  name?: string;
  src?: string;
  size?: "sm" | "md" | "lg";
};

export function Avatar({
  name = "User",
  src,
  size = "md",
}: AvatarProps) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
  };

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-violet-100 font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 ${sizes[size]}`}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}
