import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../inicios/inicio.css"; // ← mantiene el topbar azul

const API_URL =
  import.meta.env.VITE_API_URL || "https://api-farmacia.ngrok.app";

export default function CrearProveedor() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    contacto: "",
    telefono: "",
    email: "",
    direccion: "",
    rfc: "",
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

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
      contacto: form.contacto || null,
      telefono: form.telefono || null,
      email: form.email || null,
      direccion: form.direccion || null,
      rfc: form.rfc || null,
    };

    try {
      const resp = await fetch(`${API_URL}/api/Proveedores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => null);

      if (resp.ok) {
        setMsg("✅ Proveedor registrado correctamente");
        setForm({
          nombre: "",
          contacto: "",
          telefono: "",
          email: "",
          direccion: "",
          rfc: "",
        });
      } else {
        setMsg(data?.title || data?.message || "❌ No se pudo registrar");
      }
    } catch (err) {
      console.error(err);
      setMsg("❌ Error de red");
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
            <span className="logo-badge">🏢</span>
            <div className="logo-text">
              <span className="logo-title">Farmacia · Admin</span>
              <span className="logo-subtitle">Panel de control y gestión</span>
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
                  Registrar proveedor
                </NavLink>
                <NavLink to="/proveedores" className="admin-sublink">
                  Lista de proveedores
                </NavLink>
                <NavLink
                  to="/proveedores/pedidos"
                  className="admin-sublink"
                >
                  Pedir medicamentos
                </NavLink>
              </div>
            </div>

            <NavLink to="/pedidos" className="admin-link">
              Pedidos
            </NavLink>

            <NavLink to="/citas" className="admin-link">
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

      {/* === CONTENEDOR PRINCIPAL TIPO “AGREGAR MEDICAMENTO” === */}
      <main className="prov-wrap">
        <div className="prov-container">
          <h1 className="prov-title">Registrar proveedor</h1>
          <p className="prov-subtitle">
            Guarda la información de tus proveedores para facilitar los pedidos.
          </p>

          {/* Botón regresar azul redondito */}
          <button className="prov-back" onClick={() => navigate(-1)}>
            ← Regresar
          </button>

          {/* Tarjeta blanca centrada */}
          <section className="prov-card">
            <header className="prov-card-header">
              <div className="prov-icon">📦</div>
              <div>
                <h2 className="prov-card-title">Nuevo proveedor</h2>
                <p className="prov-card-text">
                  Completa los datos de contacto y facturación del proveedor.
                </p>
              </div>
            </header>

            <form onSubmit={onSubmit} className="prov-form">
              <div className="prov-grid2">
                <div className="prov-field">
                  <label>Nombre de la empresa</label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={onChange}
                    required
                  />
                </div>

                <div className="prov-field">
                  <label>Contacto</label>
                  <input
                    name="contacto"
                    value={form.contacto}
                    onChange={onChange}
                    placeholder="Persona de contacto"
                  />
                </div>
              </div>

              <div className="prov-grid2">
                <div className="prov-field">
                  <label>Teléfono</label>
                  <input
                    name="telefono"
                    value={form.telefono}
                    onChange={onChange}
                    placeholder="Ej. 477 123 4567"
                  />
                </div>

                <div className="prov-field">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="correo@empresa.com"
                  />
                </div>
              </div>

              <div className="prov-field">
                <label>Dirección</label>
                <textarea
                  rows={2}
                  name="direccion"
                  value={form.direccion}
                  onChange={onChange}
                  placeholder="Calle, número, colonia, ciudad, estado"
                />
              </div>

              <div className="prov-field prov-field-half">
                <label>RFC</label>
                <input
                  name="rfc"
                  value={form.rfc}
                  onChange={onChange}
                  placeholder="Ej. ABCD801201XYZ"
                />
              </div>

              {/* Botón azul tipo barra */}
              <button
                type="submit"
                className="prov-submit"
                disabled={loading}
              >
                {loading ? "Guardando…" : "Guardar proveedor"}
              </button>

              {msg && (
                <p className={`prov-msg ${msg.startsWith("✅") ? "ok" : "err"}`}>
                  {msg}
                </p>
              )}
            </form>
          </section>
        </div>

        {/* === CSS LOCAL === */}
        <style>{`
          .prov-wrap {
            max-width: 1100px;
            margin: 32px auto 40px;
            padding: 0 16px;
          }

          .prov-container {
            max-width: 820px;
            margin: 0 auto;
          }

          .prov-title {
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 4px;
            color: #e5e7eb;
          }

          .prov-subtitle {
            margin: 0 0 18px;
            font-size: 14px;
            color: #9ca3af;
          }

          .prov-back {
            margin-bottom: 22px;
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
            box-shadow: 0 4px 14px rgba(37,99,235,0.35);
          }

          .prov-back:hover {
            filter: brightness(1.07);
          }

          .prov-card {
            background: linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.98),
              rgba(239, 246, 255, 0.99)
            );
            border-radius: 28px;
            padding: 24px;
            border: 1px solid rgba(191, 219, 254, 0.8);
            box-shadow:
              0 0 0 1px rgba(37,99,235,0.08),
              0 20px 50px rgba(15,23,42,0.55);
            color: #0f172a;
          }

          .prov-card-header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 18px;
          }

          .prov-icon {
            width: 56px;
            height: 56px;
            border-radius: 999px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(circle at 30% 20%, #4ade80, #2563eb);
            color: #eff6ff;
            font-size: 28px;
            box-shadow: 0 10px 24px rgba(37,99,235,0.45);
          }

          .prov-card-title {
            margin: 0;
            font-size: 22px;
          }

          .prov-card-text {
            margin: 4px 0 0;
            font-size: 14px;
            color: #6b7280;
          }

          .prov-form {
            display: grid;
            gap: 16px;
          }

          .prov-grid2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          @media (max-width: 900px) {
            .prov-grid2 {
              grid-template-columns: 1fr;
            }
          }

          .prov-field {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .prov-field-half {
            max-width: 320px;
          }

          .prov-field label {
            font-size: 14px;
            font-weight: 600;
            color: #0f172a;
          }

          .prov-field input,
          .prov-field textarea {
            width: 100%;
            padding: 9px 3px;
            font-size: 14px;
            border-radius: 14px;
            border: 1px solid #d1d5db;
            background-color: #f9fafb;
            color: #111827;
            outline: none;
            transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
          }

          .prov-field input:focus,
          .prov-field textarea:focus {
            border-color: #2563eb;
            background-color: #ffffff;
            box-shadow: 0 0 0 1px rgba(37,99,235,0.3);
          }

          .prov-submit {
            margin-top: 6px;
            padding: 12px 20px;
            border-radius: 999px;
            border: none;
            font-weight: 600;
            font-size: 15px;
            cursor: pointer;
            background: linear-gradient(90deg, #2563eb, #3b82f6);
            color: #ffffff;
            box-shadow: 0 10px 30px rgba(37,99,235,0.55);
          }

          .prov-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .prov-msg {
            margin-top: 8px;
            font-size: 14px;
          }

          .prov-msg.ok { color: #16a34a; }
          .prov-msg.err { color: #b91c1c; }
        `}</style>
      </main>
    </>
  );
}
