import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css'; 
import 'primeicons/primeicons.css';
import Validationuser from './pages/Validationuser';
import TestPopup from './pages/Test';
import MotpasseM from "./pages/MotpasseM";
import Sites from "./pages/Sites";
import Lignes from "./pages/Lignes";
import Poteaux from "./pages/Poteaux";
import Eclairage from "./pages/Eclairage";
import Licences from "./pages/Licences";
import Utilisateurs from "./pages/Utilisateurs";
import Statistics from "./pages/Statistics";
import Maps from "./pages/Maps";
import Accueil from "./pages/Accueil";
import Cr_compte from "./pages/Cr_compte";
import ProtectedRoute from "./components/ProtectedRoute";
import WeatherAdvisor from "./components/WeatherAdvisor";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <BrowserRouter>
        <ToastContainer position="top-center" autoClose={5000} />
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Cr_compte />} />
          <Route path="/validation" element={<Validationuser />} />
          <Route path="/test" element={<TestPopup />} />
          <Route path="/MotpasseM/:token" element={<MotpasseM />} />
          
          {/* Routes protégées */}
          <Route element={<ProtectedRoute />}>
            <Route path="/Accueil" element={<Accueil />} />
            <Route path="/Sites" element={<Sites />} />
            <Route path="/Lignes" element={<Lignes />} />
            <Route path="/Poteaux" element={<Poteaux />} />
            <Route path="/Eclairage" element={<Eclairage />} />
            <Route path="/Licences" element={<Licences />} />
            <Route path="/Utilisateurs" element={<Utilisateurs />} />
            <Route path="/Statistics" element={<Statistics />} />
            <Route path="/Maps" element={<Maps />} />
            <Route path="/WeatherAdvisor" element={<WeatherAdvisor />} />

          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
