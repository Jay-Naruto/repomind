"use client";
import { cn } from "@/lib/utils";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import React from "react";

const Commitlog = () => {
  const { projectId, project } = useProject();

  const { data: commits, isLoading } = api.project.getCommits.useQuery(
    projectId ? { projectId } : { projectId: "placeholder" },
    { enabled: !!projectId }
  );

  if (!projectId) {
    return <p className="text-sm text-gray-400">No project selected</p>;
  }
  
  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <ul className="space-y-6">
        {commits?.map((commit, commitIdx) => (
          <li key={commit.id} className="relative flex gap-x-4">
            <div className="absolute left-4 top-0 h-full w-px bg-gray-300"></div>

            <img
              src={commit.commitAuthorAvatar}
              alt="commit avatar"
              className="relative mt-2 size-8 flex-none rounded-full bg-gray-50"
            />

            <div className="flex-1 rounded-md  bg-[#141417] p-4 shadow ring-1 ring-inset ring-zinc-800 bg-zinc-900/60">
              <div className="flex justify-between items-center">
                <Link
                  target="_blank"
                  href={`${project?.githubUrl}/commits/${commit.commitHash}`}
                  className="text-xs text-gray-500 hover:underline"
                >
                  <span className="font-medium text-gray-500">
                    {commit.commitAuthorName}
                  </span>{" "}
                  committed <ExternalLink className="ml-1 inline size-4" />
                </Link>
              </div>
              <p className="mt-1 font-semibold">{commit.commitMessage}</p>
              <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                {commit.summary}
              </pre>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Commitlog;
