import React, { useEffect, useState } from "react";
import "../inicios/inicio.css";
import { NavLink, useNavigate } from "react-router-dom";
import { getSlots } from "../citas/services/citasApi";

const InicioAdmin = () => {
  const navigate = useNavigate();

  // ====== Agenda rápida (slots) ======
  const [fecha, setFecha] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`; // yyyy-mm-dd
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [slots, setSlots] = useState([]);

  const cargarSlots = async () => {
    try {
      setCargando(true);
      setError("");
      const data = await getSlots({
        fecha,
        slotMin: 30,
        start: "09:00",
        end: "18:00",
      });
      const disponibles = (data.disponibles || []).map((iso) => new Date(iso));
      setSlots(disponibles);
    } catch (e) {
      setError(e.message || "No se pudieron obtener los horarios.");
      setSlots([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha]);

  const fmtHora = (d) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* Topbar */}
      <header className="admin-menu">
        <div className="admin-left">
          <div className="admin-logo">
            <span className="logo-badge">⚕</span>
            <span>Farmacia · Admin</span>
          </div>

          <nav className="admin-nav">
            <NavLink to="/inicioAdmin" className="admin-link">
              Inicio
            </NavLink>

            <div className="admin-dropdown">
              <span className="admin-link">Medicamentos ▾</span>
              <div className="admin-dropdown-content">
                <NavLink
                  to="/medicamentos/agregar"
                  className="admin-sublink"
                >
                  ➕ Agregar
                </NavLink>
                <NavLink
                  to="/medicamentos/inventario"
                  className="admin-sublink"
                >
                  📦 Inventario
                </NavLink>
              </div>
            </div>

            {/* Proveedores / Compras */}
            <div className="admin-dropdown">
              <span className="admin-link">Proveedores ▾</span>
              <div className="admin-dropdown-content">
                <NavLink
                  to="/proveedores/crear"
                  className="admin-sublink"
                >
                  ➕ Registrar proveedor
                </NavLink>
                <NavLink to="/proveedores" className="admin-sublink">
                  📇 Lista de proveedores
                </NavLink>
                <NavLink
                  to="/proveedores/pedidos"
                  className="admin-sublink"
                >
                  🧾 Pedir medicamentos
                </NavLink>
              </div>
            </div>

            {/* 🧾 Pedidos de clientes */}
            <div className="admin-dropdown">
              <span className="admin-link">Pedidos ▾</span>
              <div className="admin-dropdown-content">
                <NavLink to="/pedidos" className="admin-sublink">
                  📋 Ver pedidos
                </NavLink>
                {/* Más adelante puedes agregar:
                <NavLink to="/pedidos/reportes" className="admin-sublink">
                  📊 Resumen de ventas
                </NavLink> */}
              </div>
            </div>

            {/* Citas */}
            <div className="admin-dropdown">
              <span className="admin-link">Citas ▾</span>
              <div className="admin-dropdown-content">
                <NavLink to="/citas/agendar" className="admin-sublink">
                  🗓️ Agendar
                </NavLink>
                <NavLink to="/citas" className="admin-sublink">
                  📒 Mis citas
                </NavLink>
                <NavLink to="/citas/agenda" className="admin-sublink">
                  📆 Agenda del día
                </NavLink>
              </div>
            </div>
          </nav>
        </div>

        <div className="admin-right">
          <span className="admin-tag">Sesión segura</span>
        </div>
      </header>

      {/* Hero */}
      <section className="inicio-hero modern">
        <div className="inicio-texto">
          <h1 className="inicio-title">Bienvenido Administrador</h1>
          <p className="inicio-lead">
            Gestiona el <strong>inventario</strong>, usuarios,{" "}
            <strong>citas</strong> y reportes.
          </p>

          <div className="hero-actions">
            <NavLink to="/medicamentos/agregar" className="btn-cta">
              Agregar medicamento
            </NavLink>
            <NavLink to="/medicamentos/inventario" className="btn-ghost">
              Ver inventario
            </NavLink>
          </div>

          <ul className="hero-points">
            <li>💊 Control preciso de stock</li>
            <li>🧾 Precios, advertencias e instrucciones</li>
            <li>🗓️ Agenda con horarios disponibles</li>
            <li>📊 Reportes limpios y exportables</li>
          </ul>
        </div>

        <aside className="inicio-card pretty">
          <img
            src="https://www.istockphoto.com/photo/shelves-stacked-with-medicines-gm1150671524-311567098"
            alt="Estantería de farmacia"
          />
          <div className="card-sticker">
            <span className="pill-icon">💊</span>
            <span className="sticker-text">Inventario al día</span>
          </div>
        </aside>
      </section>

      {/* Agenda rápida de Citas */}
      <section className="modules" style={{ marginTop: "-8px" }}>
        <article className="module-card" style={{ gridColumn: "1 / -1" }}>
          <div className="module-icon">🗓️</div>
          <h3 style={{ marginBottom: 10 }}>Agenda rápida</h3>
          <p style={{ marginBottom: 12, color: "var(--muted)" }}>
            Revisa los <strong>horarios disponibles</strong> (09:00–18:00) y
            agenda en un clic.
          </p>

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <label style={{ fontWeight: 700, color: "var(--ink)" }}>
              Fecha:
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid #d6e7e6",
                background: "#fff",
                color: "var(--ink)",
                fontWeight: 600,
              }}
            />
            <button className="chip" onClick={cargarSlots} disabled={cargando}>
              {cargando ? "Actualizando..." : "Actualizar"}
            </button>
            <NavLink to="/citas" className="chip">
              📒 Mis citas
            </NavLink>
          </div>

          {error && (
            <div
              style={{
                background: "#fff3f3",
                border: "1px solid #ffd2d2",
                color: "#b01515",
                padding: "10px 12px",
                borderRadius: 12,
                marginBottom: 12,
                fontWeight: 700,
              }}
            >
              {error}
            </div>
          )}

          {/* grid de slots */}
          <div
            style={{
              display: "grid",
              gap: 8,
              gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
            }}
          >
            {cargando && (
              <span style={{ color: "var(--muted)" }}>
                Cargando horarios…
              </span>
            )}
            {!cargando && slots.length === 0 && (
              <span style={{ color: "var(--muted)" }}>
                No hay horarios disponibles.
              </span>
            )}
            {!cargando &&
              slots.map((d) => (
                <button
                  key={d.toISOString()}
                  className="chip"
                  title="Agendar en este horario"
                  onClick={() =>
                    navigate("/citas/agendar", {
                      state: { preseleccion: d.toISOString().slice(0, 16) }, // yyyy-mm-ddTHH:MM
                    })
                  }
                  style={{ justifySelf: "stretch", textAlign: "center" }}
                >
                  {fmtHora(d)}
                </button>
              ))}
          </div>
        </article>
      </section>

      {/* Quick modules */}
      <section className="modules">
        <article className="module-card">
          <div className="module-icon">💊</div>
          <h3>Medicamentos</h3>
          <p>Alta, edición, advertencias, instrucciones y más.</p>
          <div className="module-actions">
            <NavLink to="/medicamentos/agregar" className="chip">
              ➕ Agregar
            </NavLink>
            <NavLink to="/medicamentos/inventario" className="chip">
              📦 Inventario
            </NavLink>
          </div>
        </article>

        {/* Proveedores / Compras */}
        <article className="module-card">
          <div className="module-icon">🏭</div>
          <h3>Proveedores y compras</h3>
          <p>Registra proveedores y pide medicamentos para surtir stock.</p>
          <div className="module-actions">
            <NavLink to="/proveedores/crear" className="chip">
              ➕ Registrar proveedor
            </NavLink>
            <NavLink to="/proveedores" className="chip">
              📇 Ver proveedores
            </NavLink>
            <NavLink to="/proveedores/pedidos" className="chip">
              🧾 Pedir medicamentos
            </NavLink>
          </div>
        </article>

        {/* 🧾 Pedidos de clientes */}
        <article className="module-card">
          <div className="module-icon">🧾</div>
          <h3>Pedidos</h3>
          <p>Revisa y gestiona los pedidos realizados por los usuarios.</p>
          <div className="module-actions">
            <NavLink to="/pedidos" className="chip">
              📋 Ver pedidos
            </NavLink>
          </div>
        </article>

        <article className="module-card">
          <div className="module-icon">🗓️</div>
          <h3>Citas</h3>
          <p>Agenda con horarios disponibles de 9:00 a 18:00.</p>
          <div className="module-actions">
            <NavLink to="/citas/agendar" className="chip">
              🗓️ Agendar
            </NavLink>
            <NavLink to="/citas" className="chip">
              📒 Mis citas
            </NavLink>
          </div>
        </article>

        <article className="module-card">
          <div className="module-icon">👥</div>
          <h3>Usuarios</h3>
          <p>Control de acceso y roles (Admin / Personal).</p>
          <div className="module-actions">
            <button className="chip" disabled>
              Próximamente
            </button>
          </div>
        </article>

        <article className="module-card">
          <div className="module-icon">📊</div>
          <h3>Reportes</h3>
          <p>Movimientos de stock y precios en el tiempo.</p>
          <div className="module-actions">
            <button className="chip" disabled>
              Próximamente
            </button>
          </div>
        </article>
      </section>
    </>
  );
};

export default InicioAdmin;
