"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { signIn } from "next-auth/react";
import { useIntlayer } from "next-intlayer";
import { useState } from "react";

interface LoginFormProps {
    onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
    const content = useIntlayer("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(content.errorInvalid.value);
            } else {
                // Success
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            setError(content.errorGeneric.value);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="email">{content.emailLabel.value}</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder={content.emailPlaceholder.value}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">{content.passwordLabel.value}</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder={content.passwordPlaceholder.value}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            {error && (
                <p className="text-sm text-destructive font-medium">{error}</p>
            )}
            <Button type="submit" disabled={isLoading}>
                {isLoading ? content.loading.value : content.submitButton.value}
            </Button>
        </form>
    );
}
