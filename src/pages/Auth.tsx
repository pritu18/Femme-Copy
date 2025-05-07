
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { useAuth } from "@/contexts/AuthContext";

export default function Auth() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-femme-beige to-femme-pink-light">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-femme-burgundy mx-auto mb-4" />
          <p className="text-femme-burgundy">Loading...</p>
        </div>
      </div>
    );
  }

  if (isForgotPassword) {
    return (
      <AuthLayout>
        <AuthCard
          title="Reset Password"
          description="We'll send you instructions to reset your password"
          footer={
            <button
              onClick={() => setIsForgotPassword(false)}
              className="text-sm text-femme-burgundy hover:underline"
            >
              Back to login
            </button>
          }
        >
          <ForgotPasswordForm
            onSuccess={() => setIsForgotPassword(false)}
          />
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome to Femme"
        description="Your personal cycle companion"
      >
        <Tabs 
          defaultValue="login" 
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "login" | "signup")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Log In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <LoginForm
              onSuccess={() => navigate("/dashboard")}
              onForgotPassword={() => setIsForgotPassword(true)}
            />
          </TabsContent>

          <TabsContent value="signup">
            <SignupForm
              onSuccess={() => {
                // After signup, switch to login tab
                setActiveTab("login");
              }}
            />
          </TabsContent>
        </Tabs>
      </AuthCard>
    </AuthLayout>
  );
}
