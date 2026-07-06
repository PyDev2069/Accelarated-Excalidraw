import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import WhiteboardPage from "./pages/WhiteboardPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/board" element={<WhiteboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;