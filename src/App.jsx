import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import WhiteboardPage from "./pages/WhiteboardPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/board/:boardId" element={<WhiteboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;