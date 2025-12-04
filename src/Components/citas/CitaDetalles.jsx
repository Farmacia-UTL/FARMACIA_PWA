// src/Components/citas/CitaDetalles.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCitaById, actualizarCita } from "./services/citasApi";

export default function CitaDetalles() {
  const { idCita } = useParams();
  const nav = useNavigate();

  const [cita, setCita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [observaciones, setObservaciones] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [medicamentos, setMedicamentos] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await getCitaById(idCita);
        setCita(data);
        setObservaciones(data.observaciones || "");
        setDiagnostico(data.diagnostico || "");
        setMedicamentos(data.medicamentos || "");
      } catch (e) {
        setMsg(e.message || "No se pudieron cargar los detalles de la cita.");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [idCita]);

  const handleGuardar = async (e) => {
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

      setMsg("Cita marcada como terminada y diagnóstico guardado.");

      setCita((prev) => ({
        ...prev,
        estatus: "T",
        observaciones,
        diagnostico,
        medicamentos,
      }));
    } catch (e) {
      setMsg(e.message || "No se pudo actualizar la cita.");
    }
  };

  const getEstatusTexto = (e) => {
    if (e === "A") return "Activa";
    if (e === "C") return "Cancelada";
    if (e === "T") return "Terminada";
    return "Desconocido";
  };

  if (loading) {
    return (
      <div
        style={{
          maxWidth: 1100,
          margin: "40px auto",
          padding: "0 16px",
          color: "#e5e7eb",
        }}
      >
        Cargando…
      </div>
    );
  }

  if (!cita) {
    return (
      <div
        style={{
          maxWidth: 1100,
          margin: "40px auto",
          padding: "0 16px",
          color: "#e5e7eb",
        }}
      >
        No se encontró la cita.
      </div>
    );
  }

  const fechaTexto = new Date(cita.fechaHora).toLocaleString();

  const estatusEsActiva = cita.estatus === "A";

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "32px auto",
        padding: "0 16px",
      }}
    >
      {/* Título */}
      <h2
        style={{
          fontSize: 28,
          color: "#e5e7eb",
          marginBottom: 4,
        }}
      >
        Detalles de la cita
      </h2>

      {/* Botón regresar estilo azul */}
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

      {msg && (
        <div
          style={{
            marginBottom: 16,
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

      {/* TARJETA BLANCA, ESTILO AGENDAR CITA */}
      <article
        className="module-card"
        style={{
          maxWidth: 900,
          margin: "0 auto 40px", // 👈 espacio abajo
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(239,246,255,0.99))",
          padding: 26,
          borderRadius: 28,
          border: "1px solid rgba(191, 219, 254, 0.8)",
          boxShadow:
            "0 0 0 1px rgba(37,99,235,0.10), 0 20px 50px rgba(15,23,42,0.55)",
          color: "#0f172a",
        }}
      >
        {/* Encabezado paciente/fecha */}
        <header
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "radial-gradient(circle at 30% 20%, #4ade80, #2563eb)",
              color: "#eff6ff",
              boxShadow: "0 10px 24px rgba(37,99,235,0.45)",
              fontSize: 28,
            }}
          >
            🗓️
          </div>

          <div>
            <h3 style={{ margin: 0, fontSize: 22 }}>
              Paciente{" "}
              <span style={{ fontWeight: 700 }}>
                {cita.nombrePaciente || "sin nombre"}
              </span>
            </h3>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 14,
                color: "#6b7280",
              }}
            >
              {fechaTexto}
            </p>
          </div>
        </header>

        {/* Datos generales de la cita (texto plano) */}
        <section
          style={{
            marginBottom: 18,
            fontSize: 14,
            color: "#111827",
          }}
        >
          <p style={{ margin: "0 0 6px" }}>
            <span style={{ fontWeight: 600 }}>Tipo de consulta:</span>{" "}
            <span style={{ fontWeight: 700 }}>
              {cita.tipoConsulta || "General"}
            </span>
          </p>

          <p style={{ margin: "0 0 6px" }}>
            <span style={{ fontWeight: 600 }}>Notas:</span>{" "}
            {cita.notas || "Sin notas"}
          </p>

          <p style={{ margin: 0 }}>
            <span style={{ fontWeight: 600 }}>Estatus:</span>{" "}
            <span
              style={{
                fontWeight: 700,
                color:
                  cita.estatus === "A"
                    ? "#16a34a"
                    : cita.estatus === "C"
                    ? "#b91c1c"
                    : "#2563eb",
              }}
            >
              {getEstatusTexto(cita.estatus)}
            </span>
          </p>
        </section>

        <hr
          style={{
            border: "none",
            height: 1,
            background:
              "linear-gradient(to right, rgba(148,163,184,0.1), rgba(148,163,184,0.7), rgba(148,163,184,0.1))",
            marginBottom: 18,
          }}
        />

        {/* FORM de observaciones / diagnóstico */}
        <form
          onSubmit={handleGuardar}
          style={{ display: "grid", gap: 14 }}
        >
          {/* Cada textarea azul clarito con texto oscuro */}
          <div>
            <label
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: "#0f172a",
              }}
            >
              Observaciones
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={3}
              disabled={!estatusEsActiva}
              style={{
                width: "100%",
                marginTop: 4,
                padding: 10,
                borderRadius: 16,
                border: "1px solid #93c5fd",
                backgroundColor: "#e0edff",
                color: "#111827",
                resize: "vertical",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: "#0f172a",
              }}
            >
              Diagnóstico
            </label>
            <textarea
              value={diagnostico}
              onChange={(e) => setDiagnostico(e.target.value)}
              rows={3}
              disabled={!estatusEsActiva}
              style={{
                width: "100%",
                marginTop: 4,
                padding: 10,
                borderRadius: 16,
                border: "1px solid #93c5fd",
                backgroundColor: "#e0edff",
                color: "#111827",
                resize: "vertical",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: "#0f172a",
              }}
            >
              Medicamentos indicados
            </label>
            <textarea
              value={medicamentos}
              onChange={(e) => setMedicamentos(e.target.value)}
              rows={3}
              disabled={!estatusEsActiva}
              placeholder="Ej. Paracetamol 500 mg cada 8h por 3 días"
              style={{
                width: "100%",
                marginTop: 4,
                padding: 10,
                borderRadius: 16,
                border: "1px solid #93c5fd",
                backgroundColor: "#e0edff",
                color: "#111827",
                resize: "vertical",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          {/* Botón guardar tipo barra azul, como Agendar cita */}
          <button
            type="submit"
            disabled={!estatusEsActiva}
            style={{
              marginTop: 8,
              padding: "12px 20px",
              borderRadius: 999,
              border: "none",
              fontWeight: 600,
              fontSize: 15,
              cursor: estatusEsActiva ? "pointer" : "not-allowed",
              background:
                "linear-gradient(90deg, rgba(37,99,235,1), rgba(59,130,246,1))",
              color: "#ffffff",
              boxShadow: "0 10px 30px rgba(37,99,235,0.55)",
            }}
          >
            {estatusEsActiva
              ? "Marcar como terminada y guardar diagnóstico"
              : "La cita ya no está activa"}
          </button>
        </form>
      </article>
    </div>
  );
}
