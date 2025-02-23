import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const aiSummariseCommit = async (diff: string) => {
  try {
    const response = await model.generateContent([
      `You are an expert programmer, and you are trying to summarize a git diff.

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

      Most commits will have less comments than this examples list.
      The last commit does not include the file names,
      because there were more than two relevant files in the hypothetical commit.
      Do not include parts of the example in your summary.
      It is given only as an example of appropriate comments.`,
      `Please summarize the following diff file: \n\n${diff}`,
    ]);

    return (
      response.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Failed to generate summary."
    );
  } catch (error) {
    console.error("Error summarizing commit diff:", error);
    return "Error generating summary.";
  }
};
