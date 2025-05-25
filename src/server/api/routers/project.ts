import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { pollCommits } from "@/lib/github";
import { indexGithubRepo } from "@/lib/github-loader";
import { TRPCError } from "@trpc/server";
import { Octokit } from "octokit";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});
const IGNORED = [
  "node_modules",
  ".next",
  "dist",
  "build",
  ".git",
  ".github",
  "coverage",
  "public",
  ".env",
  ".DS_Store",
  "README.md",
  "LICENSE",
  "package-lock.json",
  "yarn.lock",
];

const CODE_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".py",
  ".java",
  ".go",
  ".cpp",
  ".cs",
  ".rb",
];

function isIgnored(path: string) {
  return IGNORED.some((ignored) => path.includes(ignored));
}

function isCodeFile(name: string) {
  return CODE_EXTENSIONS.some((ext) => name.endsWith(ext));
}
export const projectRouter = createTRPCRouter({
  createProject: publicProcedure
    .input(
      z.object({
        name: z.string(),
        githubUrl: z.string(),
        githubToken: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log("📦 Creating project with input:", input);

      try {
        const project = await ctx.db.project.create({
          data: {
            githubUrl: input.githubUrl,
            name: input.name,
          },
        });

        await indexGithubRepo(project.id, input.githubUrl, input.githubToken);
        await pollCommits(project.id);

        return project;
      } catch (error) {
        console.error("❌ Error creating project:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create project. Please try again.",
          cause: error,
        });
      }
    }),

  getProjects: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.project.findMany({
      where: {
        deletedAt: null,
      },
    });
  }),

  getCommits: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      console.log("🔍 Fetching commits for project:", input.projectId);
      const commits = await ctx.db.commit.findMany({
        where: { projectId: input.projectId },
      });
      console.log("✅ Found commits:", commits.length);
      return commits;
    }),

  saveAnswer: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
        question: z.string(),
        answer: z.string(),
        fileReferences: z.any(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.question.create({
        data: {
          answer: input.answer,
          fileReferences: input.fileReferences,
          projectId: input.projectId,
          question: input.question,
        },
      });
    }),

  getQuestions: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.question.findMany({
        where: {
          projectId: input.projectId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  getFileTree: publicProcedure
    .input(
      z.object({
        githubUrl: z.string(),
        githubToken: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const [owner, repo] = input.githubUrl.split("/").slice(-2);
      const octokit = new Octokit({
        auth: input.githubToken || process.env.GITHUB_TOKEN,
      });

      const repoData = await octokit.rest.repos.get({ owner, repo });
      const branch = repoData.data.default_branch;

      const branchData = await octokit.rest.repos.getBranch({
        owner,
        repo,
        branch,
      });
      const sha = branchData.data.commit.sha;

      const treeData = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: sha,
        recursive: "true",
      });

      const root: any = { name: repo, children: [] };

      for (const item of treeData.data.tree) {
        if (isIgnored(item.path)) continue;
        if (item.type === "blob" && !isCodeFile(item.path)) continue;

        const parts = item.path.split("/");
        let current = root;

        for (const part of parts) {
          let existing = current.children.find(
            (child: any) => child.name === part,
          );
          if (!existing) {
            existing = { name: part, children: [] };
            current.children.push(existing);
          }
          current = existing;
        }
      }

      return root;
    }),

  deleteProject: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { projectId } = input;

      await ctx.db.sourceCodeEmbedding.deleteMany({ where: { projectId } });
      await ctx.db.question.deleteMany({ where: { projectId } });
      await ctx.db.commit.deleteMany({ where: { projectId } });

      return await ctx.db.project.delete({ where: { id: projectId } });
    }),
});
