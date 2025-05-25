import React from "react";
import Commitlog from "./commit-log";
import QuestionCard from "./question-card";
import FileTree from "./file-tree";

function Operations() {
  return (
    <div className="w-full px-4 py-12">
      <div className="max-w-9xl mx-auto flex flex-wrap justify-center gap-10">
        <div className="w-full flex-1 rounded-xl border border-zinc-800 bg-black p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-semibold text-white">
            📝 Commit Summaries
          </h2>
          <div className="max-h-[800px] overflow-y-auto pr-2">
            <Commitlog />
          </div>
        </div>

        <div className="w-full flex-1 space-y-6">
          <div className="rounded-xl border border-zinc-700 bg-black p-6 shadow-md">
            <h2 className="mb-4 text-2xl font-semibold text-white">
              💬 Ask a Question
            </h2>
            <QuestionCard />
          </div>

          {/* <div className="rounded-xl border border-zinc-700 bg-black p-6 shadow-md">
            <h2 className="mb-4 text-2xl font-semibold text-white">
              📁 File Tree
            </h2>
            <FileTree />
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default Operations;
