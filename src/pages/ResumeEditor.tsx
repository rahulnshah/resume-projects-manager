import { AppDispatch, RootState } from "src/store";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjects } from "../store/resumeSlice";
import { PDFDocument } from "pdf-lib";

export default function ResumePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { resumeProjects, loadingProjects } = useSelector(
    (state: RootState) => state.resume
  );

  const handleImportResume = async () => {
    // Open file picker
    const [fileHandle] = await window.api.showOpenFilePicker({
      types: [
        {
          description: "PDF Files",
          accept: { "application/pdf": [".pdf"] },
        },
      ],
      multiple: false,
    });

    // Read the selected file
    const file = await fileHandle.getFile();
    const arrayBuffer = await file.arrayBuffer();

    // Parse the PDF
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    let extractedText = "";

    // Extract text from all pages
    for (const page of pages) {
      extractedText += page.getTextContent();
    }

    // Parse the text to extract projects
    const projects = parseProjectsFromText(extractedText);

    // Dispatch the parsed projects to the Redux store
    dispatch(fetchProjects.fulfilled(projects));
  };

  const parseProjectsFromText = (text: string) => {
    const lines = text.split("\n");
    const projects = [];
    let currentProject: { name: string; bullets: string[] } | null = null;

    for (const line of lines) {
      if (line.trim().length === 0) continue; // Skip empty lines

      if (!line.startsWith("-")) {
        // Assume it's a project name
        if (currentProject) {
          projects.push(currentProject);
        }
        currentProject = { name: line.trim(), bullets: [] };
      } else if (currentProject) {
        // Assume it's a bullet point
        currentProject.bullets.push(line.replace("-", "").trim());
      }
    }

    // Add the last project
    if (currentProject) {
      projects.push(currentProject);
    }

    return projects;
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
