import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, LogOut, Save, Camera } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { useSupabaseData } from "@/hooks/useSupabaseData";

interface ProfileData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function Profile() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Use the enhanced useSupabaseData hook
  const { 
    data: profiles, 
    loading: isLoading, 
    updateData, 
    insertData 
  } = useSupabaseData<ProfileData>(
    {
      table: 'profiles',
      column: 'id',
      value: user?.id
    },
    [user?.id]
  );
  
  const profile = profiles?.[0] || null;

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Check if profile exists
      if (profile) {
        // Update existing profile
        const { error } = await updateData(user.id, {
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
      } else {
        // Create new profile if doesn't exist
        const { error } = await insertData({
          id: user.id,
          first_name: firstName,
          last_name: lastName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
      }

      toast({
        title: t("profile.updateSuccess"),
        description: t("profile.updateSuccessMessage", "Your profile has been updated successfully"),
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: t("profile.updateFailed"),
        description: t("profile.updateFailedMessage", "Failed to update your profile"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getInitials = () => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-femme-beige to-femme-pink-light">
      <header className="bg-white shadow-md py-4 sticky top-0 z-10">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Logo className="h-10" />
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="border-femme-pink text-femme-burgundy hover:bg-femme-pink-light hover:text-femme-burgundy">
            {t("nav.dashboard")}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-femme-burgundy mb-6">{t("profile.title")}</h1>

          {isLoading ? (
            <div className="flex justify-center my-8">
              <Loader2 className="h-8 w-8 animate-spin text-femme-burgundy" />
            </div>
          ) : (
            <Card className="shadow-lg border-femme-taupe border-opacity-50">
              <CardHeader>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      {avatarUrl ? (
                        <AvatarImage src={avatarUrl} alt={`${firstName} ${lastName}`} />
                      ) : null}
                      <AvatarFallback className="bg-femme-pink text-white text-xl">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="absolute bottom-0 right-0 rounded-full bg-white border-femme-pink"
                      disabled
                    >
                      <Camera className="h-4 w-4 text-femme-burgundy" />
                    </Button>
                  </div>
                  <div>
                    <CardTitle className="text-femme-burgundy text-xl mb-1">
                      {firstName && lastName ? `${firstName} ${lastName}` : t("profile.title")}
                    </CardTitle>
                    <CardDescription>{user?.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-femme-burgundy">
                    {t("profile.firstName")}
                  </label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-femme-burgundy">
                    {t("profile.lastName")}
                  </label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-femme-burgundy">
                    {t("auth.email")}
                  </label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col md:flex-row gap-3 justify-between">
                <Button 
                  variant="outline" 
                  className="w-full md:w-auto border-femme-burgundy text-femme-burgundy"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("nav.logout")}
                </Button>
                <Button 
                  onClick={handleSaveProfile}
                  className="w-full md:w-auto bg-femme-pink hover:bg-femme-burgundy"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("common.loading")}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t("profile.save")}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
