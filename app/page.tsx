import { AuthLandingModal } from "../components/auth-landing-modal";
import { HomeMapClient } from "@/components/home-map-client";
import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function HomeContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <AuthLandingModal />;
  }

  return (
    <main className="relative min-h-screen w-full">
      <nav className="absolute left-0 right-0 top-0 z-20 border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="flex h-14 w-full items-center justify-between px-4 md:px-6">
          <p className="text-sm font-medium">AXXY</p>
          <LogoutButton />
        </div>
      </nav>
      <HomeMapClient />
    </main>
  );
}

function HomeFallback() {
  return <main className="min-h-screen w-full" />;
}

export default function Home() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeContent />
    </Suspense>
  );
}
