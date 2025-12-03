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

  // onSubmit recibe { fecha, hora, tipoConsulta, notas, nombrePaciente }
  const onSubmit = async ({
    fecha,
    hora,
    tipoConsulta,
    notas,
    nombrePaciente,
  }) => {
    try {
      setLoading(true);
      setMsg("");

      const fechaHora = `${fecha}T${hora}`;

      await crearCita({
        fechaHora,
        tipoConsulta,
        notas,
        nombrePaciente,
      });

      setMsg("Cita creada correctamente.");
      setTimeout(() => nav("/citas"), 700);
    } catch (e) {
      setMsg(e.message || "No se pudo crear la cita.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "32px auto",
        padding: "0 16px",
      }}
    >
      <h2
        style={{
          fontSize: 28,
          color: "#e5e7eb",
          marginBottom: 4,
        }}
      >
        Agendar cita
      </h2>
      <p
        style={{
          marginTop: 0,
          marginBottom: 10,
          fontSize: 14,
          color: "#9ca3af",
        }}
      >
        Elige al paciente, la fecha, un horario disponible y el tipo de
        consulta.
      </p>

      {/* Botón de regreso (azul) */}
      <button
        type="button"
        onClick={() => nav(-1)}
        className="chip"
        style={{
          marginTop: "4px",
          marginBottom: "24px",
          background: "linear-gradient(90deg, #2563eb, #1d4ed8)",
          color: "#fff",
          fontWeight: 600,
          border: "none",
          padding: "9px 18px",
          borderRadius: "999px",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
        }}
      >
        ← Regresar
      </button>

      {/* CARD CENTRADA TIPO MEDICAMENTOS */}
      <article
        className="module-card"
        style={{
          maxWidth: 720,
          margin: "0 auto", // 👉 centrado
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(239,246,255,0.99))",
          padding: 22,
          borderRadius: 28,
          border: "1px solid rgba(191, 219, 254, 0.8)",
          boxShadow:
            "0 0 0 1px rgba(37,99,235,0.10), 0 20px 50px rgba(15,23,42,0.55)",
          color: "#0f172a",
        }}
      >
        <div
          className="module-icon"
          style={{
            fontSize: 28,
            marginBottom: 10,
            width: 52,
            height: 52,
            borderRadius: "999px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "radial-gradient(circle at 30% 20%, #4ade80, #2563eb)",
            color: "#eff6ff",
            boxShadow: "0 10px 24px rgba(37,99,235,0.45)",
          }}
        >
          🗓️
        </div>

        <h3 style={{ margin: 0, fontSize: 22 }}>Nueva cita</h3>
        <p style={{ color: "#6b7280", fontSize: 14, marginTop: 4 }}>
          Horarios válidos: de <b>09:00</b> a <b>18:00</b>. Solo se muestran
          horas que no están ocupadas.
        </p>

        {/* Formulario de la cita */}
        <CitaForm
          initial={{ fechaHora: pre, nombrePaciente: "" }}
          onSubmit={onSubmit}
          submitting={loading}
        />

        {/* Mensaje de éxito o error */}
        {msg && (
          <div
            style={{
              marginTop: 14,
              background: "#ecfdf5",
              border: "1px solid #bbf7d0",
              padding: 10,
              borderRadius: 14,
              fontSize: 14,
              color: "#166534",
            }}
          >
            {msg}
          </div>
        )}
      </article>

      <style>{`
        .chip:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
