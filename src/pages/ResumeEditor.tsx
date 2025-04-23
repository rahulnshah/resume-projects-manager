import { AppDispatch, RootState } from "src/store";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjects } from "../store/resumeSlice";

export default function ResumePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { resumeProjects, loadingProjects } = useSelector(
    (state: RootState) => state.resume
  );

  const handleImportResume = () => {
    dispatch(fetchProjects());
  };

  return (
    <div className="p-4">
      <button
        onClick={handleImportResume}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
      >
        Import Résumé (PDF)
      </button>

      {loadingProjects && <p>Loading projects...</p>}

      {resumeProjects.length > 0 && (
        <div className="space-y-4">
          {resumeProjects.map((project, index) => (
            <div key={index} className="border rounded-lg p-3 shadow">
              <h3 className="font-semibold text-lg">{project.name}</h3>
              <ul className="list-disc list-inside">
                {project.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
