import { BrowserRouter, Routes, Route } from "react-router-dom";
import Search from "./pages/Search";
import Tree from "./pages/Tree";
import PageNotFound from "./pages/PageNotFound";
import Edit from "./pages/Edit";
import "./App.css";
import { SkillTreesContextProvider } from "./contexts/SkillTreesContext";

function App() {
  return (
    <SkillTreesContextProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<Search />} />
          <Route path="s/:startNodeId/e/:endNodeId" element={<Tree />} />
          <Route path="edit/:nodeIds" element={<Edit />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </SkillTreesContextProvider>
  );
}

export default App;
