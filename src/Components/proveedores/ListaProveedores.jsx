import React, { useEffect, useState } from "react";
import "../inicios/inicio.css";
import { NavLink } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "https://api-farmacia.ngrok.app";

export default function ListaProveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // edición
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

  // ====== Cargar lista ======
  const cargarProveedores = async () => {
    try {
      setCargando(true);
      setError("");
      const resp = await fetch(`${API_URL}/api/Proveedores`);
      const data = await resp.json().catch(() => []);

      if (!resp.ok) {
        throw new Error(data?.message || "No se pudo obtener la lista.");
      }

      // Normalizar propiedades (id/Id, nombre/Nombre, etc.)
      const normalizados = (data || []).map((p) => ({
        id: p.id ?? p.Id,
        nombre: p.nombre ?? p.Nombre ?? "",
        contacto: p.contacto ?? p.Contacto ?? "",
        telefono: p.telefono ?? p.Telefono ?? "",
        email: p.email ?? p.Email ?? "",
        direccion: p.direccion ?? p.Direccion ?? "",
        rfc: p.rfc ?? p.Rfc ?? "",
        activo: p.activo ?? p.Activo ?? true,
        fechaCreacion: p.fechaCreacion ?? p.FechaCreacion,
      }));

      setProveedores(normalizados);
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al obtener proveedores.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  // ====== Seleccionar proveedor para editar ======
  const seleccionarParaEditar = (p) => {
    setEditId(p.id);
    setMsg("");
    setEditForm({
      nombre: p.nombre,
      contacto: p.contacto,
      telefono: p.telefono,
      email: p.email,
      direccion: p.direccion,
      rfc: p.rfc,
      activo: p.activo,
    });
  };

  const onChangeEdit = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((s) => ({
      ...s,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ====== Guardar cambios (PUT) ======
  const onSubmitEdit = async (e) => {
    e.preventDefault();
    if (!editId) return;

    const payload = {
      nombre: editForm.nombre,
      contacto: editForm.contacto || null,
      telefono: editForm.telefono || null,
      email: editForm.email || null,
      direccion: editForm.direccion || null,
      rfc: editForm.rfc || null,
      activo: editForm.activo,
    };

    try {
      setSaving(true);
      setMsg("");
      const resp = await fetch(`${API_URL}/api/Proveedores/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => null);

      if (!resp.ok) {
        throw new Error(data?.message || data?.title || "No se pudo actualizar.");
      }

      setMsg("✅ Proveedor actualizado.");

      // Actualizar en la lista local
      setProveedores((lista) =>
        lista.map((p) =>
          p.id === editId
            ? {
                ...p,
                ...payload,
              }
            : p
        )
      );
    } catch (e) {
      console.error(e);
      setMsg(e.message || "❌ Error al actualizar.");
    } finally {
      setSaving(false);
    }
  };

  // ====== Eliminar proveedor (DELETE) ======
  const eliminarProveedor = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este proveedor?"
    );
    if (!confirmar) return;

    try {
      const resp = await fetch(`${API_URL}/api/Proveedores/${id}`, {
        method: "DELETE",
      });

      if (!resp.ok && resp.status !== 204) {
        const data = await resp.json().catch(() => null);
        throw new Error(data?.message || "No se pudo eliminar.");
      }

      setProveedores((lista) => lista.filter((p) => p.id !== id));
      if (editId === id) {
        setEditId(null);
        setEditForm({
          nombre: "",
          contacto: "",
          telefono: "",
          email: "",
          direccion: "",
          rfc: "",
          activo: true,
        });
      }
      setMsg("✅ Proveedor eliminado.");
    } catch (e) {
      console.error(e);
      setMsg(e.message || "❌ Error al eliminar.");
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "24px auto", padding: "0 16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <h2 style={{ margin: 0 }}>Proveedores</h2>

        <NavLink to="/proveedores/crear" className="btn-login">
          ➕ Registrar proveedor
        </NavLink>
      </div>

      {/* Tabla de proveedores */}
      <div
        className="card"
        style={{
          padding: 16,
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 8px 24px rgba(0,0,0,.08)",
          marginBottom: 20,
        }}
      >
        {cargando && <p>Cargando proveedores…</p>}
        {error && (
          <p style={{ color: "#b01515", fontWeight: 600 }}>
            {error}
          </p>
        )}
        {!cargando && !error && proveedores.length === 0 && (
          <p style={{ color: "#64748b" }}>No hay proveedores registrados.</p>
        )}

        {!cargando && proveedores.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
              }}
            >
              <thead>
                <tr
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <th style={{ padding: "8px 6px" }}>Nombre</th>
                  <th style={{ padding: "8px 6px" }}>Contacto</th>
                  <th style={{ padding: "8px 6px" }}>Teléfono</th>
                  <th style={{ padding: "8px 6px" }}>Email</th>
                  <th style={{ padding: "8px 6px" }}>Estado</th>
                  <th style={{ padding: "8px 6px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proveedores.map((p) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <td style={{ padding: "8px 6px" }}>{p.nombre}</td>
                    <td style={{ padding: "8px 6px" }}>{p.contacto}</td>
                    <td style={{ padding: "8px 6px" }}>{p.telefono}</td>
                    <td style={{ padding: "8px 6px" }}>{p.email}</td>
                    <td style={{ padding: "8px 6px" }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 600,
                          background: p.activo ? "#dcfce7" : "#fee2e2",
                          color: p.activo ? "#166534" : "#b91c1c",
                        }}
                      >
                        {p.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td style={{ padding: "8px 6px" }}>
                      <button
                        className="chip"
                        onClick={() => seleccionarParaEditar(p)}
                        style={{ marginRight: 6, marginBottom: 4 }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className="chip"
                        onClick={() => eliminarProveedor(p.id)}
                        style={{
                          background: "#fee2e2",
                          borderColor: "#fecaca",
                          color: "#b91c1c",
                        }}
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
      </div>

      {/* Formulario de edición */}
      <div
        className="card"
        style={{
          padding: 16,
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 8px 24px rgba(0,0,0,.08)",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 10 }}>
          {editId ? "Editar proveedor" : "Selecciona un proveedor para editar"}
        </h3>

        {editId && (
          <form
            onSubmit={onSubmitEdit}
            style={{ display: "grid", gap: 12 }}
          >
            <div className="grid2">
              <div>
                <label>Nombre de la empresa</label>
                <input
                  name="nombre"
                  value={editForm.nombre}
                  onChange={onChangeEdit}
                  required
                />
              </div>
              <div>
                <label>Contacto</label>
                <input
                  name="contacto"
                  value={editForm.contacto}
                  onChange={onChangeEdit}
                />
              </div>
            </div>

            <div className="grid2">
              <div>
                <label>Teléfono</label>
                <input
                  name="telefono"
                  value={editForm.telefono}
                  onChange={onChangeEdit}
                />
              </div>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={onChangeEdit}
                />
              </div>
            </div>

            <div>
              <label>Dirección</label>
              <textarea
                rows={2}
                name="direccion"
                value={editForm.direccion}
                onChange={onChangeEdit}
              />
            </div>

            <div className="grid2">
              <div>
                <label>RFC</label>
                <input
                  name="rfc"
                  value={editForm.rfc}
                  onChange={onChangeEdit}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  id="chk-activo"
                  type="checkbox"
                  name="activo"
                  checked={editForm.activo}
                  onChange={onChangeEdit}
                />
                <label htmlFor="chk-activo">Proveedor activo</label>
              </div>
            </div>

            <button
              type="submit"
              className="btn-login"
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        )}

        {msg && (
          <p className="login-message" style={{ marginTop: 10 }}>
            {msg}
          </p>
        )}
      </div>

      {/* estilos de apoyo por si no existen en tu CSS */}
      <style>{`
        .grid2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 900px) {
          .grid2 {
            grid-template-columns: 1fr;
          }
        }
        .card input,
        .card textarea {
          width: 100%;
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          outline: none;
        }
        .card label {
          display: block;
          font-weight: 600;
          margin-bottom: 4px;
        }
      `}</style>
    </div>
  );
}
