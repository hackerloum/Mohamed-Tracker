import { cn } from "@/lib/cn";

interface HairlineProps {
  accent?: boolean;
  className?: string;
}

export function Hairline({ accent = false, className }: HairlineProps) {
  return <div className={cn(accent ? "accent-rule" : "hairline", className)} />;
}
