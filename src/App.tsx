import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css'; 
import 'primeicons/primeicons.css'
import Login from './pages/Login';
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
import EnergyDashboard from "./pages/EnergyDashboard";
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/validation" element={<Validationuser />} />
          <Route path="/test" element={<TestPopup />} />
          <Route path="/MotpasseM/:token" element={<MotpasseM />} />
          <Route path="/Sites" element={<Sites />} />
          <Route path="/Lignes" element={<Lignes />} />
          <Route path="/Poteaux" element={<Poteaux />} />
          <Route path="/Eclairage" element={<Eclairage />} />
          <Route path="/Licences" element={<Licences />} />
          <Route path="/Utilisateurs" element={<Utilisateurs />} />
          <Route path="/Statistics" element={<Statistics />} />
          <Route path="/Maps" element={<Maps />} />
          <Route path="/Accueil" element={<Accueil />} />
                    <Route path="/EnergyDashboard" element={<EnergyDashboard />} />


        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
