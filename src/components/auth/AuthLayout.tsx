
import { ReactNode } from "react";
import { Heart, Flower } from "lucide-react";
import { Logo } from "../common/Logo";
import { BackgroundPattern } from "./BackgroundPattern";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-white to-femme-purple-light relative overflow-hidden">
      <BackgroundPattern />
      <div className="w-full max-w-md mb-6 relative z-10">
        <Logo className="mx-auto" />
        <h2 className="text-center text-femme-gray mt-2 text-sm font-medium flex items-center justify-center gap-2">
          <Flower size={16} className="text-femme-purple opacity-70" />
          Your personal cycle companion
          <Heart size={16} className="text-femme-purple opacity-70" />
        </h2>
      </div>
      <div className="relative z-10">
        {children}
      </div>
      <div className="mt-6 text-center text-xs text-femme-gray opacity-70 relative z-10">
        &copy; {new Date().getFullYear()} Femme App. All rights reserved.
      </div>
    </div>
  );
}
