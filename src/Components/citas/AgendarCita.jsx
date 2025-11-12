// src/Components/citas/AgendarCita.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CitaForm from "./__CitaForm.jsx";
import { crearCita } from "./services/citasApi";

export default function AgendarCita() {
  const nav = useNavigate();
  const { state } = useLocation();
  const pre = state?.preseleccion || ""; // "YYYY-MM-DDTHH:MM"

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async ({ fechaHora, tipoConsulta, notas }) => {
    try {
      setLoading(true);
      setMsg("");

      // ENVÍO COMO HORA LOCAL (si tu API espera UTC, usa: const fechaHora = new Date(fechaHora).toISOString();)
      await crearCita({ fechaHora, tipoConsulta, notas });

      setMsg("Cita creada correctamente.");
      setTimeout(() => nav("/citas"), 700);
    } catch (e) {
      setMsg(e.message || "No se pudo crear la cita.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modules" style={{ paddingTop: 24 }}>
      <article className="module-card" style={{ gridColumn: "1 / -1", maxWidth: 640 }}>
        <div className="module-icon">🗓️</div>
        <h3>Agendar cita</h3>
        <p style={{ color: "var(--muted)" }}>Horarios válidos: 09:00–18:00.</p>

        <CitaForm initial={{ fechaHora: pre }} onSubmit={onSubmit} submitting={loading} />

        {msg && (
          <div style={{ marginTop: 10, background: "#f7fffe", border: "1px solid #d6e7e6", padding: 10, borderRadius: 12 }}>
            {msg}
          </div>
        )}
      </article>
    </div>
  );
}
