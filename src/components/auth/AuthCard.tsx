
import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function AuthCard({ 
  title, 
  description, 
  children, 
  footer, 
  className 
}: AuthCardProps) {
  return (
    <Card className={cn("w-full max-w-md shadow-lg border-femme-purple-light bg-white/90 backdrop-blur-sm", className)}>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold text-femme-purple">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-femme-gray">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="flex flex-col items-center justify-center gap-2 pt-0">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
