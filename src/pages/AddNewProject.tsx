import { useState } from "react";
import { useDispatch } from "react-redux";
import { saveProjects } from "src/database";
import { Project } from "../model";

export default function AddNewProject() {
  const dispatch = useDispatch();
  const [projectName, setProjectName] = useState("");
  const [bullets, setBullets] = useState([""]);
  const [saving, setSaving] = useState(false);

  const handleAddBullet = () => {
    setBullets([...bullets, ""]);
  };

  const handleBulletChange = (index: number, value: string) => {
    const newBullets = [...bullets];
    newBullets[index] = value;
    setBullets(newBullets);
  };

  const handleRemoveBullet = (index: number) => {
    setBullets(bullets.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName || bullets.some((b) => !b.trim())) return;

    setSaving(true);
    const newProject: Project = {
      name: projectName.trim(),
      bullets: bullets.filter((b) => b.trim()),
    };

    try {
      await window.api.saveProjects([newProject]);
      // Reset form
      setProjectName("");
      setBullets([""]);
      alert("Project added successfully!");
    } catch (error) {
      alert("Failed to add project");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Add New Project</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Project Name</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Enter project name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Bullet Points
          </label>
          {bullets.map((bullet, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={bullet}
                onChange={(e) => handleBulletChange(index, e.target.value)}
                className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Enter bullet point"
                required
              />
              <button
                type="button"
                onClick={() => handleRemoveBullet(index)}
                className="px-3 py-2 text-red-600 hover:text-red-700"
                disabled={bullets.length === 1}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddBullet}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            + Add Bullet Point
          </button>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {saving ? "Saving..." : "Save Project"}
        </button>
      </form>
    </div>
  );
}
