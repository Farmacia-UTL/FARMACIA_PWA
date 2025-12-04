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
          <NavLink to="/inicioAdmin" className="admin-link">
            Inicio
          </NavLink>

          <div className="admin-dropdown">
            <span className="admin-link">Medicamentos ▾</span>
            <div className="admin-dropdown-content">
              <NavLink to="/medicamentos/agregar" className="admin-sublink">
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
              <NavLink to="/proveedores/pedidos" className="admin-sublink">
                Pedir
              </NavLink>
            </div>
          </div>

          <div className="admin-dropdown">
            <span className="admin-link">Pedidos ▾</span>
            <div className="admin-dropdown-content">
              <NavLink to="/pedidos" className="admin-sublink">
                Pedidos
              </NavLink>
              <NavLink to="/dashboard" className="admin-sublink">
                Dashboard
              </NavLink>
            </div>
          </div>

          <NavLink to="/citas" className="admin-link">
            Citas
          </NavLink>
        </nav>

        <div className="admin-right">
          <span className="admin-tag">Rol: Admin · {nombreAdmin}</span>
          <button className="btn-ghost logout-btn" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* === CONTENEDOR PRINCIPAL (misma idea que AgendarCita) === */}
      <main className="addmed-page">
        <div className="addmed-container">
          {/* Botón regresar azul */}
          <button
            className="addmed-back"
            type="button"
            onClick={() => navigate(-1)}
          >
            ← Regresar
          </button>

          {/* Tarjeta blanca centrada */}
          <section className="addmed-card">
            <header className="addmed-card-header">
              <div className="addmed-icon">
                💊
              </div>
              <div>
                <h2 className="addmed-title">Registrar medicamento</h2>
                <p className="addmed-subtitle">
                  Completa los campos para agregar un nuevo medicamento al
                  inventario.
                </p>
              </div>
            </header>

            <form onSubmit={onSubmit} className="addmed-form">
              <div className="addmed-grid2">
                <div className="addmed-field">
                  <label>Nombre</label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={onChange}
                    required
                  />
                </div>

                <div className="addmed-field">
                  <label>Tipo</label>
                  <input
                    name="tipo"
                    value={form.tipo}
                    onChange={onChange}
                    placeholder="Tableta, jarabe..."
                  />
                </div>
              </div>

              <div className="addmed-grid2">
                <div className="addmed-field">
                  <label>Cantidad</label>
                  <input
                    type="number"
                    min="0"
                    name="cantidad"
                    value={form.cantidad}
                    onChange={onChange}
                    required
                  />
                </div>

                <div className="addmed-field">
                  <label>Precio</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="precio"
                    value={form.precio}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>

              <div className="addmed-field">
                <label>Descripción</label>
                <textarea
                  rows="2"
                  name="descripcion"
                  value={form.descripcion}
                  onChange={onChange}
                />
              </div>

              <div className="addmed-grid3">
                <div className="addmed-field">
                  <label>Beneficios</label>
                  <textarea
                    rows="2"
                    name="beneficios"
                    value={form.beneficios}
                    onChange={onChange}
                  />
                </div>

                <div className="addmed-field">
                  <label>Instrucciones</label>
                  <textarea
                    rows="2"
                    name="instrucciones"
                    value={form.instrucciones}
                    onChange={onChange}
                  />
                </div>

                <div className="addmed-field">
                  <label>Advertencias</label>
                  <textarea
                    rows="2"
                    name="advertencias"
                    value={form.advertencias}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="addmed-grid2 addmed-image-grid">
                <div className="addmed-field">
                  <label>URL de la foto (opcional)</label>
                  <input
                    type="url"
                    name="fotoUrl"
                    value={form.fotoUrl}
                    onChange={onChange}
                    placeholder="https://..."
                  />
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
                      alt="Vista previa"
                    />
                    <p className={imgOk ? "ok" : "error"}>
                      {imgOk ? "URL válida" : "URL inválida"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botón azul tipo barra */}
              <button className="addmed-submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar medicamento"}
              </button>

              {msg && <p className="addmed-msg">{msg}</p>}
            </form>
          </section>
        </div>

        {/* Estilos locales para el diseño tipo AgendarCita */}
        <style>{`
          .addmed-page {
            max-width: 1100px;
            margin: 32px auto 40px;
            padding: 0 16px;
          }

          .addmed-container {
            max-width: 900px;
            margin: 0 auto;
          }

          .addmed-back {
            margin-bottom: 24px;
            background: linear-gradient(90deg, #2563eb, #1d4ed8);
            color: #ffffff;
            font-weight: 600;
            border: none;
            padding: 9px 18px;
            border-radius: 999px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
          }

          .addmed-card {
            background: linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.98),
              rgba(239, 246, 255, 0.99)
            );
            padding: 24px;
            border-radius: 28px;
            border: 1px solid rgba(191, 219, 254, 0.8);
            box-shadow:
              0 0 0 1px rgba(37, 99, 235, 0.08),
              0 20px 50px rgba(15, 23, 42, 0.55);
            color: #0f172a;
          }

          .addmed-card-header {
            display: flex;
            gap: 16px;
            align-items: center;
            margin-bottom: 18px;
          }

          .addmed-icon {
            width: 56px;
            height: 56px;
            border-radius: 999px;
            display: flex;
            align-items: center;
            justifyContent: center;
            background: radial-gradient(circle at 30% 20%, #4ade80, #2563eb);
            color: #000;
            box-shadow: 0 10px 24px rgba(37, 99, 235, 0.45);
            font-size: 28px;
          }

          .addmed-title {
            margin: 0;
            font-size: 22px;
            color: #000;
          }

          .addmed-subtitle {
            margin: 4px 0 0;
            font-size: 14px;
            color: #000;
          }

          .addmed-form {
            display: grid;
            gap: 14px;
            margin-top: 4px;
          }

          .addmed-grid2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
          }

          .addmed-grid3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
          }

          @media (max-width: 900px) {
            .addmed-grid2,
            .addmed-grid3 {
              grid-template-columns: 1fr;
            }
          }

          .addmed-field {
            display: flex;
            flex-direction: column;
            gap: 4px;
            font-size: 14px;
          }

          .addmed-field label {
            font-weight: 600;
            color: #0f172a;
          }

          .addmed-field input,
          .addmed-field textarea {
            border-radius: 14px;
            border: 1px solid #d1d5db;
            padding: 9px 3px;
            font-size: 14px;
            outline: none;
            background-color: #f9fafb;
          }

          .addmed-field input:focus,
          .addmed-field textarea:focus {
            border-color: #2563eb;
            box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.3);
            background-color: #ffffff;
          }

          .addmed-image-grid {
            align-items: flex-start;
          }

          .addmed-preview-box {
            display: flex;
            flex-direction: column;
            gap: 6px;
            font-size: 13px;
            color: #4b5563;
          }

          .addmed-preview {
            border-radius: 16px;
            border: 1px solid #e5e7eb;
            padding: 8px;
            background-color: #f9fafb;
            display: flex;
            flex-direction: column;
            gap: 6px;
            align-items: center;
            justify-content: center;
          }

          .addmed-preview img {
            max-width: 100%;
            max-height: 110px;
            border-radius: 10px;
            object-fit: cover;
          }

          .addmed-preview p.ok {
            color: #16a34a;
          }

          .addmed-preview p.error {
            color: #b91c1c;
          }

          .addmed-submit {
            margin-top: 8px;
            padding: 12px 20px;
            border-radius: 999px;
            border: none;
            font-weight: 600;
            font-size: 15px;
            cursor: pointer;
            background: linear-gradient(
              90deg,
              rgba(37, 99, 235, 1),
              rgba(59, 130, 246, 1)
            );
            color: #ffffff;
            box-shadow: 0 10px 30px rgba(37, 99, 235, 0.55);
          }

          .addmed-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .addmed-msg {
            margin-top: 10px;
            font-size: 14px;
            color: #111827;
          }
        `}</style>
      </main>
    </>
  );
}
