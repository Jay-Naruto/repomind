"use client"

import { ExternalLink, Trash } from "lucide-react"
import useProject from "@/hooks/use-project"
import Link from "next/link"
import CreatePage from "./create"
import Operations from "./operations"
import { Button } from "@/components/ui/button"
import { api } from "@/trpc/react"
import { useLocalStorage } from "usehooks-ts"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { project } = useProject()
  const router = useRouter()
  const [projectId, setProjectId] = useLocalStorage("repomind-projectId", "")

  const deleteProject = api.project.deleteProject.useMutation({
    onSuccess: () => {
      toast.success("Project removed")
      setProjectId("")
      router.refresh()
    },
    onError: () => toast.error("Failed to delete project"),
  })

  const handleRemove = () => {
    if (projectId) {
      deleteProject.mutate({ projectId })
    }
  }

  return (
    <main className="min-h-screen relative overflow-hidden px-4 py-16 text-white">
      {/* Enhanced Background */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 60%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
              linear-gradient(135deg, #0a0a0a 0%, #111111 25%, #1a1a1a 50%, #0f0f0f 75%, #080808 100%)
            `,
          }}
        />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Floating orbs */}
        <div
          className="absolute top-1/4 left-1/6 w-32 h-32 rounded-full opacity-20 animate-pulse"
          style={{
            background: `radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(139, 92, 246, 0.1) 70%, transparent 100%)`,
            filter: "blur(20px)",
            animationDuration: "4s",
          }}
        />

        <div
          className="absolute top-3/4 right-1/4 w-24 h-24 rounded-full opacity-15 animate-pulse"
          style={{
            background: `radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.1) 70%, transparent 100%)`,
            filter: "blur(15px)",
            animationDuration: "6s",
            animationDelay: "2s",
          }}
        />

        <div
          className="absolute top-1/2 right-1/6 w-20 h-20 rounded-full opacity-10 animate-pulse"
          style={{
            background: `radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.1) 70%, transparent 100%)`,
            filter: "blur(12px)",
            animationDuration: "5s",
            animationDelay: "1s",
          }}
        />

        {/* Subtle noise texture */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Your existing content with relative positioning */}
      <div className="relative z-10 mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-2 text-purple-400">
            <img width={40} height={40} src="/logo.png" />
            <h1 className="text-4xl font-extrabold tracking-tight text-white">RepoMind</h1>
          </div>
          <p className="text-lg text-zinc-400">AI-powered GitHub repository analysis for developers</p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-zinc-400">
            <span className="rounded-lg border border-zinc-700/50 bg-black/30 backdrop-blur-sm px-3 py-2 shadow-lg">
              📐 Architecture Analysis
            </span>
            <span className="rounded-lg border border-zinc-700/50 bg-black/30 backdrop-blur-sm px-3 py-2 shadow-lg">
              💡 Code Understanding
            </span>
            <span className="rounded-lg border border-zinc-700/50 bg-black/30 backdrop-blur-sm px-3 py-2 shadow-lg">
              📊 Commit Summaries
            </span>
          </div>
        </div>

        {/* Content */}
        {!project ? (
          <section className="text-center">
            <h2 className="mb-4 text-xl font-semibold">Analyze a GitHub Repository</h2>
            <CreatePage />
          </section>
        ) : (
          <>
            <div className="mb-6 flex flex-col items-center gap-4 md:flex-row md:justify-center">
              <div className="rounded-lg border border-zinc-700/50 bg-black/40 backdrop-blur-sm px-6 py-4 text-center text-sm font-medium shadow-lg">
                Analyzing:&nbsp;
                <Link
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-white hover:underline"
                >
                  {project.githubUrl}
                  <ExternalLink size={14} />
                </Link>
              </div>
              <Button
                onClick={handleRemove}
                variant="destructive"
                className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700"
              >
                <Trash size={16} /> Remove Project
              </Button>
            </div>
            <div className="w-full">
              <Operations />
            </div>
          </>
        )}
      </div>
    </main>
  )
}
