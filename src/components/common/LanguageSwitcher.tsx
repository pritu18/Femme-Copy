import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language || "en");
  const { toast } = useToast();

  // Keep track of the current language
  useEffect(() => {
    setCurrentLang(i18n.language);
  }, [i18n.language]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng).then(() => {
      setCurrentLang(lng);
      setOpen(false);
      toast({
        title: t("language.changed"),
        description: t("language.changedDescription"),
      });
      
      // Force update by storing in localStorage
      localStorage.setItem("i18nextLng", lng);
      
      // Force reload translations
      document.documentElement.lang = lng;
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Globe className="h-5 w-5" />
          <span className="sr-only">{t("language.select")}</span>
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
            {currentLang.toUpperCase()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => changeLanguage("en")}
          className={currentLang === "en" ? "bg-accent" : ""}
        >
          {t("language.en")}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage("hi")}
          className={currentLang === "hi" ? "bg-accent" : ""}
        >
          {t("language.hi")}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage("ta")}
          className={currentLang === "ta" ? "bg-accent" : ""}
        >
          {t("language.ta")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSwitcher;
