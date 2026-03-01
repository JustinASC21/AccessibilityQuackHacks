"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthMode = "sign-in" | "sign-up";

export function AuthLandingModal() {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (mode === "sign-up" && password !== repeatPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;

      if (data.session) {
        router.refresh();
      } else {
        setMessage("Check your email to confirm your account.");
      }
    } catch (authError: unknown) {
      setError(authError instanceof Error ? authError.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-white p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col items-center gap-4">
        <h5 className="text-5xl h-[2.2rem] font-extrabold tracking-wide text-zinc-900">AXXEY</h5>
        <h3 className="text-[1.25rem] font-bold tracking-wide text-zinc-900">Accessibility Builds Trust. AXXEY Builds It.</h3>

        <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{mode === "sign-in" ? "Sign in" : "Sign up"}</CardTitle>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              type="button"
              variant={mode === "sign-in" ? "default" : "outline"}
              onClick={() => setMode("sign-in")}
            >
              Sign in
            </Button>
            <Button
              type="button"
              variant={mode === "sign-up" ? "default" : "outline"}
              onClick={() => setMode("sign-up")}
            >
              Sign up
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="auth-email">Email</Label>
              <Input
                id="auth-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="m@example.com"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="auth-password">Password</Label>
              <Input
                id="auth-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {mode === "sign-up" && (
              <div className="grid gap-2">
                <Label htmlFor="auth-repeat-password">Repeat Password</Label>
                <Input
                  id="auth-repeat-password"
                  type="password"
                  value={repeatPassword}
                  onChange={(event) => setRepeatPassword(event.target.value)}
                  required
                />
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
            {message && <p className="text-sm text-foreground/80">{message}</p>}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading
                ? mode === "sign-in"
                  ? "Signing in..."
                  : "Creating account..."
                : mode === "sign-in"
                  ? "Sign in"
                  : "Sign up"}
            </Button>
          </form>
        </CardContent>
        </Card>
      </div>
    </main>
  );
}