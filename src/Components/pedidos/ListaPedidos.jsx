// src/pedidos/ListaPedidos.jsx
import React, { useEffect, useState } from "react";
import "../inicios/inicio.css";
import { NavLink, useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "https://api-farmacia.ngrok.app";

export default function ListaPedidos() {
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [filtroEstado, setFiltroEstado] = useState("Pendiente");
  const [seleccionadoId, setSeleccionadoId] = useState(null);

  const cargarPedidos = async () => {
    try {
      setCargando(true);
      setError("");
      setMsg("");

      const qs =
        filtroEstado && filtroEstado !== "Todos"
          ? `?estado=${encodeURIComponent(filtroEstado)}`
          : "";

      const resp = await fetch(`${API_URL}/api/Pedidos${qs}`);
      const data = await resp.json().catch(() => []);

      if (!resp.ok) {
        throw new Error(data?.message || "No se pudieron obtener los pedidos.");
      }

      const normalizados = (data || []).map((p) => ({
        id: p.id ?? p.Id,
        clienteNombre: p.clienteNombre ?? p.ClienteNombre ?? "Sin nombre",
        fechaCreacion: p.fechaCreacion ?? p.FechaCreacion,
        estado: p.estado ?? p.Estado ?? "Pendiente",
        total: p.total ?? p.Total ?? 0,
        detalles: p.detalles ?? p.Detalles ?? [],
      }));

      setPedidos(normalizados);
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al cargar pedidos.");
      setPedidos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, [filtroEstado]);

  const fmtFecha = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
  };

  const fmtMoneda = (n) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(n ?? 0);

  const cambiarEstado = async (pedidoId, nuevoEstado) => {
    const textoConfirm = {
      Confirmado: "¿Confirmar este pedido?",
      Rechazado: "¿Rechazar este pedido?",
      Cancelado: "¿Cancelar este pedido?",
    }[nuevoEstado] ?? `¿Cambiar estado a ${nuevoEstado}?`;

    const ok = window.confirm(textoConfirm);
    if (!ok) return;

    try {
      setMsg("");
      const resp = await fetch(
        `${API_URL}/api/Pedidos/${pedidoId}/estado?estado=${encodeURIComponent(
          nuevoEstado
        )}`,
        { method: "PATCH" }
      );

      const data = await resp.json().catch(() => null);

      if (!resp.ok) {
        throw new Error(data?.message || "No se pudo actualizar el estado.");
      }

      setMsg("✅ Estado actualizado correctamente.");

      setPedidos((lista) =>
        lista.map((p) =>
          p.id === pedidoId ? { ...p, estado: nuevoEstado } : p
        )
      );
    } catch (e) {
      console.error(e);
      setMsg(e.message || "❌ Error al cambiar estado.");
    }
  };

  const toggleDetalles = (id) => {
    setSeleccionadoId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      {/* ==== TOPBAR (igual que otros módulos) ==== */}
      <header className="admin-menu">
        <div className="admin-left">
          <div className="admin-logo">
            <span className="logo-badge" aria-hidden="true"></span>
            <div className="logo-text">
              <span className="logo-title">Farmacia</span>
              <span className="logo-subtitle">Panel administrador</span>
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

            <div className="admin-dropdown">
              <span className="admin-link">Pedidos ▾</span>
              <div className="admin-dropdown-content">
                <NavLink to="/pedidos" className="admin-sublink">
                  Ver pedidos
                </NavLink>
              </div>
            </div>

            <div className="admin-dropdown">
              <span className="admin-link">Citas ▾</span>
              <div className="admin-dropdown-content">
                <NavLink to="/citas/agendar" className="admin-sublink">
                  Agendar
                </NavLink>
                <NavLink to="/citas" className="admin-sublink">
                  Mis citas
                </NavLink>
                <NavLink to="/citas/agenda" className="admin-sublink">
                  Agenda del día
                </NavLink>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* ====== CONTENIDO PRINCIPAL ====== */}
      <div style={{ maxWidth: 1150, margin: "26px auto", padding: "0 16px" }}>
        {/* TÍTULO, BOTÓN REGRESAR Y FILTROS */}
        <header style={{ marginBottom: 16 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 28,
              color: "#e5e7eb",
            }}
          >
            Pedidos de usuarios
          </h2>

          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              marginTop: 8,
              marginBottom: 12,
              background: "linear-gradient(90deg,#2563eb,#1d4ed8)", // 💙 azul
              color: "#f9fafb",
              fontWeight: 600,
              border: "none",
              padding: "9px 20px",
              borderRadius: 999,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 10px 28px rgba(37,99,235,0.65)",
              transition:
                "background 0.2s, box-shadow 0.2s, transform 0.1s, filter 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.filter = "brightness(1.08)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.filter = "brightness(1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            ← Regresar
          </button>


          <p
            style={{
              margin: 0,
              color: "#cbd5f5",
              fontSize: 14,
            }}
          >
            Revisa los pedidos realizados desde el catálogo y cambia su estado.
          </p>

          {/* FILTROS */}
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
              marginTop: 14,
            }}
          >
            <label
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#e5e7eb",
              }}
            >
              Estado:
            </label>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="pedidos-select"
            >
              <option value="Pendiente">Pendiente</option>
              <option value="Confirmado">Confirmado</option>
              <option value="Rechazado">Rechazado</option>
              <option value="Cancelado">Cancelado</option>
              <option value="Todos">Todos</option>
            </select>

            <button
              onClick={cargarPedidos}
              disabled={cargando}
              className="pedidos-refresh-btn"
            >
              {cargando ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </header>

        {/* TABLA DE PEDIDOS */}
        <section className="pedidos-card">
          {error && (
            <div className="pedidos-alert pedidos-alert-error">{error}</div>
          )}

          {msg && (
            <div className="pedidos-alert pedidos-alert-ok">{msg}</div>
          )}

          {cargando && (
            <p style={{ color: "#e5e7eb", marginTop: 6 }}>
              Cargando pedidos…
            </p>
          )}

          {!cargando && pedidos.length === 0 && !error && (
            <p style={{ color: "#9ca3af", marginTop: 6 }}>
              No hay pedidos con el estado seleccionado.
            </p>
          )}

          {!cargando && pedidos.length > 0 && (
            <div style={{ overflowX: "auto", marginTop: 6 }}>
              <table className="pedidos-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {pedidos.map((p) => (
                    <React.Fragment key={p.id}>
                      <tr className="pedidos-row-main">
                        <td>{p.clienteNombre}</td>
                        <td>{fmtFecha(p.fechaCreacion)}</td>
                        <td>{fmtMoneda(p.total)}</td>
                        <td>
                          <span
                            className={`pedidos-status pedidos-status-${
                              (p.estado || "Otros").toLowerCase()
                            }`}
                          >
                            {p.estado}
                          </span>
                        </td>

                        <td className="pedidos-actions-cell">
                          <button
                            className="pedidos-chip"
                            onClick={() => toggleDetalles(p.id)}
                          >
                            {seleccionadoId === p.id
                              ? "Ocultar detalles"
                              : "Ver detalles"}
                          </button>

                          {p.estado !== "Confirmado" && (
                            <button
                              className="pedidos-chip pedidos-chip-ok"
                              onClick={() => cambiarEstado(p.id, "Confirmado")}
                            >
                              ✅ Confirmar
                            </button>
                          )}

                          {p.estado !== "Rechazado" && (
                            <button
                              className="pedidos-chip pedidos-chip-bad"
                              onClick={() => cambiarEstado(p.id, "Rechazado")}
                            >
                              ❌ Rechazar
                            </button>
                          )}

                          {p.estado !== "Cancelado" && (
                            <button
                              className="pedidos-chip pedidos-chip-neutral"
                              onClick={() => cambiarEstado(p.id, "Cancelado")}
                            >
                              🛑 Cancelar
                            </button>
                          )}
                        </td>
                      </tr>

                      {seleccionadoId === p.id && (
                        <tr className="pedidos-row-detalle">
                          <td colSpan={6}>
                            {!p.detalles || p.detalles.length === 0 ? (
                              <p className="pedidos-detalle-empty">
                                Sin detalles de productos.
                              </p>
                            ) : (
                              <div>
                                <p className="pedidos-detalle-title">
                                  Productos:
                                </p>
                                <ul className="pedidos-detalle-list">
                                  {p.detalles.map((d, idx) => (
                                    <li key={idx} className="pedidos-detalle-item">
                                      <span>
                                        {d.medicamentoNombre ??
                                          d.MedicamentoNombre}{" "}
                                        × {d.cantidad ?? d.Cantidad}
                                      </span>
                                      <span>
                                        {fmtMoneda(
                                          d.subtotal ?? d.Subtotal
                                        )}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ====== ESTILOS LOCALES ====== */}
        <style>{`
          .pedidos-card {
            background: radial-gradient(circle at top left,#020617 0,#020617 50%,#000814 100%);
            border-radius: 22px;
            padding: 18px 20px 20px;
            border: 1px solid rgba(148,163,184,0.6);
            box-shadow:
              0 0 0 1px rgba(15,23,42,0.9),
              0 18px 40px rgba(15,23,42,0.9);
            color: #e5e7eb;
          }

          .pedidos-alert {
            border-radius: 12px;
            padding: 8px 10px;
            margin-bottom: 10px;
            font-weight: 600;
            font-size: 14px;
          }
          .pedidos-alert-error {
            background: rgba(239,68,68,0.12);
            border: 1px solid rgba(248,113,113,0.9);
            color: #fecaca;
          }
          .pedidos-alert-ok {
            background: rgba(22,163,74,0.12);
            border: 1px solid rgba(52,211,153,0.9);
            color: #bbf7d0;
          }

          .pedidos-select {
            padding: 7px 12px;
            border-radius: 999px;
            border: 1px solid rgba(148,163,184,0.8);
            font-size: 14px;
            background: rgba(15,23,42,0.95);
            color: #e5e7eb;
            outline: none;
            backdrop-filter: blur(12px);
          }
          .pedidos-select option {
            background: #020617;
            color: #f9fafb;
          }

          .pedidos-refresh-btn {
          padding: 8px 16px;
          border-radius: 999px;
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          color: #f9fafb;
          background: linear-gradient(90deg,#2563eb,#1d4ed8); /* 💙 azul */
          box-shadow: 0 8px 20px rgba(37,99,235,0.6);
          transition: filter 0.2s, transform 0.1s;
        }
        .pedidos-refresh-btn:hover:not(:disabled) {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }

          .pedidos-refresh-btn:disabled {
            opacity: 0.6;
            cursor: default;
            box-shadow: none;
          }

          .pedidos-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
          }
          .pedidos-table thead tr {
            background: linear-gradient(90deg,rgba(15,23,42,0.95),rgba(30,64,175,0.95));
          }
          .pedidos-table th {
            padding: 10px 8px;
            text-align: left;
            font-weight: 600;
            color: #e5e7eb;
            border-bottom: 1px solid rgba(148,163,184,0.45);
          }
          .pedidos-row-main td {
            padding: 9px 8px;
            border-bottom: 1px solid rgba(30,64,175,0.35);
          }
          .pedidos-row-main:nth-child(even) {
            background: rgba(15,23,42,0.82);
          }
          .pedidos-row-main:nth-child(odd) {
            background: rgba(15,23,42,0.75);
          }

          .pedidos-actions-cell {
            padding: 8px 6px;
            white-space: nowrap;
          }

          .pedidos-chip {
            border-radius: 999px;
            border: 1px solid rgba(148,163,184,0.9);
            padding: 4px 10px;
            font-size: 12px;
            background: rgba(15,23,42,0.9);
            color: #e5e7eb;
            cursor: pointer;
            margin-right: 4px;
            margin-bottom: 4px;
            transition: background 0.2s, border-color 0.2s, transform 0.1s;
          }
          .pedidos-chip:hover {
            background: rgba(30,64,175,0.9);
            border-color: rgba(96,165,250,0.9);
            transform: translateY(-1px);
          }

          .pedidos-chip-ok {
            background: rgba(22,163,74,0.15);
            border-color: rgba(74,222,128,0.85);
            color: #bbf7d0;
          }
          .pedidos-chip-ok:hover {
            background: rgba(22,163,74,0.4);
          }

          .pedidos-chip-bad {
            background: rgba(220,38,38,0.15);
            border-color: rgba(248,113,113,0.85);
            color: #fecaca;
          }
          .pedidos-chip-bad:hover {
            background: rgba(220,38,38,0.35);
          }

          .pedidos-chip-neutral {
            background: rgba(148,163,184,0.18);
            border-color: rgba(148,163,184,0.85);
            color: #e5e7eb;
          }
          .pedidos-chip-neutral:hover {
            background: rgba(148,163,184,0.35);
          }

          .pedidos-status {
            padding: 3px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 600;
          }
          .pedidos-status-pendiente {
            background: rgba(252,211,77,0.16);
            color: #facc15;
            border: 1px solid rgba(234,179,8,0.8);
          }
          .pedidos-status-confirmado {
            background: rgba(34,197,94,0.18);
            color: #bbf7d0;
            border: 1px solid rgba(52,211,153,0.9);
          }
          .pedidos-status-rechazado {
            background: rgba(248,113,113,0.16);
            color: #fecaca;
            border: 1px solid rgba(248,113,113,0.9);
          }
          .pedidos-status-cancelado {
            background: rgba(148,163,184,0.24);
            color: #e5e7eb;
            border: 1px solid rgba(148,163,184,0.9);
          }

          .pedidos-row-detalle td {
            padding: 8px 10px 10px;
            background: radial-gradient(circle at top left,#020617,#020617 60%,#020617);
            border-bottom-left-radius: 12px;
            border-bottom-right-radius: 12px;
          }

          .pedidos-detalle-empty {
            margin: 0;
            font-size: 13px;
            color: #9ca3af;
          }
          .pedidos-detalle-title {
            margin: 0 0 6px;
            font-size: 13px;
            font-weight: 600;
            color: #e5e7eb;
          }
          .pedidos-detalle-list {
            list-style: none;
            margin: 0;
            padding: 0;
            font-size: 13px;
          }
          .pedidos-detalle-item {
            display: flex;
            justify-content: space-between;
            padding: 2px 0;
            color: #e5e7eb;
          }

          @media (max-width: 768px) {
            .pedidos-actions-cell {
              white-space: normal;
            }
          }
        `}</style>
      </div>
    </>
  );
}
