import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../inicios/inicio.css";

const API_URL =
  import.meta.env.VITE_API_URL || "https://api-farmacia.ngrok.app";

export default function AgregarMedicamento() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    cantidad: "",
    tipo: "",
    precio: "",
    descripcion: "",
    beneficios: "",
    instrucciones: "",
    advertencias: "",
    fotoUrl: "",
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [imgOk, setImgOk] = useState(true);

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

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    const payload = {
      nombre: form.nombre,
      cantidad: Number(form.cantidad || 0),
      tipo: form.tipo,
      precio: Number(form.precio || 0),
      descripcion: form.descripcion,
      beneficios: form.beneficios,
      instrucciones: form.instrucciones,
      advertencias: form.advertencias,
      fotoUrl: form.fotoUrl?.trim() || null,
    };

    try {
      const resp = await fetch(`${API_URL}/api/Medicamentos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => null);

      if (resp.ok) {
        setMsg("✅ Medicamento agregado correctamente");
        setForm({
          nombre: "",
          cantidad: "",
          tipo: "",
          precio: "",
          descripcion: "",
          beneficios: "",
          instrucciones: "",
          advertencias: "",
          fotoUrl: "",
        });
        setImgOk(true);
      } else {
        setMsg(data?.title || data?.message || "❌ Error al guardar");
      }
    } catch {
      setMsg("❌ Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* === TOPBAR AZUL === */}
      <header className="admin-menu">
        <div className="admin-left">
          <div className="admin-logo">
            <span className="logo-badge">⚕</span>
            <div className="logo-text">
              <span className="logo-title">Farmacia · Admin</span>
              <span className="logo-subtitle">Panel de control y gestión</span>
            </div>
          </div>
        </div>

        <nav className="admin-nav">
          <NavLink to="/inicioAdmin" className="admin-link">Inicio</NavLink>

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
              <NavLink to="/proveedores/pedidos" className="admin-sublink">Pedir</NavLink>
            </div>
          </div>

          <div className="admin-dropdown">
            <span className="admin-link">Pedidos ▾</span>
            <div className="admin-dropdown-content">
              <NavLink to="/pedidos" className="admin-sublink">Pedidos</NavLink>
              <NavLink to="/dashboard" className="admin-sublink">Dashboard</NavLink>
            </div>
          </div>

          <NavLink to="/citas" className="admin-link">Citas</NavLink>
        </nav>

        <div className="admin-right">
          <span className="admin-tag">Rol: Admin · {nombreAdmin}</span>
          <button className="btn-ghost logout-btn" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* === FORMULARIO === */}
      <main className="addmed-page">

        <button className="addmed-back" onClick={() => navigate(-1)}>
          ← Regresar
        </button>

        <section className="addmed-card">
          <h2 className="addmed-title">Formulario de registro</h2>
          <p className="addmed-subtitle">
            Completa los campos para registrar un medicamento.
          </p>

          <form onSubmit={onSubmit} className="addmed-form">
            

            <div className="addmed-grid2">
              <div className="addmed-field">
                <label>Nombre</label>
                <input name="nombre" value={form.nombre} onChange={onChange} required />
              </div>

              <div className="addmed-field">
                <label>Tipo</label>
                <input name="tipo" value={form.tipo} onChange={onChange} placeholder="Tableta, jarabe..." />
              </div>
            </div>

            <div className="addmed-grid2">
              <div className="addmed-field">
                <label>Cantidad</label>
                <input type="number" min="0" name="cantidad" value={form.cantidad} onChange={onChange} required />
              </div>

              <div className="addmed-field">
                <label>Precio</label>
                <input type="number" min="0" step="0.01" name="precio" value={form.precio} onChange={onChange} required />
              </div>
            </div>

            <div className="addmed-field">
              <label>Descripción</label>
              <textarea rows="2" name="descripcion" value={form.descripcion} onChange={onChange} />
            </div>

            <div className="addmed-grid3">
              <div className="addmed-field">
                <label>Beneficios</label>
                <textarea rows="2" name="beneficios" value={form.beneficios} onChange={onChange} />
              </div>

              <div className="addmed-field">
                <label>Instrucciones</label>
                <textarea rows="2" name="instrucciones" value={form.instrucciones} onChange={onChange} />
              </div>

              <div className="addmed-field">
                <label>Advertencias</label>
                <textarea rows="2" name="advertencias" value={form.advertencias} onChange={onChange} />
              </div>
            </div>

            <div className="addmed-grid2 addmed-image-grid">
              <div className="addmed-field">
                <label>URL de la foto (opcional)</label>
                <input type="url" name="fotoUrl" value={form.fotoUrl} onChange={onChange} placeholder="https://..." />
              </div>

              <div className="addmed-preview-box">
                <span>Vista previa</span>
                <div className="addmed-preview">
                  <img
                    src={
                      form.fotoUrl?.trim()
                        ? form.fotoUrl
                        : "https://via.placeholder.com/150x100?text=Preview"
                    }
                    onLoad={() => setImgOk(true)}
                    onError={() => setImgOk(false)}
                  />
                  <p className={imgOk ? "ok" : "error"}>
                    {imgOk ? "URL válida" : "URL inválida"}
                  </p>
                </div>
              </div>
            </div>

            <button className="addmed-submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar medicamento"}
            </button>

            {msg && <p className="addmed-msg">{msg}</p>}
          </form>
        </section>
      </main>
    </>
  );
}
