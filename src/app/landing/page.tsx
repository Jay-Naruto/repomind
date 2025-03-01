import { Button } from "@/components/ui/button";
import Hero from "@/components/hero"
import { SparklesCore } from "@/components/sparkles"

export default async function Home() {
  return (
    <main className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
    <div className="h-full w-full absolute inset-0 z-0">
      <SparklesCore
        id="tsparticlesfullpage"
        background="transparent"
        minSize={0.6}
        maxSize={1.4}
        particleDensity={100}
        className="w-full h-full"
        particleColor="#FFFFFF"
      />
    </div>

    <div className="relative z-10">
      <Hero />
    </div>
  </main>
  );
}
