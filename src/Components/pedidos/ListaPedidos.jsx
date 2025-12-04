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
                <NavLink to="/proveedores/pedidos" className="admin-sublink">
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
      <main className="pedidos-page">
        {/* TÍTULO, BOTÓN REGRESAR Y FILTROS */}
        <header className="pedidos-header">
          <div>
            <h1>Pedidos de usuarios</h1>
            <p>
              Revisa los pedidos realizados desde el catálogo y actualiza su
              estado.
            </p>
          </div>

          <button
            type="button"
            className="btn-back"
            onClick={() => navigate(-1)}
          >
            ← Regresar
          </button>
        </header>

        <section className="pedidos-filtros">
          <div className="pedidos-filtros-left">
            <span className="pedidos-filtros-label">Estado:</span>

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

          <span className="pedidos-filtros-hint">
            Filtra por estado para enfocarte en los pedidos que necesitas
            revisar.
          </span>
        </section>

        {/* TARJETA TABLA DE PEDIDOS */}
        <section className="pedidos-card">
          <div className="pedidos-card-header">
            <div className="pedidos-icon">🧾</div>
            <div>
              <h2>Listado de pedidos</h2>
              <p>
                Consulta el resumen de cada pedido, revisa sus productos y
                cambia el estado con un clic.
              </p>
            </div>
          </div>

          {error && (
            <div className="pedidos-alert pedidos-alert-error">{error}</div>
          )}

          {msg && <div className="pedidos-alert pedidos-alert-ok">{msg}</div>}

          {cargando && (
            <p className="pedidos-loading">Cargando pedidos…</p>
          )}

          {!cargando && pedidos.length === 0 && !error && (
            <p className="pedidos-empty">
              No hay pedidos con el estado seleccionado.
            </p>
          )}

          {!cargando && pedidos.length > 0 && (
            <div className="pedidos-table-wrap">
              <table className="pedidos-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th style={{ textAlign: "right" }}>Acciones</th>
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
                            className={`pedidos-status pedidos-status-${(
                              p.estado || "otros"
                            ).toLowerCase()}`}
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
                              onClick={() =>
                                cambiarEstado(p.id, "Confirmado")
                              }
                            >
                              ✅ Confirmar
                            </button>
                          )}

                          {p.estado !== "Rechazado" && (
                            <button
                              className="pedidos-chip pedidos-chip-bad"
                              onClick={() =>
                                cambiarEstado(p.id, "Rechazado")
                              }
                            >
                              ❌ Rechazar
                            </button>
                          )}

                          {p.estado !== "Cancelado" && (
                            <button
                              className="pedidos-chip pedidos-chip-neutral"
                              onClick={() =>
                                cambiarEstado(p.id, "Cancelado")
                              }
                            >
                              🛑 Cancelar
                            </button>
                          )}
                        </td>
                      </tr>

                      {seleccionadoId === p.id && (
                        <tr className="pedidos-row-detalle">
                          <td colSpan={5}>
                            {!p.detalles || p.detalles.length === 0 ? (
                              <p className="pedidos-detalle-empty">
                                Sin detalles de productos.
                              </p>
                            ) : (
                              <div>
                                <p className="pedidos-detalle-title">
                                  Productos del pedido
                                </p>
                                <ul className="pedidos-detalle-list">
                                  {p.detalles.map((d, idx) => (
                                    <li
                                      key={idx}
                                      className="pedidos-detalle-item"
                                    >
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
          .pedidos-page {
            max-width: 1150px;
            margin: 28px auto 40px;
            padding: 0 18px;
            color: #0f172a;
          }

          .pedidos-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 14px;
          }

          .pedidos-header h1 {
            margin: 0;
            font-size: 28px;
            color: #ffffff;
          }

          .pedidos-header p {
            margin: 4px 0 0;
            font-size: 14px;
            color: #ffffff;
          }

          .btn-back {
            background: linear-gradient(90deg,#0ea5e9,#3b82f6);
            color: #ffffff;
            border: none;
            padding: 9px 18px;
            border-radius: 999px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 10px 22px rgba(37,99,235,0.4);
          }
          .btn-back:hover {
            filter: brightness(1.05);
            transform: translateY(-1px);
          }

          .pedidos-filtros {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            margin-bottom: 12px;
            flex-wrap: wrap;
          }

          .pedidos-filtros-left {
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
          }

          .pedidos-filtros-label {
            font-size: 14px;
            font-weight: 600;
            color: #111827;
          }

          .pedidos-filtros-hint {
            font-size: 12px;
            color: #9ca3af;
          }

          .pedidos-card {
            background: linear-gradient(145deg,#ffffff,#f3f4f6);
            border-radius: 22px;
            padding: 18px 20px 20px;
            border: 1px solid rgba(148,163,184,0.6);
            box-shadow:
              0 0 0 1px rgba(148,163,184,0.18),
              0 18px 40px rgba(15,23,42,0.15);
          }

          .pedidos-card-header {
            display: flex;
            gap: 10px;
            align-items: center;
            margin-bottom: 10px;
          }

          .pedidos-card-header h2 {
            margin: 0;
            font-size: 20px;
            color: #111827;
          }

          .pedidos-card-header p {
            margin: 2px 0 0;
            font-size: 13px;
            color: #6b7280;
          }

          .pedidos-icon {
            width: 40px;
            height: 40px;
            border-radius: 999px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            background: radial-gradient(circle at 30% 20%, #4ade80, #2563eb);
            color: #f9fafb;
            box-shadow: 0 10px 20px rgba(37,99,235,0.5);
          }

          .pedidos-alert {
            border-radius: 12px;
            padding: 8px 10px;
            margin-bottom: 10px;
            font-weight: 600;
            font-size: 13px;
          }
          .pedidos-alert-error {
            background: rgba(248,113,113,0.1);
            border: 1px solid rgba(220,38,38,0.75);
            color: #b91c1c;
          }
          .pedidos-alert-ok {
            background: rgba(34,197,94,0.12);
            border: 1px solid rgba(22,163,74,0.8);
            color: #166534;
          }

          .pedidos-loading {
            margin: 4px 0 0;
            font-size: 14px;
            color: #4b5563;
          }

          .pedidos-empty {
            margin: 4px 0 0;
            font-size: 14px;
            color: #9ca3af;
          }

          .pedidos-select {
            padding: 7px 12px;
            border-radius: 999px;
            border: 1px solid #cbd5e1;
            font-size: 14px;
            background: #ffffff;
            color: #111827;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          .pedidos-select:focus {
            border-color: #3b82f6;
            box-shadow:
              0 0 0 1px rgba(59,130,246,0.2),
              0 0 0 4px rgba(191,219,254,0.75);
          }

          .pedidos-refresh-btn {
            padding: 8px 16px;
            border-radius: 999px;
            border: none;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            color: #f9fafb;
            background: linear-gradient(90deg,#2563eb,#1d4ed8);
            box-shadow: 0 8px 20px rgba(37,99,235,0.45);
            transition: filter 0.2s, transform 0.1s;
          }
          .pedidos-refresh-btn:hover:not(:disabled) {
            filter: brightness(1.07);
            transform: translateY(-1px);
          }
          .pedidos-refresh-btn:disabled {
            opacity: 0.7;
            cursor: default;
            box-shadow: none;
          }

          .pedidos-table-wrap {
            overflow-x: auto;
            margin-top: 8px;
          }

          .pedidos-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
            background: #ffffff;
            border-radius: 18px;
            overflow: hidden;
          }

          .pedidos-table thead tr {
            background: #e5edff;
          }
          .pedidos-table th {
            padding: 10px 8px;
            text-align: left;
            font-weight: 600;
            color: #111827;
            border-bottom: 1px solid #d1d5db;
          }
          .pedidos-table td {
            padding: 9px 8px;
            border-bottom: 1px solid #e5e7eb;
            color: #111827;
          }

          .pedidos-row-main:nth-child(even) {
            background: #f9fafb;
          }

          .pedidos-actions-cell {
            text-align: right;
            padding-right: 10px;
            white-space: nowrap;
          }

          .pedidos-chip {
            border-radius: 999px;
            border: 1px solid #cbd5e1;
            padding: 4px 10px;
            font-size: 12px;
            background: #f9fafb;
            color: #111827;
            cursor: pointer;
            margin-left: 4px;
            margin-bottom: 4px;
            transition: background 0.2s, border-color 0.2s, transform 0.1s;
          }
          .pedidos-chip:hover {
            background: #e5edff;
            border-color: #93c5fd;
            transform: translateY(-1px);
          }

          .pedidos-chip-ok {
            background: #ecfdf3;
            border-color: #4ade80;
            color: #166534;
          }
          .pedidos-chip-ok:hover {
            background: #bbf7d0;
          }

          .pedidos-chip-bad {
            background: #fef2f2;
            border-color: #f87171;
            color: #b91c1c;
          }
          .pedidos-chip-bad:hover {
            background: #fecaca;
          }

          .pedidos-chip-neutral {
            background: #f3f4f6;
            border-color: #9ca3af;
            color: #374151;
          }
          .pedidos-chip-neutral:hover {
            background: #e5e7eb;
          }

          .pedidos-status {
            padding: 3px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 600;
          }
          .pedidos-status-pendiente {
            background: #fef9c3;
            color: #854d0e;
            border: 1px solid #facc15;
          }
          .pedidos-status-confirmado {
            background: #dcfce7;
            color: #166534;
            border: 1px solid #4ade80;
          }
          .pedidos-status-rechazado {
            background: #fee2e2;
            color: #b91c1c;
            border: 1px solid #f87171;
          }
          .pedidos-status-cancelado {
            background: #e5e7eb;
            color: #374151;
            border: 1px solid #9ca3af;
          }

          .pedidos-row-detalle td {
            padding: 10px 12px 12px;
            background: #f9fafb;
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
            color: #111827;
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
            color: #111827;
          }

          @media (max-width: 768px) {
            .pedidos-header {
              flex-direction: column;
              align-items: flex-start;
            }
            .pedidos-actions-cell {
              white-space: normal;
            }
          }
        `}</style>
      </main>
    </>
  );
}
