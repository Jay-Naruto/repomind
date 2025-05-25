"use server";
import { generateEmbedding } from "@/lib/gemini";
import { db } from "@/server/db";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createStreamableValue } from "ai/rsc";
import { streamText } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue();

  try {

    const queryvector = await generateEmbedding(question);
    const vectorQuery = `[${queryvector.join(",")}]`;

    const result = (await db.$queryRaw`
      SELECT "fileName", "sourceCode", "summary",
        1 - ("summaryEmbedding" <=> ${vectorQuery}::vector(1536)) AS similarity
      FROM "SourceCodeEmbedding"
      WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector(1536)) > 0.5
      AND "projectId" = ${projectId}
      ORDER BY similarity DESC
      LIMIT 8
    `) as { fileName: string; sourceCode: string; summary: string }[];

    let context = "";
    for (const doc of result) {
      const truncatedCode =
        doc.sourceCode.length > 1500
          ? doc.sourceCode.substring(0, 1500) + "... [truncated]"
          : doc.sourceCode;

      context += `File: ${doc.fileName}\n`;
      context += `Summary: ${doc.summary}\n`;
      context += `Code: ${truncatedCode}\n\n`;
    }


    (async () => {
      try {

        const { textStream } = await streamText({
          model: google("gemini-1.5-flash"),
          prompt: `You are a helpful code assistant. Answer this question about the codebase:

                    Question: ${question}

                    Relevant Code Files:
                    ${context}

                    Please provide a helpful answer based on the code provided. If you can't answer based on the context, just say so.`,
        });

        let deltaCount = 0;

        for await (const delta of textStream) {
          deltaCount++;
          console.log(`Gemini delta #${deltaCount}:`, delta);
          stream.update(delta);
        }

        stream.done();
      } catch (streamError) {
        stream.update(
          "I encountered an error while processing your request. Please try again.",
        );
        stream.done();
      }
    })().catch((error) => {
      stream.update("An unexpected error occurred: " + error.message);
      stream.done();
    });

    return {
      output: stream.value,
      fileReferences: result,
    };
  } catch (error) {
    stream.update("Failed to process your question: " + error.message);
    stream.done();

    return {
      output: stream.value,
      fileReferences: [],
    };
  }
}
