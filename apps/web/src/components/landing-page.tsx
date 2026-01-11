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
import {
    Image as ImageIcon,
    Layers,
    MessageSquareText,
    Sparkles,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useIntlayer } from "next-intlayer";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LandingPage() {
    const content = useIntlayer("landing");
    const { data: session } = useSession();
    const router = useRouter();
    const [isLoginOpen, setIsLoginOpen] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-12 animate-in fade-in zoom-in duration-500 slide-in-from-bottom-4">
            {/* Hero Section */}
            <div className="space-y-6 max-w-3xl">
                <div className="inline-flex items-center justify-center p-3 bg-primary/5 rounded-2xl mb-4 ring-1 ring-primary/10">
                    <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent pb-2">
                    {content.heroTitle.value}
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                    {content.heroDescription.value}
                </p>
                <div className="pt-4">
                    {!session && (
                        <Dialog
                            open={isLoginOpen}
                            onOpenChange={setIsLoginOpen}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    size="lg"
                                    className="h-12 px-8 text-base rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
                                >
                                    {content.getStarted.value}
                                </Button>
                            </DialogTrigger>
                                          <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                              <DialogTitle>{content.loginModalTitle.value}</DialogTitle>
                                            </DialogHeader>
                                            <LoginForm onSuccess={() => {
                                        setIsLoginOpen(false);
                                        router.refresh();
                                    }}
                                />
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl pt-8">
                <div className="flex flex-col items-center p-6 bg-card/50 border rounded-2xl backdrop-blur-sm hover:bg-card/80 transition-colors">
                    <Layers className="w-8 h-8 text-blue-500 mb-3" />
                    <h3 className="font-semibold">
                        {content.features.multiModel.value}
                    </h3>
                </div>
                <div className="flex flex-col items-center p-6 bg-card/50 border rounded-2xl backdrop-blur-sm hover:bg-card/80 transition-colors">
                    <ImageIcon className="w-8 h-8 text-purple-500 mb-3" />
                    <h3 className="font-semibold">
                        {content.features.multiModal.value}
                    </h3>
                </div>
                <div className="flex flex-col items-center p-6 bg-card/50 border rounded-2xl backdrop-blur-sm hover:bg-card/80 transition-colors">
                    <MessageSquareText className="w-8 h-8 text-green-500 mb-3" />
                    <h3 className="font-semibold">
                        {content.features.history.value}
                    </h3>
                </div>
            </div>
        </div>
    );
}
