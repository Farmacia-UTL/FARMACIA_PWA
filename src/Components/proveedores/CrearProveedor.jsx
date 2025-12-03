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
            <span className="logo-badge"></span>
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
                <NavLink to="/medicamentos/inventario" className="admin-sublink">
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

      {/* === FORMULARIO === */}
      <div className="prov-wrap">
        <h1 className="prov-title">Registrar proveedor</h1>

        <button
          className="prov-back"
          onClick={() => navigate(-1)}
        >
          ← Regresar
        </button>

        <form className="prov-card" onSubmit={onSubmit}>
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
            />
          </div>

          <div className="prov-field">
            <label>RFC</label>
            <input
              name="rfc"
              value={form.rfc}
              onChange={onChange}
            />
          </div>

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
      </div>

      {/* === CSS LOCAL === */}
      <style>{`
        .prov-wrap {
          max-width: 1100px;
          margin: 40px auto;
          padding: 0 20px;
          animation: fadeIn 0.4s ease-out;
        }

        .prov-title {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 6px;
          color: #eaf2ff;
        }

        .prov-back {
          background: linear-gradient(90deg, #0ea5e9, #3b82f6);
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 12px;
          cursor: pointer;
          margin-bottom: 22px;
          font-weight: 600;
          box-shadow: 0 10px 22px rgba(30,58,138,0.35);
        }

        .prov-back:hover {
          filter: brightness(1.1);
        }

        .prov-card {
          background: rgba(15, 23, 42, 0.92);
          border: 1px solid rgba(148, 163, 184, 0.55);
          backdrop-filter: blur(18px);
          border-radius: 20px;
          padding: 28px;
          display: grid;
          gap: 20px;
          box-shadow: 0 18px 40px rgba(0,0,0,0.35);
        }

        .prov-grid2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media(max-width: 900px){
          .prov-grid2 { grid-template-columns: 1fr; }
        }

        .prov-field label {
          font-size: 14px;
          font-weight: 600;
          color: #d0d8f0;
          margin-bottom: 6px;
          display: block;
        }

        .prov-field input,
        .prov-field textarea {
          width: 100%;
          padding: 10px 3px;
          font-size: 14px;
          border-radius: 12px;
          border: 1px solid rgba(148,163,184,0.45);
          background: rgba(255,255,255,0.08);
          color: #f8fafc;
          outline: none;
          transition: 0.15s;
        }

        .prov-field input:focus,
        .prov-field textarea:focus {
          border-color: #38bdf8;
          background: rgba(255,255,255,0.15);
          box-shadow: 0 0 0 1px rgba(56,189,248,0.4);
        }

        .prov-submit {
          background: linear-gradient(90deg, #0ea5e9, #3b82f6);
          color: white;
          padding: 12px 20px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          margin-top: 4px;
          box-shadow: 0 14px 30px rgba(8,47,73,0.5);
          transition: 0.2s;
        }

        .prov-submit:hover {
          filter: brightness(1.08);
          transform: translateY(-2px);
        }

        .prov-msg {
          margin-top: 6px;
          font-size: 14px;
        }

        .prov-msg.ok { color: #22c55e; }
        .prov-msg.err { color: #ef4444; }
      `}</style>
    </>
  );
}
