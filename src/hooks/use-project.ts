import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";
import { useEffect, useMemo } from "react";

const useProject = () => {
  const { data: projects, isLoading } = api.project.getProjects.useQuery();
  const [projectId, setProjectId] = useLocalStorage("repomind-projectId", "");

  const matchedProject = useMemo(() => {
    return projects?.find((p) => p.id === projectId);
  }, [projects, projectId]);

  useEffect(() => {
    if (!projectId && projects?.length) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId, setProjectId]);

  return {
    projects,
    project: matchedProject,
    projectId,
    setProjectId,
    isLoading,
  };
};

export default useProject;
