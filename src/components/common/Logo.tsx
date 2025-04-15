
import { cn } from "@/lib/utils";
import { Flower } from "lucide-react";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex items-center bg-gradient-to-br from-femme-pink to-femme-pink-light rounded-full p-1">
        <div className="rounded-full bg-white w-12 h-12 flex items-center justify-center shadow-md">
          <Flower className="text-femme-burgundy w-7 h-7" />
        </div>
        <span className="ml-3 font-bold text-3xl text-femme-burgundy drop-shadow-sm">
          Femme
        </span>
      </div>
    </div>
  );
}
