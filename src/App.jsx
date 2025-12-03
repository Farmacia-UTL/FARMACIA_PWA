import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Páginas existentes
import Login from "./Components/login/login.jsx";
import InicioAdmin from "./Components/inicios/inicioAdmin.jsx";
import InicioUser from "./Components/inicios/inicioUser.jsx";
import AgregarMedicamento from "./Components/medicamentos/AgregarMedicamento.jsx";
import InventarioMedicamentos from "./Components/medicamentos/InventarioMedicamentos.jsx";

// 🟢 OJO: ajusta estas rutas según tu carpeta real
// Ejemplo si los pusiste en src/Components/proveedores:
import CrearProveedor from "./Components/proveedores/CrearProveedor.jsx";
import PedirMedicamentosProveedor from "./Components/proveedores/PedirMedicamentosProveedor.jsx";
import ListaProveedores from "./Components/proveedores/ListaProveedores.jsx";

import ListaPedidos from "./Components/pedidos/ListaPedidos.jsx";
import Dashboard from "./Components/dashboard/Dashboard.jsx";  

// === Citas ===
import Citas from "./Components/citas/citas.jsx";
import AgendarCita from "./Components/citas/AgendarCita.jsx";
import MisCitas from "./Components/citas/MisCitas.jsx"; // Agregado
import CitaDetalles from "./Components/citas/CitaDetalles.jsx"; // Ruta para los detalles de la cita

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

        {/* 🏭 Proveedores / Compras */}
        <Route path="/proveedores/crear" element={<CrearProveedor />} />
        <Route path="/proveedores/pedidos" element={<PedirMedicamentosProveedor />} />
        <Route path="/proveedores" element={<ListaProveedores />} />
        <Route path="/dashboard" element={<Dashboard />} /> {/* Ruta para Dashboard */}

        {/* Citas */}
        <Route path="/citas" element={<Citas />} />
        <Route path="/citas/agendar" element={<AgendarCita />} />
        <Route path="/mis-citas" element={<MisCitas />} /> {/* Ruta para Mis Citas */}
        <Route path="/citas/detalles/:idCita" element={<CitaDetalles />} /> {/* Ruta para los detalles de la cita */}

        <Route path="/pedidos" element={<ListaPedidos />} />

        {/* 404 */}
        <Route path="*" element={<div style={{ padding: 24 }}>Ruta no encontrada</div>} />
      </Routes>
    </BrowserRouter>
  );
}
