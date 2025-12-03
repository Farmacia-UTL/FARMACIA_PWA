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
  };

  const onChangeEdit = (e) => {
    const { name, type, checked, value } = e.target;
    setEditForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
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
              <span className="logo-title">Farmacia</span>
              <span className="logo-subtitle">Panel administrador</span>
            </div>
          </div>

          <nav className="admin-nav">
            <NavLink className="admin-link" to="/inicioAdmin">Inicio</NavLink>

            <div className="admin-dropdown">
              <span className="admin-link">Medicamentos ▾</span>
              <div className="admin-dropdown-content">
                <NavLink to="/medicamentos/agregar" className="admin-sublink">Agregar</NavLink>
                <NavLink to="/medicamentos/inventario" className="admin-sublink">Inventario</NavLink>
              </div>
            </div>

            <div className="admin-dropdown">
              <span className="admin-link">Proveedores ▾</span>
              <div className="admin-dropdown-content">
                <NavLink to="/proveedores/crear" className="admin-sublink">Registrar</NavLink>
                <NavLink to="/proveedores" className="admin-sublink">Lista</NavLink>
                <NavLink to="/proveedores/pedidos" className="admin-sublink">Pedidos</NavLink>
              </div>
            </div>

            <NavLink className="admin-link" to="/pedidos">Pedidos</NavLink>
            <NavLink className="admin-link" to="/citas">Citas</NavLink>
          </nav>
        </div>

        <div className="admin-right">
          <button className="btn-ghost logout-btn" onClick={() => navigate("/")}>Cerrar sesión</button>
        </div>
      </header>

      {/* ============ CONTENIDO ============ */}
      <div className="prov-wrap">
        <div className="prov-header">
          <h1>Lista de proveedores</h1>

          <NavLink to="/proveedores/crear" className="btn-blue">
            + Registrar proveedor
          </NavLink>
        </div>

        {/* ============ TABLA ============ */}
        <div className="prov-card">
          {cargando && <p>Cargando…</p>}
          {error && <p className="error">{error}</p>}

          {!cargando && proveedores.length === 0 && (
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
                    <th style={{textAlign:"center"}}>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {proveedores.map((p) => (
                    <tr key={p.id}>
                      <td>{p.nombre}</td>
                      <td>{p.contacto}</td>
                      <td>{p.telefono}</td>
                      <td>{p.email}</td>
                      <td>
                        <span className={`pill ${p.activo ? "pill-ok" : "pill-off"}`}>
                          {p.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="actions">
                        <button className="btn-mini" onClick={() => seleccionarParaEditar(p)}>Editar</button>
                        <button className="btn-mini danger" onClick={() => eliminarProveedor(p.id)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ============ FORMULARIO EDICIÓN ============ */}
        <div className="prov-card">
          <h2 className="sub">Editar proveedor</h2>
          {!editId && <p className="muted">Selecciona un proveedor en la tabla.</p>}

          {editId && (
            <form className="edit-form" onSubmit={onSubmitEdit}>
              <div className="grid2">
                <div className="field">
                  <label>Empresa</label>
                  <input name="nombre" value={editForm.nombre} onChange={onChangeEdit} required />
                </div>

                <div className="field">
                  <label>Contacto</label>
                  <input name="contacto" value={editForm.contacto} onChange={onChangeEdit} />
                </div>
              </div>

              <div className="grid2">
                <div className="field">
                  <label>Teléfono</label>
                  <input name="telefono" value={editForm.telefono} onChange={onChangeEdit} />
                </div>

                <div className="field">
                  <label>Email</label>
                  <input type="email" name="email" value={editForm.email} onChange={onChangeEdit} />
                </div>
              </div>

              <div className="field">
                <label>Dirección</label>
                <textarea rows={2} name="direccion" value={editForm.direccion} onChange={onChangeEdit} />
              </div>

              <div className="grid2">
                <div className="field">
                  <label>RFC</label>
                  <input name="rfc" value={editForm.rfc} onChange={onChangeEdit} />
                </div>

                <div className="field check">
                  <input type="checkbox" name="activo" checked={editForm.activo} onChange={onChangeEdit} />
                  <label>Activo</label>
                </div>
              </div>

              <button type="submit" className="btn-blue" disabled={saving}>
                {saving ? "Guardando…" : "Guardar cambios"}
              </button>

              {msg && <p className="msg">{msg}</p>}
            </form>
          )}
        </div>
      </div>

      {/* ============ CSS ============ */}
      <style>{`
        .prov-wrap {
          max-width: 1100px;
          margin: 34px auto;
          padding: 0 20px;
          color: #e5e7eb;
        }

        .prov-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .btn-blue {
          background: linear-gradient(90deg, #0ea5e9, #3b82f6);
          padding: 8px 18px;
          border-radius: 12px;
          color: white;
          text-decoration: none;
          font-weight: 600;
          box-shadow: 0 10px 26px rgba(8,47,73,0.5);
        }

        .btn-blue:hover { filter: brightness(1.1); }

        .prov-card {
          background: rgba(15,23,42,0.92);
          border: 1px solid rgba(148,163,184,0.45);
          backdrop-filter: blur(12px);
          padding: 22px;
          border-radius: 18px;
          margin-bottom: 22px;
          box-shadow: 0 16px 34px rgba(0,0,0,0.4);
        }

        .prov-table-wrap {
          overflow-x: auto;
        }

        .prov-table {
          width: 100%;
          border-collapse: collapse;
          color: #f8fafc;
        }

        .prov-table th {
          padding: 10px 8px;
          text-align: left;
          background: rgba(56,189,248,0.12);
          color: #a5d8ff;
          font-weight: 600;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .prov-table td {
          padding: 10px 8px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .pill {
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
        }

        .pill-ok {
          background: rgba(34,197,94,0.25);
          color: #4ade80;
        }

        .pill-off {
          background: rgba(248,113,113,0.25);
          color: #f87171;
        }

        .actions {
          display: flex;
          gap: 6px;
        }

        .btn-mini {
          padding: 4px 10px;
          border-radius: 999px;
          background: #1e293b;
          color: #e2e8f0;
          border: 1px solid rgba(148,163,184,0.4);
          font-size: 12px;
        }

        .btn-mini:hover { background: #334155; }

        .btn-mini.danger {
          background: rgba(248,113,113,0.2);
          border-color: rgba(248,113,113,0.55);
          color: #f87171;
        }

        .btn-mini.danger:hover { background: rgba(248,113,113,0.3); }

        .grid2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        @media(max-width:900px){ .grid2 { grid-template-columns:1fr; } }

        .field label {
          font-size: 13px;
          font-weight: 600;
          color: #dbeafe;
        }

        .field input,
        .field textarea {
          width: 100%;
          padding: 10px 3px;
          border-radius: 12px;
          border: 1px solid rgba(148,163,184,0.4);
          background: rgba(255,255,255,0.06);
          color: #f1f5f9;
        }

        .field input:focus,
        .field textarea:focus {
          border-color: #38bdf8;
          background: rgba(255,255,255,0.12);
          box-shadow: 0 0 0 1px rgba(56,189,248,0.4);
        }

        .sub {
          margin-bottom: 10px;
          font-size: 20px;
          font-weight: 600;
          color: #c7d2fe;
        }

        .msg { margin-top: 10px; color: #4ade80; }
        .muted { color:#94a3b8; }
        .error { color:#f87171; font-weight:600; }
      `}</style>
    </>
  );
}
