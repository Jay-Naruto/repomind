"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Commitlog from "../dashboard/commit-log";
import QuestionCard from "../dashboard/question-card";
import { useLocalStorage } from "usehooks-ts";
import { useIsClient } from "@/hooks/use-is-client";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const [projectId, setProjectId] = useLocalStorage("repomind-projectId", "");
  const refetch = useRefetch();
  const isClient = useIsClient();

  const createProject = api.project.createProject.useMutation({
    onSuccess: (project) => {
      toast.success("Project created successfully");
      setProjectId(project.id);
      refetch();
      reset();
    },
    onError: () => {
      toast.error("Failed to create project");
    },
  });

  function onSubmit(data: FormInput) {
    createProject.mutate({
      githubUrl: data.repoUrl,
      name: data.projectName,
      githubToken: data.githubToken || "",
    });
    return true;
  }

  return (
    <>
      {createProject.isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-white border-opacity-70"></div>
        </div>
      )}

      <div className="flex w-full flex-col items-center justify-center space-y-12 py-3 text-white">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-full max-w-md flex-col gap-4"
        >
          <Input
            {...register("projectName", { required: true })}
            placeholder="Project Name"
            required
            className="border border-[#2c2c2c] bg-[#1a1a1a] px-4 py-3 text-white placeholder-[#6b6b6b]"
          />
          <Input
            {...register("repoUrl", { required: true })}
            placeholder="GitHub URL"
            type="url"
            required
            className="border border-[#2c2c2c] bg-[#1a1a1a] px-4 py-3 text-white placeholder-[#6b6b6b]"
          />
          <Input
            {...register("githubToken")}
            placeholder="GitHub Token (optional)"
            className="border border-[#2c2c2c] bg-[#1a1a1a] px-4 py-3 text-white placeholder-[#6b6b6b]"
          />
          <Button
            type="submit"
            disabled={createProject.isPending}
            className="w-full bg-[#7c3aed] py-3 font-medium tracking-wide text-white hover:bg-[#6d28d9]"
          >
            Create Project
          </Button>
        </form>
      </div>
    </>
  );
};

export default CreatePage;
