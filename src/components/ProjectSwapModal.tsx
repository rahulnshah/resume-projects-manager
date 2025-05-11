import { Project } from "../model";

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
  if (!isOpen || !currentProject) return null;
  console.log("aviableProjects", availableProjects);
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
            <button
              key={project.id}
              onClick={() => onSwap(currentProject, project)}
              className="w-full p-2 text-left border rounded hover:bg-gray-50"
            >
              <div className="font-medium">{project.name}</div>
              <div className="text-sm text-gray-500">
                {project.bullets.length} bullet points
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
