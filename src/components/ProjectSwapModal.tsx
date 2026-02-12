import { Project } from "../model";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { appendResumeProject, swapProject } from "../store/resumeSlice";

interface ProjectSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProject: Project | null;
  availableProjects: Project[];
}

export default function ProjectSwapModal({
  isOpen,
  onClose,
  currentProject,
  availableProjects,
}: ProjectSwapModalProps) {
  const dispatch = useDispatch<AppDispatch>();

  // Get archived projects from Redux store
  const archivedProjects = useSelector(
    (state: RootState) => state.resume.archivedProjects,
  );

  const resumeProjects = useSelector(
    (state: RootState) => state.resume.resumeProjects,
  );

  const { darkMode } = useSelector((state: RootState) => state.theme);

  if (!isOpen || !currentProject) return null;

  const archivedProjectNames = new Set(archivedProjects.map((p) => p.name));

  const handleAddProject = (project: Project) => {
    dispatch(appendResumeProject(project));
    onClose();
  };

  const handleSwap = (oldProject: Project, newProject: Project) => {
    dispatch(swapProject({ oldProject, newProject }));
    onClose();
  };
  return (
    <div
      className={`fixed inset-y-0 right-0 w-80 ${
        darkMode ? "bg-black" : "bg-white"
      } shadow-lg p-4 border-l`}
    >
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
          availableProjects.map((project, index) => (
            <div
              key={project.id}
              className={`w-full p-2 border rounded ${
                archivedProjectNames.has(project.name) ? "opacity-50" : ""
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
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
              </div>

              <div className="flex gap-2">
                {resumeProjects.length < 3 && (
                  <button
                    id={`add-button-${index}`}
                    onClick={() => handleAddProject(project)}
                    disabled={archivedProjectNames.has(project.name)}
                    className={`text-sm px-2 py-1 border border-green-600 rounded ${
                      archivedProjectNames.has(project.name)
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-blue-600 hover:text-white"
                    }`}
                  >
                    Add
                  </button>
                )}
                <button
                  id={`swap-button-${index}`}
                  onClick={() => handleSwap(currentProject, project)}
                  disabled={archivedProjectNames.has(project.name)}
                  className={`text-sm px-2 py-1 border border-green-600 rounded ${
                    archivedProjectNames.has(project.name)
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-green-600 hover:text-white"
                  }`}
                >
                  Swap
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
