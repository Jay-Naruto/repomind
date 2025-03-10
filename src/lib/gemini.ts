import { OpenAI } from "openai";
import { Document } from "@langchain/core/documents";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure this is set in your environment
});

export const aiSummariseCommit = async (diff: string) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert programmer, and you are trying to summarize a git diff.

          Reminders about the diff format:

          For every file, there are a few metadata lines, like (for example):
          '''
          diff --git a/index.js b/index.js
          index a0df691..befe003 100644
          --- a/index.js
          +++ b/index.js
          '''
          This means that \`lib/index.js\` was modified in this commit. Note that this is only an example.
          Then there is a specifier of the lines that were modified.
          A line starting with \`+\` means it was added.
          A line starting with \`-\` means that line was deleted.
          A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding.
          It is not part of the diff.
          [...]

          EXAMPLE SUMMARY COMMENTS:
          '''
          * Raised the amount of returned recordings from \`10\` to \`100\` [packages/server/recordings_api.ts], [packages/server/constants.ts]
          * Fixed a typo in the action name [.github/workflows/gpt-commit-summarizer.yml]
          * Moved the \`octokit\` initialization to a separate file [src/octokit.ts], [src/index.ts]
          * Added an OpenAI API for completions [packages/utils/apis/openai.ts]
          * Lowered numeric tolerance for test files
          '''

          Most commits will have fewer comments than this example list.
          The last commit does not include the file names,
          because there were more than two relevant files in the hypothetical commit.
          Do not include parts of the example in your summary.
          It is given only as an example of appropriate comments.`,
        },
        {
          role: "user",
          content: `Please summarize the following diff file:\n\n${diff}`,
        },
      ],
      max_tokens: 200,
    });
    return response.choices[0]?.message?.content || "Failed to generate summary.";
  } catch (error) {
    console.error("Error summarizing commit diff:", error);
    return "Error generating summary.";
  }
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

      return response.choices[0]?.message?.content || "Failed to generate summary.";
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
