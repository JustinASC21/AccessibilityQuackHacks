import { AuthLandingModal } from "../components/auth-landing-modal";
import { NycMap } from "../components/nyc-map";
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
    <main className="min-h-screen w-full">
      <NycMap />
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
