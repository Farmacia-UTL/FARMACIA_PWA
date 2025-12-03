import React, { useEffect, useState } from "react";
import { cancelarCita, getMisCitas, actualizarCita } from "./services/citasApi";
import { useNavigate } from "react-router-dom";
import "./misCitas.css"; // Estilos para Mis Citas

export default function Citas() {
  const [citas, setCitas] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function cargar() {
    setLoading(true);
    setMsg("");
    try {
      const lista = await getMisCitas();
      setCitas(lista);
    } catch (e) {
      setMsg(e.message || "No se pudieron cargar tus citas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

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

  return (
    <div className="citas-container">
      <header className="citas-header">
        <h2>Mis citas</h2>

        <div className="actions">
          {/* 🔹 Botón de regresar en azul */}
          <button
            className="chip"
            type="button"
            onClick={() => nav(-1)}
          >
            ← Regresar
          </button>

          <button className="chip" onClick={() => nav("/citas/agendar")}>
            🗓️ Agendar
          </button>

          <button className="chip" onClick={cargar} disabled={loading}>
            {loading ? "Cargando..." : "Actualizar"}
          </button>
        </div>
      </header>

      {msg && <p className="alert-message">{msg}</p>}

      <div className="citas-list">
        {!loading && citas.length === 0 && (
          <p className="no-citas">No tienes citas.</p>
        )}

        {citas.map((c) => {
          const f = new Date(c.fechaHora);
          const dia = f.toLocaleDateString();
          const hora = f.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div key={c.idCita} className="cita-card">
              <div className="cita-info">
                <strong>
                  {dia} · {hora}
                </strong>
                <p>
                  {c.tipoConsulta} · Estatus:{" "}
                  <b>{c.estatus === "C" ? "Cancelada" : "Activa"}</b>
                </p>
              </div>

              <div className="cita-actions">
                <button
                  className="chip cancel-btn"
                  onClick={() => handleCancelar(c.idCita)}
                  disabled={c.estatus === "C"}
                >
                  ❌ Cancelar
                </button>
                <button
                  className="chip activate-btn"
                  onClick={() => handleActivar(c.idCita)}
                  disabled={c.estatus === "A"}
                >
                  ✅ Activar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
