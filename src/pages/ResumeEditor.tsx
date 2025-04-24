import { AppDispatch, RootState } from "src/store";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjects } from "../store/resumeSlice";
import { Project } from "src/model";
import * as pdfjsLib from "pdfjs-dist";

// This is the key line that fixes your error
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();
export default function ResumePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { resumeProjects, loadingProjects } = useSelector(
    (state: RootState) => state.resume
  );

  const handleImportResume = async () => {
    // Open file picker
    const filePaths = await window.api.showOpenFilePicker({
      types: [
        {
          description: "PDF Files",
          accept: { "application/pdf": [".pdf"] },
        },
      ],
      multiple: false,
    });

    if (!filePaths || filePaths.length === 0) {
      console.error("No file selected");
      return;
    }

    const filePath = filePaths[0];

    // Read the file using the exposed readFile method
    const arrayBuffer = await window.api.readFile(filePath);

    // Load the PDF using PDF.js
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let extractedText = "";

    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      extractedText += pageText + "\n";
    }

    //console.log("Extracted Text:", extractedText);

    // Parse the text to extract projects
    const projects: Project[] = extractProjects(extractedText);

    // Dispatch the parsed projects to the Redux store
    dispatch(fetchProjects(projects));
  };

  const extractProjects = (text: string): Project[] => {
    const projectSectionMatch = text.match(/PROJECTS([\s\S]*?)CERTIFICATIONS/i);
    if (!projectSectionMatch) {
      console.error("No project section found in the PDF");
      return [];
    }

    const section = projectSectionMatch[1].trim();
    console.log("Project Section:\n", section);

    // Regular expression to match each project
    const projectRegex =
      /([A-Za-z0-9\s\-&]+)\s+(https?:\/\/\S+)\s+●\s+([\s\S]*?)(?=(?:[A-Za-z0-9\s\-&]+?\s+https?:\/\/\S+)|$)/g;

    const projects: Project[] = [];
    let match;

    while ((match = projectRegex.exec(section)) !== null) {
      const [_, name, url, bulletsText] = match;

      // Split the bullets by "●" and clean them up
      const bullets = bulletsText
        .split("●")
        .map((bullet) => bullet.trim())
        .filter((bullet) => bullet.length > 0);

      projects.push({
        name: name.trim(),
        bullets,
      });
    }

    console.log("Parsed Projects:", projects);
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
