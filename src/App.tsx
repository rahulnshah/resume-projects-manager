import { Routes, Route } from "react-router-dom";
import ResumeEditor from "./pages/ResumeEditor";
import ProjectArchive from "./pages/ProjectArchive";
import AddNewProject from "./pages/AddNewProject";
import TabNav from "./components/TabNav";

function App() {
  return (
    <div>
      <TabNav />
      <Routes>
        <Route path="/" element={<ResumeEditor />} />
        <Route path="/archive" element={<ProjectArchive />} />
        <Route path="/add" element={<AddNewProject />} />
      </Routes>
    </div>
  );
}

export default App;
