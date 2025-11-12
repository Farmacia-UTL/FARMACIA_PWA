// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Páginas existentes
import Login from "./Components/login/login.jsx";
import InicioAdmin from "./Components/inicios/inicioAdmin.jsx";
import InicioUser from "./Components/inicios/inicioUser.jsx";
import AgregarMedicamento from "./Components/medicamentos/AgregarMedicamento.jsx";
import InventarioMedicamentos from "./Components/medicamentos/InventarioMedicamentos.jsx";

// === Citas ===
import Citas from "./Components/citas/citas.jsx";
import AgendarCita from "./Components/citas/AgendarCita.jsx";
// Si ya creaste la página de Agenda del día, descomenta la siguiente línea:
// import AgendaDia from "./Components/citas/AgendaDia.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect raíz → /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth / Inicios */}
        <Route path="/login" element={<Login />} />
        <Route path="/inicioAdmin" element={<InicioAdmin />} />
        <Route path="/inicioUser" element={<InicioUser />} />

        {/* Medicamentos */}
        <Route path="/medicamentos/agregar" element={<AgregarMedicamento />} />
        <Route path="/medicamentos/inventario" element={<InventarioMedicamentos />} />

        {/* Citas */}
        <Route path="/citas" element={<Citas />} />
        <Route path="/citas/agendar" element={<AgendarCita />} />
        {/* Solo habilita esta ruta si tienes el archivo AgendaDia.jsx */}
        {/* <Route path="/citas/agenda" element={<AgendaDia />} /> */}

        {/* 404 */}
        <Route path="*" element={<div style={{ padding: 24 }}>Ruta no encontrada</div>} />
      </Routes>
    </BrowserRouter>
  );
}
