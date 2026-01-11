"use client";

import { useIntlayer } from "next-intlayer";
import { useTheme } from "next-themes";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@repo/ui/components/ui/button";
import { Bot, Moon, Sun, Globe, LogOut, LogIn } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export function Header() {
  const content = useIntlayer("header");
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleLanguage = () => {
    // Basic locale switch logic assuming /[locale]/... structure
    const currentLocale = pathname.split("/")[1];
    const newLocale = currentLocale === "en" ? "tr" : "en";
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <header className="flex h-16 w-full items-center justify-between border-b px-6 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      {/* Left: Logo & Brand */}
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-lg text-primary">
          <Bot className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {content.title.value}
        </h1>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Language Switcher */}
        <Button variant="ghost" size="sm" onClick={toggleLanguage} className="gap-2 font-medium">
          <Globe className="w-4 h-4" />
          <span className="uppercase">{pathname.split("/")[1]}</span>
        </Button>

        {/* Auth */}
        <div className="pl-3 border-l ml-1">
          {session ? (
            <Button variant="ghost" size="sm" onClick={() => signOut()} className="gap-2 text-muted-foreground hover:text-destructive">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{content.logout.value}</span>
            </Button>
          ) : (
            <Button variant="default" size="sm" onClick={() => signIn()} className="gap-2 px-4">
              <LogIn className="w-4 h-4" />
              <span>{content.login.value}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
