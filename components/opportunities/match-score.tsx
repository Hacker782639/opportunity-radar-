import { Sparkles } from "lucide-react";

type MatchScoreProps = {
  score: number;
  size?: "sm" | "md" | "lg";
};

export function MatchScore({
  score,
  size = "md",
}: MatchScoreProps) {
  const sizes = {
    sm: "text-[11px]",
    md: "text-xs",
    lg: "text-lg",
  };

  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-1 font-bold text-violet-700 dark:bg-violet-500/10 dark:text-violet-400">
      <Sparkles className="h-3 w-3" />
      <span className={sizes[size]}>{score}%</span>
    </span>
  );
}
