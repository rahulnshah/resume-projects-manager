import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "src/store";
import {
  fetchProjects,
  fetchNonResumeProjects,
  archiveProject,
  swapProject,
  setSourcePdfPath, // Import the action
} from "../store/resumeSlice";
import ProjectSwapModal from "../components/ProjectSwapModal";
import { Project } from "src/model";
import * as pdfjsLib from "pdfjs-dist";

// Set worker path for PDF.js (this is correct for renderer process)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();
export default function ResumePage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    resumeProjects,
    nonResumeProjects,
    loadingProjects,
    sourcePdfPath, // Get from Redux instead of local state
  } = useSelector((state: RootState) => state.resume);

  const { darkMode } = useSelector((state: RootState) => state.theme);

  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  // Remove sourcePdfPath useState

  const handleReplaceClick = async (project: Project) => {
    // Fetch non-resume projects when opening modal
    await dispatch(fetchNonResumeProjects(resumeProjects.map((p) => p.name)));
    setSelectedProject(project);
    setSwapModalOpen(true);
  };

  const handleSwapProject = (oldProject: Project, newProject: Project) => {
    dispatch(swapProject({ oldProject, newProject }));
    setSwapModalOpen(false);
    setSelectedProject(null);
  };

  const handleArchiveProject = (project: Project) => {
    dispatch(archiveProject(project));
  };

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
    dispatch(setSourcePdfPath(filePaths[0])); // Use Redux action instead
  };

  const extractProjects = (text: string): Project[] => {
    const projectSectionMatch = text.match(/PROJECTS([\s\S]*?)CERTIFICATIONS/i);
    if (!projectSectionMatch) {
      console.error("No project section found in the PDF");
      return [];
    }

    const section = projectSectionMatch[1].trim();
    //console.log("Project Section:\n", section);

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

    //console.log("Parsed Projects:", projects);
    return projects;
  };

  const handleExportResume = async () => {
    if (!sourcePdfPath) {
      alert("Please import a résumé first");
      return;
    }

    try {
      const outputPath = await window.api.selectSaveLocation();
      if (!outputPath) return;

      // First get the original PDF text content
      const arrayBuffer = await window.api.readFile(sourcePdfPath);
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let pdfText = "";

      // Extract text from all pages with proper line breaks
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Group items by their y-position to maintain line structure
        const lineMap = new Map();
        textContent.items.forEach((item: any) => {
          const y = Math.round(item.transform[5]); // y-position
          if (!lineMap.has(y)) {
            lineMap.set(y, []);
          }
          lineMap.get(y).push(item.str);
        });

        // Sort by y-position (top to bottom) and join lines
        const sortedLines = Array.from(lineMap.entries())
          .sort((a, b) => b[0] - a[0])
          .map(([_, line]) => line.join(" "));

        const trimmedLines = sortedLines.map((line) => line.trim());
        pdfText += trimmedLines.join("\n");

        console.log("trimmed", trimmedLines);
      }

      // Create new projects section content with proper formatting
      const newProjectsSection = resumeProjects
        .map((project) => {
          const bullets = project.bullets
            .map((bullet) => `    -  ${bullet}`)
            .join("\n");
          return `${project.name}\n${bullets}`;
        })
        .join("\n");

      // Replace old projects section with new one, preserving formatting
      const modifiedText = pdfText
        .replace(
          /PROJECTS([\s\S]*?)(?=CERTIFICATIONS|$)/i,
          `PROJECTS\n${newProjectsSection}\n`
        )
        .replace(/●/g, "-");

      // Send modified content to main process for PDF creation
      const success = await window.api.savePdf({
        sourcePath: sourcePdfPath,
        outputPath,
        fullText: modifiedText,
      });

      if (success) {
        alert("Résumé exported successfully!");
      } else {
        alert("Failed to export résumé");
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export résumé");
    }
  };

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleImportResume}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Import Résumé (PDF)
        </button>
        <div className="relative">
          <button
            onClick={handleExportResume}
            disabled={!sourcePdfPath || resumeProjects.length < 3}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
            title={
              !sourcePdfPath
                ? "Please import a résumé first"
                : resumeProjects.length < 3
                ? "At least 3 projects required"
                : ""
            }
          >
            Export Résumé
          </button>
        </div>
      </div>

      {loadingProjects && <p>Loading projects...</p>}

      {resumeProjects.length > 0 && (
        <div className="space-y-4">
          {resumeProjects.map((project, index) => (
            <div key={index} className="border rounded-lg p-3 shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{project.name}</h3>
                <div className="flex gap-2">
                  <button
                    id={`replace-button-${index}`}
                    onClick={() => handleReplaceClick(project)}
                    className={`${
                      darkMode ? "bg-black text-white" : "bg-white text-black"
                    } text-sm px-2 py-1 border border-blue-600 rounded`}
                  >
                    Replace
                  </button>
                  <button
                    onClick={() => handleArchiveProject(project)}
                    className="text-sm text-red-600 hover:text-red-700 px-2 py-1 rounded"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <ul className="list-disc list-inside">
                {project.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <ProjectSwapModal
        isOpen={swapModalOpen}
        onClose={() => {
          setSwapModalOpen(false);
          setSelectedProject(null);
        }}
        onSwap={handleSwapProject}
        currentProject={selectedProject}
        availableProjects={nonResumeProjects}
      />
    </div>
  );
}
