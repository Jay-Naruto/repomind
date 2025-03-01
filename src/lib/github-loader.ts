import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { generateEmbedding, summariseCode } from "./gemini";
import { db } from "@/server/db";

export const loadGithubRepo = async (
  githubUrl: string,
  githubToken?: string,
) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || "",
    branch: "main",
    ignoreFiles: [
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "bun.lockb",
    ],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
  });
  const docs = await loader.load();
  return docs;
};

export const indexGithubRepo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string,
) => {
  const docs = await loadGithubRepo(githubUrl, githubToken);
  const allEmbeddings = await generateEmbeddings(docs);

  await Promise.allSettled(
    allEmbeddings.map(async (embedding, index) => {
      if (!embedding) return;
      const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
        data: {
          summary: embedding.summary,
          sourceCode: embedding.sourceCode,
          fileName: embedding.fileName,
          projectId,
        },
      });

      
      const fixedEmbedding = embedding.embedding.slice(0, 1536);

      const vector = `[${fixedEmbedding.join(",")}]`;

      await db.$executeRaw`
        UPDATE "SourceCodeEmbedding"
        SET "summaryEmbedding" = ${vector}::vector(1536)
        WHERE "id" = ${sourceCodeEmbedding.id}
      `;
      // await db.$executeRaw`UPDATE "SourceCodeEmbedding"
      //    SET "summaryEmbedding" = $1::vector
      //    WHERE "id" = $2`,
      //   embedding.embedding,
      //   sourceCodeEmbedding.id;

      // await db.$executeRaw`
      // UPDATE "SourceCodeEmbedding"
      // SET "summaryEmbedding" = CAST(${JSON.stringify(embedding)} AS vector)
      // WHERE "id" = ${sourceCodeEmbedding.id}
      // `;

      // await db.sourceCodeEmbedding.update({
      //   where: { id: sourceCodeEmbedding.id },
      //   data: { summaryEmbedding: embedding },
      // });
    }),
  );
};

const BATCH_SIZE = 5;

export const generateEmbeddings = async (docs: Document[]) => {
  const batchedEmbeddings = [];

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);

    const batchEmbeddings = await Promise.all(
      batch.map(async (doc) => {
        const summary = await summariseCode(doc);
        if (!summary) {
          console.error("Failed to generate summary for:", doc.metadata.source);
          return null;
        }

        const embedding = await generateEmbedding(summary);
        return {
          summary,
          embedding,
          sourceCode: JSON.parse(JSON.stringify(doc?.pageContent)),
          fileName: doc?.metadata?.source,
        };
      }),
    );

    // Add the batch of embeddings to the final array
    batchedEmbeddings.push(
      ...batchEmbeddings.filter((embedding) => embedding !== null),
    );
  }

  return batchedEmbeddings;
};
