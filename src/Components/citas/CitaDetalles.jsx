import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCitaById, actualizarCita } from "./services/citasApi";

export default function CitaDetalles() {
  const { idCita } = useParams();
  const nav = useNavigate();

  const [cita, setCita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // 🔹 Nuevos estados para el mini-form
  const [observaciones, setObservaciones] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [medicamentos, setMedicamentos] = useState("");

  useEffect(() => {
    const cargarCita = async () => {
      try {
        const data = await getCitaById(idCita);
        setCita(data);

        // Rellenar con lo que ya tenga la cita (por si ya la atendieron antes)
        setObservaciones(data.observaciones || "");
        setDiagnostico(data.diagnostico || "");
        setMedicamentos(data.medicamentos || "");
      } catch (e) {
        setMsg(e.message || "No se pudieron cargar los detalles de la cita.");
      } finally {
        setLoading(false);
      }
    };

    cargarCita();
  }, [idCita]);

  // 🔹 Guardar diagnóstico y marcar como atendida
  const handleAtendida = async (e) => {
    e.preventDefault();
    if (!cita) return;

    try {
      const tipoConsulta = cita.tipoConsulta || "General";

      await actualizarCita(idCita, {
        tipoConsulta,
        notas: cita.notas,
        estatus: "T",
        observaciones,
        diagnostico,
        medicamentos,
      });

      setMsg("Cita marcada como atendida y guardado el diagnóstico.");

      // Actualizar estado local
      setCita((prev) => ({
        ...prev,
        estatus: "T",
        observaciones,
        diagnostico,
        medicamentos,
      }));
    } catch (e) {
      setMsg(e.message || "No se pudo actualizar el estatus.");
    }
  };

  return (
    <>
      {/* 🔹 Topbar simple */}
      <header className="admin-menu">
        <div className="admin-left">
          <div className="admin-logo">
            <span className="logo-badge">⚕</span>
            <div className="logo-text">
              <span className="logo-title">Farmacia</span>
              <span className="logo-subtitle">Panel administrador</span>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "24px auto", padding: "0 16px" }}>
        <h2>Detalles de la cita</h2>

        {/* Botón de regreso */}
        <button
          type="button"
          onClick={() => nav("/citas")}
          className="chip"
          style={{
            marginTop: "6px",
            marginBottom: "14px",
            background: "linear-gradient(90deg, #22c55e, #16a34a)",
            color: "#fff",
            fontWeight: 600,
            border: "none",
            padding: "10px 18px",
            borderRadius: "12px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 4px 14px rgba(16,185,129,0.25)",
          }}
        >
          ← Regresar
        </button>

        {/* Mensajes */}
        {msg && (
          <p
            style={{
              background: "#f7fffe",
              border: "1px solid #d6e7e6",
              padding: 10,
              borderRadius: 12,
              marginBottom: 12,
            }}
          >
            {msg}
          </p>
        )}

        {loading || !cita ? (
          <p>Cargando...</p>
        ) : (
          <div
            className="module-card"
            style={{
              padding: 16,
              backgroundColor: "#fff",
              borderRadius: 12,
              boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
            }}
          >
            <div className="module-icon" style={{ fontSize: "24px" }}>
              🗓️
            </div>

            <strong>{new Date(cita.fechaHora).toLocaleString()}</strong>

            <div style={{ color: "var(--muted)", marginTop: 8 }}>
              Paciente: <b>{cita.nombrePaciente || "Sin nombre"}</b>
              <br />
              Tipo de consulta: <b>{cita.tipoConsulta}</b>
              <br />
              Notas: {cita.notas || "Sin notas"}
              <br />
              Estatus:{" "}
              <b>
                {cita.estatus === "A"
                  ? "Activa"
                  : cita.estatus === "C"
                  ? "Cancelada"
                  : "Terminada"}
              </b>
            </div>

            {/* 🔹 Mini-formulario de atención */}
            <form
              onSubmit={handleAtendida}
              style={{
                marginTop: 16,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div>
                <label style={{ fontWeight: 600 }}>Observaciones</label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: 8,
                    borderRadius: 10,
                    border: "1px solid #d4d4d4",
                    resize: "vertical",
                  }}
                  disabled={cita.estatus !== "A"}
                />
              </div>

              <div>
                <label style={{ fontWeight: 600 }}>Diagnóstico</label>
                <textarea
                  value={diagnostico}
                  onChange={(e) => setDiagnostico(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: 8,
                    borderRadius: 10,
                    border: "1px solid #d4d4d4",
                    resize: "vertical",
                  }}
                  disabled={cita.estatus !== "A"}
                />
              </div>

              <div>
                <label style={{ fontWeight: 600 }}>Medicamentos indicados</label>
                <textarea
                  value={medicamentos}
                  onChange={(e) => setMedicamentos(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: 8,
                    borderRadius: 10,
                    border: "1px solid #d4d4d4",
                    resize: "vertical",
                  }}
                  placeholder="Ej. Paracetamol 500 mg cada 8h por 3 días"
                  disabled={cita.estatus !== "A"}
                />
              </div>

              {cita.estatus === "A" && (
                <button
                  type="submit"
                  style={{
                    background: "#fbbf24",
                    color: "#fff",
                    padding: "10px 18px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    marginTop: "4px",
                    border: "none",
                    fontWeight: 600,
                    alignSelf: "flex-start",
                  }}
                >
                  Marcar como Atendida y Guardar
                </button>
              )}
            </form>
          </div>
        )}
      </div>
    </>
  );
}
