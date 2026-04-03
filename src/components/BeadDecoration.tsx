import { cn } from "@/lib/utils";

const colors = [
  "bg-bead-pink", "bg-bead-coral", "bg-bead-mint", "bg-bead-sky",
  "bg-bead-lavender", "bg-bead-lemon", "bg-bead-peach", "bg-bead-sage",
];

interface Props {
  count?: number;
  className?: string;
}

export default function BeadDecoration({ count = 8, className }: Props) {
  return (
    <div className={cn("flex gap-1.5 flex-wrap", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "w-3 h-3 rounded-sm bead-dot animate-bead-pop",
            colors[i % colors.length]
          )}
          style={{ animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  );
}
