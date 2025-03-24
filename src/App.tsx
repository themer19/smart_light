import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './pages/Login';
import Validationuser from './pages/Validationuser';
import TestPopup from './pages/Test';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/validation" element={<Validationuser />} />
          <Route path="/test" element={<TestPopup />} />

        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
