"use client";

import { LoginForm } from "@/components/auth/login-form";
import { Button } from "@repo/ui/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Bot, Globe, LogIn, LogOut, Moon, Sun } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useIntlayer } from "next-intlayer";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export function Header() {
    const content = useIntlayer("header");
    const { theme, setTheme } = useTheme();
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isLoginOpen, setIsLoginOpen] = useState(false);

    // Extract locale from pathname (reliable in App Router with i18n middleware)
    const currentLocale = pathname.split("/")[1] || "en";

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    const toggleLanguage = () => {
        const newLocale = currentLocale === "en" ? "tr" : "en";

        // Replace the first segment of the path
        const segments = pathname.split("/");
        if (segments[1] === currentLocale) {
            segments[1] = newLocale;
        } else {
            // If locale is missing (e.g. root), prepend it (though middleware should handle this)
            segments.splice(1, 0, newLocale);
        }
        const newPath = segments.join("/");

        router.push(newPath);
        router.refresh(); // Force refresh to ensure server components update
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
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="rounded-full"
                >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>

                {/* Language Switcher */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleLanguage}
                    className="gap-2 font-medium"
                >
                    <Globe className="w-4 h-4" />
                    <span className="uppercase">{currentLocale}</span>
                </Button>

                {/* Auth */}
                <div className="pl-3 border-l ml-1">
                    {session ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => signOut()}
                            className="gap-2 text-muted-foreground hover:text-destructive"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">
                                {content.logout.value}
                            </span>
                        </Button>
                    ) : (
                        <Dialog
                            open={isLoginOpen}
                            onOpenChange={setIsLoginOpen}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="gap-2 px-4"
                                >
                                    <LogIn className="w-4 h-4" />
                                    <span>{content.login.value}</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>
                                        {content.login.value}
                                    </DialogTitle>
                                </DialogHeader>
                                <LoginForm
                                    onSuccess={() => {
                                        setIsLoginOpen(false);
                                        router.refresh();
                                    }}
                                />
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>
        </header>
    );
}
