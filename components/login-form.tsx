"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Lato:wght@300;400;700&display=swap"
        rel="stylesheet"
      />

      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .axxey-input:focus {
          border-color: #fb923c !important;
          outline: none;
          box-shadow: 0 0 0 3px rgba(251,146,60,0.12);
        }
        .axxey-submit:hover {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(234,88,12,0.35) !important;
        }
        .axxey-submit { transition: all 0.2s ease; }
      `}</style>

      {/* Full-page warm background */}
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
        style={{ background: "#fffaf6", fontFamily: "'Lato', sans-serif" }}
      >
        {/* Background blobs */}
        <div className="absolute pointer-events-none" style={{ width: 500, height: 500, background: "radial-gradient(circle, rgba(251,146,60,0.09) 0%, transparent 70%)", top: "0%", left: "50%", transform: "translateX(-50%)" }} />
        <div className="absolute pointer-events-none" style={{ width: 250, height: 250, background: "radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)", top: "20%", left: "5%" }} />
        <div className="absolute pointer-events-none" style={{ width: 200, height: 200, background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)", bottom: "20%", right: "5%" }} />

        {/* Card */}
        <div
          className={cn("w-full max-w-md relative z-10", className)}
          style={{ animation: "fade-up 0.6s ease forwards" }}
          {...props}
        >
          {/* Logo / back to home */}
          <Link href="/" className="flex items-center gap-2.5 mb-8 w-fit mx-auto group">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #fb923c, #ea580c)" }}
            >
              <span className="text-white font-black text-base" style={{ fontFamily: "'Nunito', sans-serif" }}>A</span>
            </div>
            <span className="font-black text-stone-800 text-xl tracking-tight group-hover:text-orange-500 transition-colors" style={{ fontFamily: "'Nunito', sans-serif" }}>
              AXXEY
            </span>
          </Link>

          {/* Form card */}
          <div
            className="rounded-3xl p-8"
            style={{
              background: "#fff",
              border: "2px solid #f5ede4",
              boxShadow: "0 16px 60px rgba(234,88,12,0.08), 0 0 0 1px rgba(234,88,12,0.04)",
            }}
          >
            <h1
              className="text-2xl font-black text-stone-800 mb-1"
              style={{ fontFamily: "'Nunito', sans-serif", letterSpacing: "-0.02em" }}
            >
              Welcome back!
            </h1>
            <p className="text-stone-500 text-sm mb-7">
              Sign in to find accessible spots near you.
            </p>

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-bold text-stone-500 uppercase tracking-wider"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="axxey-input w-full rounded-2xl px-4 py-3 text-sm text-stone-800 placeholder-stone-300 transition-all"
                  style={{ background: "#faf7f4", border: "2px solid #e7e0d8" }}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-bold text-stone-500 uppercase tracking-wider"
                  >
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-orange-500 hover:text-orange-600 font-semibold transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="axxey-input w-full rounded-2xl px-4 py-3 text-sm text-stone-800 placeholder-stone-300 transition-all"
                  style={{ background: "#faf7f4", border: "2px solid #e7e0d8" }}
                />
              </div>

              {/* Error */}
              {error && (
                <div
                  className="rounded-2xl px-4 py-3 text-sm font-medium"
                  style={{ background: "#fef2f2", border: "2px solid #fecaca", color: "#dc2626" }}
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="axxey-submit w-full rounded-2xl py-3.5 text-sm font-black text-white mt-1"
                style={{
                  background: isLoading
                    ? "#fdba74"
                    : "linear-gradient(135deg, #fb923c, #ea580c)",
                  boxShadow: isLoading ? "none" : "0 4px 20px rgba(234,88,12,0.3)",
                  fontFamily: "'Nunito', sans-serif",
                  cursor: isLoading ? "not-allowed" : "pointer",
                }}
              >
                {isLoading ? "Signing in..." : "Sign In →"}
              </button>
            </form>

            {/* Sign up link */}
            <p className="text-center text-sm text-stone-400 mt-6">
              New to AXXEY?{" "}
              <Link
                href="/auth/sign-up"
                className="text-orange-500 hover:text-orange-600 font-bold transition-colors"
              >
                Sign up free
              </Link>
            </p>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-stone-400 mt-6">
            Making NYC accessible for everyone 🗽
          </p>
        </div>
      </div>
    </>
  );
}
