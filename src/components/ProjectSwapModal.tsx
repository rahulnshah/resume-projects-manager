import { Project } from "../model";
import { useSelector } from "react-redux";
import { RootState } from "../store";

interface ProjectSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwap: (oldProject: Project, newProject: Project) => void;
  currentProject: Project | null;
  availableProjects: Project[];
}

export default function ProjectSwapModal({
  isOpen,
  onClose,
  onSwap,
  currentProject,
  availableProjects,
}: ProjectSwapModalProps) {
  // Get archived projects from Redux store
  const archivedProjects = useSelector(
    (state: RootState) => state.resume.archivedProjects
  );

  if (!isOpen || !currentProject) return null;
  // Create a map of archived project names for quick lookup
  const archivedProjectNames = new Set(archivedProjects.map((p) => p.name));

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-lg p-4 border-l">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">Replace Project</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <p className="mb-4 text-sm text-gray-600">
        Replace "{currentProject.name}" with:
      </p>

      <div className="space-y-2">
        {availableProjects.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-gray-400 text-center">
            No other projects available to swap
          </div>
        ) : (
          availableProjects.map((project) => (
            <div
              key={project.id}
              className={`w-full p-2 border rounded ${
                archivedProjectNames.has(project.name)
                  ? "bg-gray-100 cursor-not-allowed"
                  : "hover:bg-gray-50 cursor-pointer"
              }`}
              onClick={() => {
                if (!archivedProjectNames.has(project.name)) {
                  onSwap(currentProject, project);
                }
              }}
            >
              <div className="flex justify-between items-center">
                <div className="font-medium">{project.name}</div>
                {archivedProjectNames.has(project.name) && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    Archived
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {project.bullets.length} bullet points
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
