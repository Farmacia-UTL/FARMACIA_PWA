import React, { useEffect, useState } from "react";
import "../inicios/inicio.css"; // reutilizamos estilos base

const API_URL = import.meta.env.VITE_API_URL || "https://api-farmacia.ngrok.app";

export default function ListaPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [filtroEstado, setFiltroEstado] = useState("Pendiente"); // por defecto pendientes
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

      // normalizar
      const normalizados = (data || []).map((p) => ({
        id: p.id ?? p.Id,
        clienteNombre: p.clienteNombre ?? p.ClienteNombre ?? "Sin nombre",
        fechaCreacion: p.fechaCreacion ?? p.FechaCreacion,
        estado: p.estado ?? p.Estado ?? "Pendiente",
        total: p.total ?? p.Total ?? 0,
        detalles:
          p.detalles ??
          p.Detalles ??
          [],
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // actualizar en memoria
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
    <div style={{ maxWidth: 1150, margin: "24px auto", padding: "0 16px" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Pedidos de usuarios</h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
            Revisa los pedidos realizados desde el catálogo y cambia su estado.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <label style={{ fontSize: 14, fontWeight: 600 }}>Estado:</label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid #d4d4d8",
              fontSize: 14,
            }}
          >
            <option value="Pendiente">Pendiente</option>
            <option value="Confirmado">Confirmado</option>
            <option value="Rechazado">Rechazado</option>
            <option value="Cancelado">Cancelado</option>
            <option value="Todos">Todos</option>
          </select>

          <button className="chip" onClick={cargarPedidos} disabled={cargando}>
            {cargando ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </header>

      <section
        className="card"
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 10px 25px rgba(15,23,42,0.08)",
        }}
      >
        {error && (
          <div
            style={{
              background: "#fff3f3",
              borderRadius: 12,
              border: "1px solid #fecaca",
              padding: "8px 10px",
              marginBottom: 10,
              color: "#b91c1c",
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        {msg && (
          <div
            style={{
              background: "#ecfdf5",
              borderRadius: 12,
              border: "1px solid #bbf7d0",
              padding: "8px 10px",
              marginBottom: 10,
              color: "#166534",
              fontWeight: 600,
            }}
          >
            {msg}
          </div>
        )}

        {cargando && <p>Cargando pedidos…</p>}

        {!cargando && pedidos.length === 0 && !error && (
          <p style={{ color: "#64748b" }}>
            No hay pedidos con el estado seleccionado.
          </p>
        )}

        {!cargando && pedidos.length > 0 && (
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
                    borderBottom: "1px solid #e5e7eb",
                    background: "#f8fafc",
                  }}
                >
                  <th style={{ padding: "8px 6px", textAlign: "left" }}>ID</th>
                  <th style={{ padding: "8px 6px", textAlign: "left" }}>
                    Cliente
                  </th>
                  <th style={{ padding: "8px 6px", textAlign: "left" }}>
                    Fecha
                  </th>
                  <th style={{ padding: "8px 6px", textAlign: "left" }}>
                    Total
                  </th>
                  <th style={{ padding: "8px 6px", textAlign: "left" }}>
                    Estado
                  </th>
                  <th style={{ padding: "8px 6px", textAlign: "left" }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <React.Fragment key={p.id}>
                    <tr
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <td style={{ padding: "8px 6px" }}>#{p.id}</td>
                      <td style={{ padding: "8px 6px" }}>{p.clienteNombre}</td>
                      <td style={{ padding: "8px 6px" }}>
                        {fmtFecha(p.fechaCreacion)}
                      </td>
                      <td style={{ padding: "8px 6px" }}>
                        {fmtMoneda(p.total)}
                      </td>
                      <td style={{ padding: "8px 6px" }}>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 600,
                            background:
                              p.estado === "Pendiente"
                                ? "#fef9c3"
                                : p.estado === "Confirmado"
                                ? "#dcfce7"
                                : p.estado === "Rechazado"
                                ? "#fee2e2"
                                : "#e5e7eb",
                            color:
                              p.estado === "Pendiente"
                                ? "#854d0e"
                                : p.estado === "Confirmado"
                                ? "#166534"
                                : p.estado === "Rechazado"
                                ? "#b91c1c"
                                : "#374151",
                          }}
                        >
                          {p.estado}
                        </span>
                      </td>
                      <td style={{ padding: "8px 6px" }}>
                        <button
                          className="chip"
                          onClick={() => toggleDetalles(p.id)}
                          style={{ marginRight: 4, marginBottom: 4 }}
                        >
                          {seleccionadoId === p.id
                            ? "Ocultar detalles"
                            : "Ver detalles"}
                        </button>

                        {p.estado !== "Confirmado" && (
                          <button
                            className="chip"
                            onClick={() =>
                              cambiarEstado(p.id, "Confirmado")
                            }
                            style={{
                              marginRight: 4,
                              marginBottom: 4,
                              background: "#dcfce7",
                              borderColor: "#bbf7d0",
                              color: "#166534",
                            }}
                          >
                            ✅ Confirmar
                          </button>
                        )}

                        {p.estado !== "Rechazado" && (
                          <button
                            className="chip"
                            onClick={() =>
                              cambiarEstado(p.id, "Rechazado")
                            }
                            style={{
                              marginRight: 4,
                              marginBottom: 4,
                              background: "#fee2e2",
                              borderColor: "#fecaca",
                              color: "#b91c1c",
                            }}
                          >
                            ❌ Rechazar
                          </button>
                        )}

                        {p.estado !== "Cancelado" && (
                          <button
                            className="chip"
                            onClick={() =>
                              cambiarEstado(p.id, "Cancelado")
                            }
                            style={{
                              marginRight: 4,
                              marginBottom: 4,
                              background: "#e5e7eb",
                              borderColor: "#d4d4d8",
                              color: "#374151",
                            }}
                          >
                            🛑 Cancelar
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Fila de detalles */}
                    {seleccionadoId === p.id && (
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            background: "#f9fafb",
                            padding: "8px 8px 10px",
                          }}
                        >
                          {(!p.detalles || p.detalles.length === 0) && (
                            <p
                              style={{
                                margin: 0,
                                fontSize: 13,
                                color: "#64748b",
                              }}
                            >
                              Sin detalles de productos.
                            </p>
                          )}
                          {p.detalles && p.detalles.length > 0 && (
                            <div>
                              <p
                                style={{
                                  margin: "0 0 6px",
                                  fontSize: 13,
                                  fontWeight: 600,
                                }}
                              >
                                Productos:
                              </p>
                              <ul
                                style={{
                                  listStyle: "none",
                                  margin: 0,
                                  padding: 0,
                                  fontSize: 13,
                                }}
                              >
                                {p.detalles.map((d, idx) => (
                                  <li
                                    key={idx}
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      padding: "2px 0",
                                    }}
                                  >
                                    <span>
                                      {d.medicamentoNombre ??
                                        d.MedicamentoNombre ??
                                        ""}{" "}
                                      ×{" "}
                                      {d.cantidad ?? d.Cantidad ?? 0}
                                    </span>
                                    <span>
                                      {fmtMoneda(
                                        d.subtotal ?? d.Subtotal ?? 0
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
    </div>
  );
}
