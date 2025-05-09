import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { saveArchivedProjects } from "../store/resumeSlice";

export default function ProjectArchive() {
  const dispatch = useDispatch<AppDispatch>();
  const { archivedProjects, savingProjects } = useSelector(
    (state: RootState) => state.resume
  );

  const handleSave = async () => {
    await dispatch(saveArchivedProjects());
  };

  if (archivedProjects.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No archived projects yet
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Archived Projects</h2>
        <button
          onClick={handleSave}
          disabled={savingProjects || archivedProjects.length === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {savingProjects ? "Saving..." : "Save to Database"}
        </button>
      </div>

      <div className="space-y-4">
        {archivedProjects.map((project) => (
          <div key={project.id} className="border rounded-lg p-3 shadow">
            <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
            <ul className="list-disc list-inside">
              {project.bullets.map((bullet, idx) => (
                <li key={idx} className="text-gray-600">
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
