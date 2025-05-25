import { OpenAI } from "openai";
import { Document } from "@langchain/core/documents";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_BATCH_CHARACTERS = 40000; 

const createBatches = (diffChunks: string[]) => {
  let batches: string[] = [];
  let currentBatch: string[] = [];
  let currentCharCount = 0;

  diffChunks.forEach((chunk) => {
    const chunkCharCount = chunk.length;

    if (currentCharCount + chunkCharCount > MAX_BATCH_CHARACTERS) {
      batches.push(currentBatch.join("\n"));
      currentBatch = [chunk];
      currentCharCount = chunkCharCount;
    } else {
      currentBatch.push(chunk);
      currentCharCount += chunkCharCount;
    }
  });

  if (currentBatch.length > 0) {
    batches.push(currentBatch.join("\n"));
  }

  return batches;
};

const CHUNK_SIZE = 1500;
let RATE_LIMIT_DELAY = 1000;

export const splitDiff = (diff: string) => {
  const lines = diff.split("\n");
  let chunks: string[] = [];
  let currentChunk: string[] = [];

  lines.forEach((line) => {
    currentChunk.push(line);
    if (currentChunk.join("\n").length > CHUNK_SIZE) {
      chunks.push(currentChunk.join("\n"));
      currentChunk = [line];
    }
  });

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join("\n"));
  }

  return chunks;
};

export const aiSummariseCommit = async (diff: string) => {
  const diffChunks = splitDiff(diff);
  const batches = createBatches(diffChunks);
  const batchedSummaries: string[] = [];

  console.log(`Total Batches: ${batches.length}`);

  for (let i = 0; i < batches.length; i++) {
    console.log(`🚀 Processing batch ${i + 1}...`);

    try {
      const summary = await summarizeBatch(batches[i]);
      batchedSummaries.push(summary);
    } catch (error) {
      console.error("Error summarizing batch:", error);
      batchedSummaries.push("Error generating batch summary.");
    }

    console.log(`⏳ Waiting ${RATE_LIMIT_DELAY}ms before next batch...`);
    await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY));
  }

  return await finalizeCommitSummary(batchedSummaries.join("\n"));
};

const summarizeBatch = async (batch: string) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `Summarize the following git diff changes in a concise manner, highlighting the most important modifications.`,
      },
      {
        role: "user",
        content: `Diff Batch:\n\n${batch}`,
      },
    ],
    max_tokens: 250,
  });

  return (
    response.choices[0]?.message?.content || "Failed to generate batch summary."
  );
};

const finalizeCommitSummary = async (fullSummary: string) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `Summarize the following commit changes in bullet points (maximum 10). Each bullet point should be clear and concise, focusing only on key changes.`,
      },
      {
        role: "user",
        content: `Full Summary:\n\n${fullSummary}`,
      },
    ],
    max_tokens: 200,
  });

  return (
    response.choices[0]?.message?.content || "Failed to generate final summary."
  );
};

const MAX_RETRIES = 5;
const RETRY_DELAY = 2000;

export async function summariseCode(doc: Document[]) {
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      const code = doc?.pageContent?.slice(0, 10000);
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an intelligent senior software engineer who specializes in onboarding junior software engineers onto projects.`,
          },
          {
            role: "user",
            content: `You are onboarding a junior software engineer and explaining to them the purpose of the ${doc?.metadata?.source} file.
            Here is the code:
            ---
            ${code}
            ---
            Give a summary no more than 100 words of the code above.`,
          },
        ],
        max_tokens: 200,
      });

      return (
        response.choices[0]?.message?.content || "Failed to generate summary."
      );
    } catch (error: any) {
      attempts++;
      if (error.status === 429 && attempts < MAX_RETRIES) {
        console.log(`Rate limit exceeded. Retrying... Attempt #${attempts}`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      } else {
        console.error("Error summarizing code:", error);
        throw error;
      }
    }
  }

  return "";
}

export async function generateEmbedding(summary: string) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: summary,
    });

    return response?.data[0]?.embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}
