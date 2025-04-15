
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { Button } from "@/components/ui/button";

type AuthView = "login" | "signup" | "forgotPassword";

export default function Auth() {
  const [view, setView] = useState<AuthView>("login");
  const navigate = useNavigate();
  
  const handleSuccessfulAuth = () => {
    // After successful authentication, redirect to the dashboard
    navigate("/dashboard");
  };
  
  return (
    <AuthLayout>
      {view === "login" && (
        <AuthCard 
          title="Welcome" 
          description="Enter your details to access your account"
          footer={
            <div className="w-full text-center space-y-4">
              <div className="text-sm text-femme-burgundy/70">
                Don't have an account?{" "}
                <Button 
                  variant="link" 
                  className="text-femme-pink hover:text-femme-burgundy p-0 h-auto" 
                  onClick={() => setView("signup")}
                >
                  Sign up
                </Button>
              </div>
            </div>
          }
        >
          <LoginForm 
            onSuccess={handleSuccessfulAuth}
            onForgotPassword={() => setView("forgotPassword")}
          />
        </AuthCard>
      )}
      
      {view === "signup" && (
        <AuthCard 
          title="Create an account" 
          description="Track your cycle with Femme"
          footer={
            <div className="w-full text-center space-y-4">
              <div className="text-sm text-femme-burgundy/70">
                Already have an account?{" "}
                <Button 
                  variant="link" 
                  className="text-femme-pink hover:text-femme-burgundy p-0 h-auto" 
                  onClick={() => setView("login")}
                >
                  Log in
                </Button>
              </div>
            </div>
          }
        >
          <SignupForm onSuccess={handleSuccessfulAuth} />
        </AuthCard>
      )}
      
      {view === "forgotPassword" && (
        <AuthCard 
          title="Reset your password" 
          footer={
            <Button 
              variant="link" 
              className="text-femme-pink hover:text-femme-burgundy mt-2" 
              onClick={() => setView("login")}
            >
              Back to login
            </Button>
          }
        >
          <ForgotPasswordForm onSuccess={() => setView("login")} />
        </AuthCard>
      )}
    </AuthLayout>
  );
}
