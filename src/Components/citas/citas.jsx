import React, { useEffect, useState } from "react";
import { cancelarCita, getMisCitas, actualizarCita } from "./services/citasApi";
import { useNavigate } from "react-router-dom";
import "../inicios/inicio.css"; // para admin-menu, etc.

export default function Citas() {
  const [citas, setCitas] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const nav = useNavigate();

  // Cargar citas
  async function cargar() {
    setLoading(true);
    setMsg("");
    try {
      const lista = await getMisCitas({ estado: filtroEstado });
      setCitas(lista);
    } catch (e) {
      setMsg(e.message || "No se pudieron cargar tus citas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, [filtroEstado]);

  // Cancelar cita
  const handleCancelar = async (id) => {
    if (!confirm("¿Cancelar esta cita?")) return;
    try {
      await cancelarCita(id);
      setMsg("Cita cancelada.");
      cargar();
    } catch (e) {
      setMsg(e.message || "No se pudo cancelar.");
    }
  };

  // Activar cita
  const handleActivar = async (id) => {
    try {
      await actualizarCita(id, {
        tipoConsulta: "General",
        notas: "",
        estatus: "A",
      });
      setMsg("Cita marcada como activa.");
      cargar();
    } catch (e) {
      setMsg(e.message || "No se pudo actualizar.");
    }
  };

  // Atender cita
  const handleAtender = (id) => {
    nav(`/citas/detalles/${id}`);
  };

  // Ver diagnóstico
  const handleDiagnostico = (id) => {
    nav(`/citas/detalles/${id}`);
  };

  const textoEstado = (estatus) => {
    if (estatus === "C") return "Cancelada";
    if (estatus === "A") return "Activa";
    if (estatus === "T") return "Terminada";
    return "Pendiente";
  };

  return (
    <>
      {/* 🔹 Topbar */}
      <header className="admin-menu">
        <div className="admin-left">
          <div className="admin-logo">
            <span className="logo-badge"></span>
            <div className="logo-text">
              <span className="logo-title">Farmacia</span>
              <span className="logo-subtitle">Panel administrador</span>
            </div>
          </div>
        </div>
      </header>

      {/* 🔹 Contenido principal */}
      <div style={{ maxWidth: 1100, margin: "24px auto", padding: "0 16px" }}>
        {/* Header: título + regresar + filtro */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div>
            <h2 style={{ margin: 0, color: "#e5e7eb" }}>Mis citas</h2>
            <p
              style={{
                margin: "4px 0 0",
                color: "#9ca3af",
                fontSize: 14,
              }}
            >
              Administra las citas de los usuarios, cambia su estado y registra
              diagnósticos.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "center",
            }}
          >
            {/* Botón Regresar (azul) */}
            <button
              type="button"
              onClick={() => nav("/inicioAdmin")}
              className="chip"
              style={{
                background: "linear-gradient(90deg, #2563eb, #1d4ed8)",
                color: "#ffffff",
                fontWeight: 600,
                border: "none",
                padding: "9px 16px",
                borderRadius: 999,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
              }}
            >
              ← Regresar
            </button>

            {/* Filtro de estado */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
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
                style={{
                  padding: "7px 14px",
                  borderRadius: 999,
                  border: "1px solid #d4d4d8",
                  fontSize: 14,
                  cursor: "pointer",
                  background: "#e5e7eb",
                  color: "#0f172a",
                }}
              >
                <option value="Todos">Todos</option>
                <option value="A">Activa</option>
                <option value="C">Cancelada</option>
                <option value="T">Terminada</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mensaje */}
        {msg && (
          <p
            style={{
              background: "#ecfdf5",
              border: "1px solid #bbf7d0",
              padding: 10,
              borderRadius: 12,
              fontSize: 14,
              color: "#166534",
              marginBottom: 14,
            }}
          >
            {msg}
          </p>
        )}

        {/* Lista de citas */}
        <div
          style={{
            display: "grid",
            gap: 14,
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          }}
        >
          {!loading && citas.length === 0 && (
            <p
              style={{
                color: "#9ca3af",
                fontSize: 14,
                gridColumn: "1 / -1",
              }}
            >
              No hay citas con el filtro seleccionado.
            </p>
          )}

          {loading && (
            <p
              style={{
                color: "#9ca3af",
                fontSize: 14,
                gridColumn: "1 / -1",
              }}
            >
              Cargando citas…
            </p>
          )}

          {citas.map((c) => {
            const f = new Date(c.fechaHora);
            const dia = f.toLocaleDateString();
            const hora = f.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            const estatus = c.estatus;
            const texto = textoEstado(estatus);
            const nombrePaciente =
              c.nombrePaciente ?? c.NombrePaciente ?? "Sin nombre";

            const badgeColors =
              estatus === "A"
                ? { bg: "#dcfce7", color: "#166534" }
                : estatus === "C"
                ? { bg: "#fee2e2", color: "#b91c1c" }
                : estatus === "T"
                ? { bg: "#dbeafe", color: "#1d4ed8" }
                : { bg: "#fef9c3", color: "#854d0e" };

            return (
              <div
                key={c.idCita}
                className="module-card"
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: 16,
                  alignItems: "flex-start",
                  padding: 18,
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(239,246,255,0.96))",
                  borderRadius: 26,
                  boxShadow: "0 16px 45px rgba(15,23,42,0.35)",
                  color: "#0f172a", // 🔹 texto oscuro dentro de la tarjeta
                }}
              >
                {/* Icono calendario */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "999px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    boxShadow: "0 6px 18px rgba(37,99,235,0.35)",
                  }}
                >
                  🗓️
                </div>

                {/* Info + acciones */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {/* Fecha y estado */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <strong
                        style={{
                          fontSize: 16,
                          color: "#0f172a",
                        }}
                      >
                        {dia} · {hora}
                      </strong>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#6b7280",
                        }}
                      >
                        {c.tipoConsulta} ·{" "}
                        <span
                          style={{
                            padding: "2px 10px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 600,
                            background: badgeColors.bg,
                            color: badgeColors.color,
                            boxShadow: "0 4px 10px rgba(15,23,42,0.18)",
                          }}
                        >
                          {texto}
                        </span>
                      </div>
                      {/* 🔹 Nombre del paciente */}
                      <div
                        style={{
                          fontSize: 13,
                          color: "#6b7280",
                          marginTop: 4,
                        }}
                      >
                        Paciente:{" "}
                        <b style={{ color: "#0f172a" }}>{nombrePaciente}</b>
                      </div>
                    </div>
                  </div>

                  {/* Botones */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 10,
                      marginTop: 10,
                    }}
                  >
                    <button
                      className="chip"
                      onClick={() => handleActivar(c.idCita)}
                      disabled={estatus === "A"}
                      style={{
                        background:
                          "linear-gradient(135deg,#22c55e,#16a34a)",
                        color: "#ffffff",
                        border: "none",
                        padding: "8px 18px",
                        fontSize: 13,
                        fontWeight: 600,
                        borderRadius: 999,
                        boxShadow: "0 6px 18px rgba(22,163,74,0.45)",
                        opacity: estatus === "A" ? 0.6 : 1,
                      }}
                    >
                      ✔ Aceptar
                    </button>

                    <button
                      className="chip"
                      onClick={() => handleCancelar(c.idCita)}
                      disabled={estatus === "C"}
                      style={{
                        background:
                          "linear-gradient(135deg,#fb7185,#f97373)",
                        color: "#ffffff",
                        border: "none",
                        padding: "8px 18px",
                        fontSize: 13,
                        fontWeight: 600,
                        borderRadius: 999,
                        boxShadow: "0 6px 18px rgba(239,68,68,0.45)",
                        opacity: estatus === "C" ? 0.6 : 1,
                      }}
                    >
                      ✖ Cancelar
                    </button>

                    <button
                      className="chip"
                      onClick={() => handleAtender(c.idCita)}
                      disabled={estatus === "T" || estatus === "C"}
                      style={{
                        background:
                          "linear-gradient(135deg,#facc15,#fbbf24)",
                        color: "#ffffff",
                        border: "none",
                        padding: "8px 18px",
                        fontSize: 13,
                        fontWeight: 600,
                        borderRadius: 999,
                        boxShadow: "0 6px 18px rgba(234,179,8,0.45)",
                        opacity:
                          estatus === "T" || estatus === "C" ? 0.6 : 1,
                      }}
                    >
                      ✔ Atender
                    </button>

                    <button
                      className="chip"
                      onClick={() => handleDiagnostico(c.idCita)}
                      disabled={estatus !== "T"}
                      style={{
                        background:
                          "linear-gradient(135deg,#38bdf8,#2563eb)",
                        color: "#ffffff",
                        border: "none",
                        padding: "8px 18px",
                        fontSize: 13,
                        fontWeight: 600,
                        borderRadius: 999,
                        boxShadow: "0 6px 18px rgba(37,99,235,0.45)",
                        opacity: estatus !== "T" ? 0.6 : 1,
                      }}
                    >
                      📝 Diagnóstico
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
