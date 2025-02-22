"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";
import { useForm } from "react-hook-form";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};
const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  function onSubmit() {}
  return (
    <div className="flex h-full items-center justify-center gap-12">
      <img src="/undraw_github.svg" className="h-56 w-auto" />

      <div className="">
        <div>
          <h1 className="text-2xl font-semibold">
            Link your GitHub Repository
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter url of the repository to link it to RepoMind
          </p>
        </div>
        <div className="h-2"></div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
          <Input
              {...register("projectName", { required: true })}
              placeholder="Projet Name"
              required
            />
            <div className="h-2"></div>
            <Input
              {...register("repoUrl", { required: true })}
              placeholder="GitHub URL"
              type="url"
              required
            />
            <div className="h-2"></div>
            <Input
              {...register("githubToken")}
              placeholder="GitHub Token (optional)"
            />
            <div className="h-4"></div>
            <Button type="submit">
                Create Project
            </Button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
