import React, { useEffect, useState } from "react";
import "../inicios/inicio.css";
import { NavLink, useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "https://api-farmacia.ngrok.app";

export default function ListaProveedores() {
  const navigate = useNavigate();

  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    nombre: "",
    contacto: "",
    telefono: "",
    email: "",
    direccion: "",
    rfc: "",
    activo: true,
  });

  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const nombreAdmin =
    localStorage.getItem("nombreUsuario") ||
    localStorage.getItem("userName") ||
    localStorage.getItem("userEmail") ||
    "Administrador";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    localStorage.removeItem("nombreUsuario");
    navigate("/login");
  };

  /* ================= CARGAR ================= */
  const cargarProveedores = async () => {
    try {
      setCargando(true);
      setError("");

      const resp = await fetch(`${API_URL}/api/Proveedores`);
      const data = await resp.json().catch(() => []);

      if (!resp.ok) throw new Error("No se pudo cargar la lista.");

      const normalizados = (data || []).map((p) => ({
        id: p.id ?? p.Id,
        nombre: p.nombre ?? p.Nombre ?? "",
        contacto: p.contacto ?? p.Contacto ?? "",
        telefono: p.telefono ?? p.Telefono ?? "",
        email: p.email ?? p.Email ?? "",
        direccion: p.direccion ?? p.Direccion ?? "",
        rfc: p.rfc ?? p.Rfc ?? "",
        activo: p.activo ?? p.Activo ?? true,
      }));

      setProveedores(normalizados);
    } catch (e) {
      setError(e.message || "Error al cargar proveedores");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  /* ================= EDITAR ================= */
  const seleccionarParaEditar = (p) => {
    setEditId(p.id);
    setMsg("");
    setEditForm({ ...p });
    window.scrollTo({ top: document.body.scrollHeight / 2, behavior: "smooth" });
  };

  const onChangeEdit = (e) => {
    const { name, type, checked, value } = e.target;
    setEditForm((s) => ({
      ...s,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmitEdit = async (e) => {
    e.preventDefault();
    if (!editId) return;

    const payload = { ...editForm };

    try {
      setSaving(true);
      setMsg("");

      const resp = await fetch(`${API_URL}/api/Proveedores/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => null);

      if (!resp.ok) throw new Error(data?.message || "No se pudo actualizar.");

      setMsg("✅ Proveedor actualizado");

      setProveedores((lista) =>
        lista.map((p) => (p.id === editId ? { ...p, ...payload } : p))
      );
    } catch (e) {
      setMsg(e.message);
    } finally {
      setSaving(false);
    }
  };

  /* ================= ELIMINAR ================= */
  const eliminarProveedor = async (id) => {
    if (!window.confirm("¿Eliminar proveedor?")) return;

    try {
      const resp = await fetch(`${API_URL}/api/Proveedores/${id}`, {
        method: "DELETE",
      });

      if (!resp.ok && resp.status !== 204)
        throw new Error("No se pudo eliminar.");

      setProveedores((lis) => lis.filter((p) => p.id !== id));
      if (editId === id) setEditId(null);

      setMsg("🗑️ Proveedor eliminado");
    } catch (e) {
      setMsg(e.message);
    }
  };

  return (
    <>
      {/* ============ TOPBAR AZUL ============ */}
      <header className="admin-menu">
        <div className="admin-left">
          <div className="admin-logo">
            <span className="logo-badge" />
            <div className="logo-text">
              <span className="logo-title">Farmacia · Admin</span>
              <span className="logo-subtitle">Gestión de proveedores</span>
            </div>
          </div>

          <nav className="admin-nav">
            <NavLink className="admin-link" to="/inicioAdmin">
              Inicio
            </NavLink>

            <div className="admin-dropdown">
              <span className="admin-link">Medicamentos ▾</span>
              <div className="admin-dropdown-content">
                <NavLink
                  to="/medicamentos/agregar"
                  className="admin-sublink"
                >
                  Agregar
                </NavLink>
                <NavLink
                  to="/medicamentos/inventario"
                  className="admin-sublink"
                >
                  Inventario
                </NavLink>
              </div>
            </div>

            <div className="admin-dropdown">
              <span className="admin-link">Proveedores ▾</span>
              <div className="admin-dropdown-content">
                <NavLink to="/proveedores/crear" className="admin-sublink">
                  Registrar
                </NavLink>
                <NavLink to="/proveedores" className="admin-sublink">
                  Lista
                </NavLink>
                <NavLink
                  to="/proveedores/pedidos"
                  className="admin-sublink"
                >
                  Pedidos
                </NavLink>
              </div>
            </div>

            <NavLink className="admin-link" to="/pedidos">
              Pedidos
            </NavLink>
            <NavLink className="admin-link" to="/citas">
              Citas
            </NavLink>
          </nav>
        </div>

        <div className="admin-right">
          <span className="admin-tag">Rol: Admin · {nombreAdmin}</span>
          <button className="btn-ghost logout-btn" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* ============ CONTENIDO ============ */}
      <main className="prov-wrap">
        {/* Título + regresar */}
        <div className="prov-top">
          <div>
            <h1 className="prov-title">Lista de proveedores</h1>
            <p className="prov-sub">
              Consulta, edita y administra los proveedores registrados en la
              farmacia.
            </p>
          </div>

          <button className="prov-back" onClick={() => navigate(-1)}>
            ← Regresar
          </button>
        </div>

        {/* ============ CARD TABLA BLANCA ============ */}
        <section className="prov-card prov-card--table">
          <div className="prov-card-header">
            <h2 className="prov-card-title">Proveedores registrados</h2>
            <NavLink to="/proveedores/crear" className="btn-blue">
              + Registrar proveedor
            </NavLink>
          </div>

          {cargando && <p className="muted">Cargando…</p>}
          {error && <p className="error">{error}</p>}

          {!cargando && proveedores.length === 0 && !error && (
            <p className="muted">No hay proveedores registrados.</p>
          )}

          {!cargando && proveedores.length > 0 && (
            <div className="prov-table-wrap">
              <table className="prov-table">
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Contacto</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th>Estado</th>
                    <th style={{ textAlign: "center" }}>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {proveedores.map((p) => (
                    <tr key={p.id}>
                      <td>{p.nombre}</td>
                      <td>{p.contacto || "—"}</td>
                      <td>{p.telefono || "—"}</td>
                      <td>{p.email || "—"}</td>
                      <td>
                        <span
                          className={`pill ${
                            p.activo ? "pill-ok" : "pill-off"
                          }`}
                        >
                          {p.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="actions">
                        <button
                          className="btn-mini"
                          type="button"
                          onClick={() => seleccionarParaEditar(p)}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className="btn-mini danger"
                          type="button"
                          onClick={() => eliminarProveedor(p.id)}
                        >
                          🗑 Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ============ CARD EDICIÓN BLANCA ============ */}
        <section className="prov-card">
          <h2 className="prov-card-title">Editar proveedor</h2>
          {!editId && (
            <p className="muted">
              Selecciona un proveedor en la tabla para modificar sus datos.
            </p>
          )}

          {editId && (
            <form className="edit-form" onSubmit={onSubmitEdit}>
              <div className="grid2">
                <div className="field">
                  <label>Empresa</label>
                  <input
                    name="nombre"
                    value={editForm.nombre}
                    onChange={onChangeEdit}
                    required
                  />
                </div>

                <div className="field">
                  <label>Contacto</label>
                  <input
                    name="contacto"
                    value={editForm.contacto}
                    onChange={onChangeEdit}
                  />
                </div>
              </div>

              <div className="grid2">
                <div className="field">
                  <label>Teléfono</label>
                  <input
                    name="telefono"
                    value={editForm.telefono}
                    onChange={onChangeEdit}
                  />
                </div>

                <div className="field">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={onChangeEdit}
                  />
                </div>
              </div>

              <div className="field">
                <label>Dirección</label>
                <textarea
                  rows={2}
                  name="direccion"
                  value={editForm.direccion}
                  onChange={onChangeEdit}
                />
              </div>

              <div className="grid2">
                <div className="field">
                  <label>RFC</label>
                  <input
                    name="rfc"
                    value={editForm.rfc}
                    onChange={onChangeEdit}
                  />
                </div>

                <div className="field check">
                  <input
                    type="checkbox"
                    id="activo"
                    name="activo"
                    checked={editForm.activo}
                    onChange={onChangeEdit}
                  />
                  <label htmlFor="activo">Proveedor activo</label>
                </div>
              </div>

              <button type="submit" className="btn-blue" disabled={saving}>
                {saving ? "Guardando…" : "Guardar cambios"}
              </button>

              {msg && <p className="msg">{msg}</p>}
            </form>
          )}
        </section>
      </main>

      {/* ============ CSS ============ */}
      <style>{`
        .prov-wrap {
          max-width: 1100px;
          margin: 34px auto 40px;
          padding: 0 20px 10px;
          color: #0f172a;
        }

        .prov-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 18px;
        }

        .prov-title {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 4px;
          color: #e5f0ff;
        }

        .prov-sub {
          margin: 0;
          font-size: 14px;
          color: #cbd5e1;
        }

        .prov-back {
          background: linear-gradient(90deg, #0ea5e9, #3b82f6);
          color: white;
          border: none;
          padding: 8px 22px;
          border-radius: 999px;
          cursor: pointer;
          font-weight: 600;
          box-shadow: 0 10px 24px rgba(8,47,73,0.55);
          align-self: flex-start;
        }

        .prov-back:hover {
          filter: brightness(1.07);
          transform: translateY(-1px);
        }

        .prov-card {
          max-width: 1100px;
          margin: 0 auto 22px;
          background: linear-gradient(
            145deg,
            rgba(255,255,255,0.99),
            rgba(239,246,255,0.99)
          );
          border-radius: 24px;
          border: 1px solid rgba(191,219,254,0.9);
          box-shadow:
            0 0 0 1px rgba(148,163,184,0.35),
            0 18px 40px rgba(15,23,42,0.45);
          padding: 22px 24px;
          color: #0f172a;
        }

        .prov-card--table {
          margin-bottom: 26px;
        }

        .prov-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .prov-card-title {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          color: #1e293b;
        }

        .btn-blue {
          background: linear-gradient(90deg, #2563eb, #1d4ed8);
          padding: 8px 18px;
          border-radius: 999px;
          color: white;
          text-decoration: none;
          font-weight: 600;
          border: none;
          cursor: pointer;
          box-shadow: 0 10px 26px rgba(37,99,235,0.5);
          font-size: 14px;
        }

        .btn-blue:hover {
          filter: brightness(1.06);
          transform: translateY(-1px);
        }

        .prov-table-wrap {
          overflow-x: auto;
          margin-top: 6px;
        }

        .prov-table {
          width: 100%;
          border-collapse: collapse;
          color: #0f172a;
          font-size: 14px;
        }

        .prov-table thead tr {
          background: linear-gradient(
            90deg,
            rgba(219,234,254,1),
            rgba(191,219,254,1)
          );
        }

        .prov-table th {
          padding: 10px 8px;
          text-align: left;
          color: #1e3a8a;
          font-weight: 700;
          border-bottom: 1px solid rgba(148,163,184,0.5);
        }

        .prov-table td {
          padding: 10px 8px;
          border-bottom: 1px solid rgba(203,213,225,0.8);
        }

        .prov-table tbody tr:hover {
          background: rgba(219,234,254,0.45);
        }

        .pill {
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
        }

        .pill-ok {
          background: rgba(22,163,74,0.1);
          color: #15803d;
          border: 1px solid rgba(22,163,74,0.3);
        }

        .pill-off {
          background: rgba(239,68,68,0.08);
          color: #b91c1c;
          border: 1px solid rgba(239,68,68,0.25);
        }

        .actions {
          display: flex;
          gap: 6px;
          justify-content: center;
        }

        .btn-mini {
          padding: 4px 10px;
          border-radius: 999px;
          background: #eff6ff;
          color: #1e293b;
          border: 1px solid rgba(148,163,184,0.7);
          font-size: 12px;
          cursor: pointer;
          transition: 0.15s;
        }

        .btn-mini:hover {
          background: #dbeafe;
          transform: translateY(-1px);
        }

        .btn-mini.danger {
          background: #fef2f2;
          border-color: rgba(239,68,68,0.6);
          color: #b91c1c;
        }

        .btn-mini.danger:hover {
          background: #fee2e2;
        }

        .grid2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        @media (max-width: 900px) {
          .grid2 { grid-template-columns: 1fr; }
          .prov-top { flex-direction: column-reverse; align-items: flex-start; }
          .prov-card-header { flex-direction: column; align-items: flex-start; }
        }

        .field label {
          font-size: 13px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
          display: block;
        }

        .field input,
        .field textarea {
          width: 100%;
          padding: 10px 8px;
          border-radius: 12px;
          border: 1px solid rgba(148,163,184,0.7);
          background: #ffffff;
          color: #111827;
          outline: none;
          transition: 0.15s;
        }

        .field input:focus,
        .field textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 1px rgba(37,99,235,0.3);
        }

        .field.check {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 24px;
        }

        .field.check input {
          width: auto;
        }

        .msg {
          margin-top: 10px;
          color: #15803d;
          font-size: 14px;
        }
        .muted { color:#64748b; font-size: 14px; }
        .error { color:#b91c1c; font-weight:600; font-size: 14px; }
      `}</style>
    </>
  );
}
