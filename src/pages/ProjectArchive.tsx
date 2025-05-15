import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { saveArchivedProjects, restoreProject } from "../store/resumeSlice";
import { Project } from "../model";

export default function ProjectArchive() {
  const dispatch = useDispatch<AppDispatch>();
  const { archivedProjects, savingProjects } = useSelector(
    (state: RootState) => state.resume
  );

  // State to track edited bullets for each project
  const [editedProjects, setEditedProjects] = useState<{
    [key: string]: Project;
  }>(
    archivedProjects.reduce<{ [key: string]: Project }>((acc, project) => {
      acc[project.name] = { ...project };
      return acc;
    }, {})
  );

  const handleSave = async () => {
    await dispatch(saveArchivedProjects(editedProjects));
  };

  const handleRestore = (project: Project) => {
    dispatch(restoreProject(project));
  };

  const handleBulletChange = (
    projectName: string,
    index: number,
    value: string
  ) => {
    setEditedProjects((prev) => ({
      ...prev,
      [projectName]: {
        ...prev[projectName],
        bullets: prev[projectName].bullets.map((bullet, i) =>
          i === index ? value : bullet
        ),
      },
    }));
  };

  const handleAddBullet = (projectName: string) => {
    setEditedProjects((prev) => ({
      ...prev,
      [projectName]: {
        ...prev[projectName],
        bullets: [...prev[projectName].bullets, ""],
      },
    }));
  };

  const handleRemoveBullet = (projectName: string, index: number) => {
    setEditedProjects((prev) => ({
      ...prev,
      [projectName]: {
        ...prev[projectName],
        bullets: prev[projectName].bullets.filter((_, i) => i !== index),
      },
    }));
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
          <div key={project.name} className="border rounded-lg p-3 shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{project.name}</h3>
              <button
                onClick={() => handleRestore(project)}
                className="text-sm bg-green-100 hover:bg-green-200 px-2 py-1 rounded text-green-700"
              >
                Restore
              </button>
            </div>
            <div className="space-y-2">
              {editedProjects[project.name]?.bullets.map((bullet, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) =>
                      handleBulletChange(project.name, index, e.target.value)
                    }
                    className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter bullet point"
                  />
                  <button
                    onClick={() => handleRemoveBullet(project.name, index)}
                    className="px-3 py-2 text-red-600 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => handleAddBullet(project.name)}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                + Add Bullet Point
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
