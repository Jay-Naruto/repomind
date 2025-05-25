"use client";
import React, { useEffect, useRef, useState } from "react";
import Tree from "react-d3-tree";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import "../../styles/custom-tree.css";

function FileTree() {
  const { project } = useProject();
  const treeContainer = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });

  const { data: fileTree, isLoading } = api.project.getFileTree.useQuery(
    project?.githubUrl ? { githubUrl: project.githubUrl } : { githubUrl: "" },
    { enabled: !!project?.githubUrl },
  );

  useEffect(() => {
    if (treeContainer.current) {
      setDimensions({
        width: treeContainer.current.offsetWidth,
        height: 500,
      });
    }
  }, [treeContainer.current]);

  if (isLoading) return <p className="text-white">Loading file tree...</p>;
  if (!fileTree) return null;

  return (
    <div
      ref={treeContainer}
      className="h-[500px] w-full flex-1 rounded-xl border border-zinc-800 bg-[#d2d2d2] p-6 shadow-md"
    >
      <Tree
        data={fileTree}
        orientation="horizontal"
        translate={{ x: dimensions.width / 2, y: 50 }}
        collapsible={true}
        pathFunc="diagonal"
        nodeSize={{ x: 250, y: 150 }}
        separation={{ siblings: 1.5, nonSiblings: 2 }}
        renderCustomNodeElement={({ nodeDatum }) => (
            <g>
              <text
                textAnchor="middle"
                x={0}
                y={-20}
                style={{
                  fontSize: "14px",
                  fill: "white",
                  fontWeight: 400,
                }}
              >
                {nodeDatum.name}
              </text>
              <circle r={10} fill="white" />
            </g>
          )}
          
      />
    </div>
  );
}

export default FileTree;
