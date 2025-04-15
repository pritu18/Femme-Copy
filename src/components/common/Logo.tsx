
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex items-center">
        <div className="rounded-full bg-femme-purple w-10 h-10 flex items-center justify-center">
          <span className="text-white font-bold text-xl">F</span>
        </div>
        <span className="ml-2 font-bold text-2xl text-femme-dark">
          Femme
        </span>
      </div>
    </div>
  );
}
