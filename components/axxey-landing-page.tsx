"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ─── Auth Modal ───────────────────────────────────────────────────────────────
function AuthModal({
  mode,
  onClose,
  onSwitch,
}: {
  mode: "login" | "register";
  onClose: () => void;
  onSwitch: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ backgroundColor: "rgba(255,247,237,0.6)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl p-8 relative"
        style={{
          background: "#fff",
          boxShadow: "0 24px 80px rgba(234,88,12,0.12), 0 0 0 1px rgba(234,88,12,0.06)",
          animation: "modal-up 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all text-sm"
        >
          ✕
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-7">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #fb923c, #ea580c)" }}
          >
            <span className="text-white font-black text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>A</span>
          </div>
          <span className="font-black text-stone-800 text-lg tracking-tight" style={{ fontFamily: "'Nunito', sans-serif" }}>
            AXXEY
          </span>
        </div>

        <h2 className="text-2xl font-black text-stone-800 mb-1" style={{ fontFamily: "'Nunito', sans-serif" }}>
          {mode === "login" ? "Welcome back!" : "Join AXXEY"}
        </h2>
        <p className="text-stone-500 text-sm mb-7">
          {mode === "login"
            ? "Sign in to find accessible spots near you."
            : "Free forever. No credit card needed."}
        </p>

        {/* Point to the real auth pages */}
        <div className="flex flex-col gap-3">
          <Link
            href={mode === "login" ? "/auth/login" : "/auth/sign-up"}
            className="w-full rounded-2xl py-3.5 text-sm font-bold text-white text-center transition-all"
            style={{
              background: "linear-gradient(135deg, #fb923c, #ea580c)",
              boxShadow: "0 4px 20px rgba(234,88,12,0.3)",
            }}
          >
            {mode === "login" ? "Sign In →" : "Create Free Account →"}
          </Link>
        </div>

        <p className="text-center text-sm text-stone-400 mt-5">
          {mode === "login" ? "New to AXXEY? " : "Already have an account? "}
          <button
            onClick={onSwitch}
            className="text-orange-500 hover:text-orange-600 font-bold transition-colors"
          >
            {mode === "login" ? "Sign up free" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

// ─── Feature Pill ─────────────────────────────────────────────────────────────
function FeaturePill({
  emoji,
  label,
  color,
  delay,
}: {
  emoji: string;
  label: string;
  color: { bg: string; border: string; text: string };
  delay: string;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-5 py-4 font-bold text-base"
      style={{
        background: color.bg,
        border: `2px solid ${color.border}`,
        color: color.text,
        fontFamily: "'Nunito', sans-serif",
        animation: "pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
        animationDelay: delay,
        opacity: 0,
      }}
    >
      <span className="text-2xl">{emoji}</span>
      {label}
    </div>
  );
}

// ─── Step ─────────────────────────────────────────────────────────────────────
function Step({
  number,
  title,
  desc,
  emoji,
  delay,
}: {
  number: string;
  title: string;
  desc: string;
  emoji: string;
  delay: string;
}) {
  return (
    <div
      className="flex flex-col items-center text-center gap-3 px-4"
      style={{ animation: "fade-up 0.6s ease forwards", animationDelay: delay, opacity: 0 }}
    >
      <div
        className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mb-1"
        style={{ background: "linear-gradient(135deg, #fff7ed, #fed7aa)", border: "2px solid #fdba74" }}
      >
        {emoji}
      </div>
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white"
        style={{ background: "linear-gradient(135deg, #fb923c, #ea580c)", marginTop: -8 }}
      >
        {number}
      </div>
      <h3 className="font-black text-stone-800 text-lg" style={{ fontFamily: "'Nunito', sans-serif" }}>
        {title}
      </h3>
      <p className="text-stone-500 text-sm leading-relaxed max-w-[200px]">{desc}</p>
    </div>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export function AxxeyLandingPage() {
  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Lato:wght@300;400;700&display=swap"
        rel="stylesheet"
      />

      <style>{`
        @keyframes modal-up {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pop-in {
          from { opacity: 0; transform: scale(0.8) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-10px); }
        }
        @keyframes hero-fade {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .axxey-cta-btn { transition: all 0.2s ease; }
        .axxey-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(234,88,12,0.35) !important; }
        .axxey-ghost-btn { transition: all 0.2s ease; }
        .axxey-ghost-btn:hover { background: #fff7ed !important; color: #ea580c !important; border-color: #fed7aa !important; }
        .axxey-feature-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .axxey-feature-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(234,88,12,0.1) !important; }
      `}</style>

      <div style={{ background: "#fffaf6", color: "#1c1917", fontFamily: "'Lato', sans-serif", minHeight: "100vh" }}>

        {/* ── Navbar ── */}
        <nav
          className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-10 py-4 transition-all duration-300"
          style={{
            background: scrolled ? "rgba(255,250,246,0.92)" : "transparent",
            backdropFilter: scrolled ? "blur(12px)" : "none",
            borderBottom: scrolled ? "1px solid rgba(234,88,12,0.08)" : "1px solid transparent",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #fb923c, #ea580c)" }}
            >
              <span className="text-white font-black text-base" style={{ fontFamily: "'Nunito', sans-serif" }}>A</span>
            </div>
            <span className="font-black text-stone-800 text-xl tracking-tight" style={{ fontFamily: "'Nunito', sans-serif" }}>
              AXXEY
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAuthMode("login")}
              className="axxey-ghost-btn text-sm font-bold text-stone-600 px-4 py-2 rounded-2xl"
              style={{ border: "2px solid #e7e0d8", background: "transparent" }}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode("register")}
              className="axxey-cta-btn text-sm font-bold text-white px-5 py-2.5 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, #fb923c, #ea580c)",
                boxShadow: "0 4px 16px rgba(234,88,12,0.25)",
              }}
            >
              Get Started
            </button>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden">
          {/* Blobs */}
          <div className="absolute pointer-events-none" style={{ width: 600, height: 600, background: "radial-gradient(circle, rgba(251,146,60,0.10) 0%, transparent 70%)", top: "10%", left: "50%", transform: "translateX(-50%)" }} />
          <div className="absolute pointer-events-none" style={{ width: 280, height: 280, background: "radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)", top: "25%", left: "8%" }} />
          <div className="absolute pointer-events-none" style={{ width: 240, height: 240, background: "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)", top: "30%", right: "6%" }} />

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold mb-8"
            style={{ background: "#fff7ed", border: "2px solid #fed7aa", color: "#ea580c", animation: "hero-fade 0.6s ease forwards", opacity: 0 }}
          >
            <span>🗽</span> Made for New York City
          </div>

          {/* Headline */}
          <h1
            className="text-5xl md:text-7xl font-black leading-none mb-6 max-w-3xl"
            style={{ fontFamily: "'Nunito', sans-serif", letterSpacing: "-0.03em", color: "#1c1917", animation: "hero-fade 0.7s ease 0.1s forwards", opacity: 0 }}
          >
            NYC, but{" "}
            <span style={{ background: "linear-gradient(135deg, #fb923c, #dc2626)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              accessible
            </span>
            <br />for everyone.
          </h1>

          <p
            className="text-lg text-stone-500 leading-relaxed mb-10 max-w-lg"
            style={{ animation: "hero-fade 0.7s ease 0.2s forwards", opacity: 0 }}
          >
            AXXEY helps you find accessible bathrooms, subway stations, and crosswalks
            near you — instantly, on the go, for free.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12" style={{ animation: "hero-fade 0.7s ease 0.3s forwards", opacity: 0 }}>
            <FeaturePill emoji="🚻" label="Accessible Bathrooms" color={{ bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d" }} delay="0.4s" />
            <FeaturePill emoji="🚇" label="Subway Stations" color={{ bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" }} delay="0.5s" />
            <FeaturePill emoji="🚶" label="Accessible Crosswalks" color={{ bg: "#fef9c3", border: "#fef08a", text: "#a16207" }} delay="0.6s" />
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3" style={{ animation: "hero-fade 0.7s ease 0.4s forwards", opacity: 0 }}>
            <button
              onClick={() => setAuthMode("register")}
              className="axxey-cta-btn px-8 py-4 rounded-2xl text-base font-black text-white"
              style={{ background: "linear-gradient(135deg, #fb923c, #ea580c)", boxShadow: "0 6px 24px rgba(234,88,12,0.3)", fontFamily: "'Nunito', sans-serif" }}
            >
              Start Exploring NYC
            </button>
            <button
              onClick={() => setAuthMode("login")}
              className="axxey-ghost-btn px-8 py-4 rounded-2xl text-base font-bold text-stone-600"
              style={{ border: "2px solid #e7e0d8", background: "#fff" }}
            >
              Already have an account
            </button>
          </div>

          {/* Map mockup */}
          <div className="mt-16" style={{ animation: "hero-fade 0.8s ease 0.6s forwards", opacity: 0 }}>
            <div
              className="rounded-3xl overflow-hidden mx-auto relative"
              style={{ width: "min(680px, 90vw)", height: 280, background: "linear-gradient(135deg, #e0f2fe, #dbeafe)", border: "3px solid #fff", boxShadow: "0 24px 80px rgba(234,88,12,0.12), 0 0 0 1px rgba(234,88,12,0.06)" }}
            >
              <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.15 }} viewBox="0 0 680 280">
                {[40, 80, 120, 160, 200, 240].map((y) => (<line key={y} x1="0" y1={y} x2="680" y2={y} stroke="#64748b" strokeWidth="8" />))}
                {[60, 130, 200, 270, 340, 410, 480, 550, 620].map((x) => (<line key={x} x1={x} y1="0" x2={x} y2="280" stroke="#64748b" strokeWidth="5" />))}
              </svg>
              <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #bfdbfe 0%, #a5f3fc 50%, #bbf7d0 100%)", opacity: 0.4 }} />

              {[
                { x: "20%", y: "35%", color: "#22c55e", emoji: "🚻", delay: "0s" },
                { x: "45%", y: "25%", color: "#3b82f6", emoji: "🚇", delay: "0.4s" },
                { x: "65%", y: "50%", color: "#22c55e", emoji: "🚻", delay: "0.8s" },
                { x: "30%", y: "65%", color: "#eab308", emoji: "🚶", delay: "1.2s" },
                { x: "75%", y: "30%", color: "#22c55e", emoji: "🚻", delay: "0.2s" },
                { x: "55%", y: "72%", color: "#3b82f6", emoji: "🚇", delay: "0.6s" },
              ].map((pin, i) => (
                <div key={i} className="absolute flex flex-col items-center"
                  style={{ left: pin.x, top: pin.y, animation: `float 3s ease-in-out infinite`, animationDelay: pin.delay, transform: "translate(-50%, -50%)" }}>
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-lg"
                    style={{ background: "#fff", border: `3px solid ${pin.color}` }}>
                    {pin.emoji}
                  </div>
                  <div className="w-2 h-2 rounded-full mt-0.5" style={{ background: pin.color }} />
                </div>
              ))}

              <div className="absolute flex items-center gap-2 bg-white rounded-2xl px-3 py-2 shadow-lg text-xs font-bold text-stone-700"
                style={{ bottom: 16, left: 16, fontFamily: "'Nunito', sans-serif", border: "2px solid #fed7aa" }}>
                📍 Your location
              </div>
              <div className="absolute bg-white rounded-2xl px-3 py-2 shadow-lg text-xs font-bold"
                style={{ top: 16, right: 16, fontFamily: "'Nunito', sans-serif", color: "#15803d", border: "2px solid #bbf7d0" }}>
                🚻 0.2 mi away
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="px-6 py-24 max-w-4xl mx-auto text-center">
          <p className="text-orange-500 text-sm font-bold uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-3xl md:text-4xl font-black text-stone-800 mb-16" style={{ fontFamily: "'Nunito', sans-serif", letterSpacing: "-0.02em" }}>
            Three steps to get moving
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <Step number="1" emoji="📍" title="Share your location" desc="Open AXXEY and let us know where you are in NYC or search any address." delay="0.1s" />
            <Step number="2" emoji="🔍" title="Choose what you need" desc="Pick bathrooms, subway stations, crosswalks, or all three at once." delay="0.25s" />
            <Step number="3" emoji="🗺️" title="Find it on the map" desc="See the nearest accessible spots, read reviews, and get there with confidence." delay="0.4s" />
          </div>
        </section>

        {/* ── Features ── */}
        <section className="px-6 py-24" style={{ background: "#fff", borderTop: "2px solid #f5ede4", borderBottom: "2px solid #f5ede4" }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-orange-500 text-sm font-bold uppercase tracking-widest mb-3">Features</p>
              <h2 className="text-3xl md:text-4xl font-black text-stone-800" style={{ fontFamily: "'Nunito', sans-serif", letterSpacing: "-0.02em" }}>
                Built for real New Yorkers
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { emoji: "🚻", title: "Accessible Bathrooms", desc: "Find public restrooms that are wheelchair-accessible, clean, and nearby. Read comfort scores and reviews before you go.", bg: "#f0fdf4", border: "#bbf7d0" },
                { emoji: "🚇", title: "Elevator-Equipped Subways", desc: "Know which subway stations have working elevators and accessible entrances. No more surprises at the turnstile.", bg: "#eff6ff", border: "#bfdbfe" },
                { emoji: "🚶", title: "Accessible Crosswalks", desc: "Find crosswalks with audible signals and curb cuts so you can navigate the city safely.", bg: "#fefce8", border: "#fef08a" },
                { emoji: "⭐", title: "Reviews & Comfort Scores", desc: "Real reviews from real New Yorkers. Each spot has a comfort score, star rating, and accessibility tags.", bg: "#fff7ed", border: "#fed7aa" },
              ].map((f, i) => (
                <div key={i} className="axxey-feature-card rounded-3xl p-7 flex gap-5"
                  style={{ background: f.bg, border: `2px solid ${f.border}`, animation: "fade-up 0.6s ease forwards", animationDelay: `${i * 0.1}s`, opacity: 0 }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: "#fff", border: `2px solid ${f.border}` }}>
                    {f.emoji}
                  </div>
                  <div>
                    <h3 className="font-black text-stone-800 text-lg mb-1.5" style={{ fontFamily: "'Nunito', sans-serif" }}>{f.title}</h3>
                    <p className="text-stone-500 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="px-6 py-24">
          <div className="max-w-3xl mx-auto rounded-3xl p-12 text-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #fb923c 0%, #ea580c 100%)", boxShadow: "0 24px 80px rgba(234,88,12,0.25)" }}>
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="relative z-10">
              <p className="text-4xl mb-4">🗽</p>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4" style={{ fontFamily: "'Nunito', sans-serif", letterSpacing: "-0.02em" }}>
                Ready to explore NYC freely?
              </h2>
              <p className="text-orange-100 mb-8 leading-relaxed max-w-md mx-auto">
                Join thousands of New Yorkers who navigate the city with confidence. Free forever.
              </p>
              <button
                onClick={() => setAuthMode("register")}
                className="px-10 py-4 rounded-2xl text-base font-black text-orange-600 bg-white"
                style={{ fontFamily: "'Nunito', sans-serif", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", transition: "all 0.2s ease" }}
              >
                Get Started for Free
              </button>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="px-6 py-8 text-center" style={{ borderTop: "2px solid #f5ede4" }}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #fb923c, #ea580c)" }}>
              <span className="text-white font-black text-xs" style={{ fontFamily: "'Nunito', sans-serif" }}>A</span>
            </div>
            <span className="font-black text-stone-700 tracking-tight" style={{ fontFamily: "'Nunito', sans-serif" }}>AXXEY</span>
          </div>
          <p className="text-stone-400 text-sm">Making New York City accessible for everyone — one block at a time.</p>
        </footer>
      </div>

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSwitch={() => setAuthMode(authMode === "login" ? "register" : "login")}
        />
      )}
    </>
  );
}
