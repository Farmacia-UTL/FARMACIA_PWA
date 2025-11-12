// src/Components/citas/CitaForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getSlots } from "./services/citasApi";

const inputS = {
  width: "100%",
  padding: "10px",
  borderRadius: 10,
  border: "1px solid #d6e7e6",
};

const hoyYYYYMMDD = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function CitaForm({ initial, onSubmit, submitting }) {
  // initial.fechaHora puede venir como "YYYY-MM-DDTHH:MM"
  const [fecha, setFecha] = useState(() => {
    if (initial?.fechaHora?.includes("T")) return initial.fechaHora.split("T")[0];
    return hoyYYYYMMDD();
  });

  const [hora, setHora] = useState(() => {
    if (initial?.fechaHora?.includes("T")) return initial.fechaHora.split("T")[1]; // "HH:MM"
    return "";
  });

  const [tipoConsulta, setTipoConsulta] = useState(initial?.tipoConsulta || "General");
  const [notas, setNotas] = useState(initial?.notas || "");

  const [cargandoSlots, setCargandoSlots] = useState(false);
  const [errorSlots, setErrorSlots] = useState("");
  const [listaHoras, setListaHoras] = useState([]); // ["09:00","09:30",...]

  const puedeEnviar = useMemo(
    () => !!fecha && !!hora && !submitting,
    [fecha, hora, submitting]
  );

  // 🔹 Cargar slots cuando cambia la fecha
  useEffect(() => {
    let cancel = false;

    (async () => {
      try {
        setCargandoSlots(true);
        setErrorSlots("");
        setListaHoras([]);

        // Llamada al backend
        const slots = await getSlots({ fecha });

        // slots = [ { fechaHora, horaTexto, disponible }, ... ]
        const horasDisponibles = slots
          .filter((s) => s.disponible)
          .map((s) => s.horaTexto); // ["09:00", "09:30", ...]

        if (!cancel) {
          setListaHoras(horasDisponibles);

          // Si la hora seleccionada ya no está disponible, la limpiamos
          if (hora && !horasDisponibles.includes(hora)) {
            setHora("");
          }
        }
      } catch (e) {
        if (!cancel) {
          setErrorSlots(
            e.message || "No se pudieron cargar los horarios."
          );
        }
      } finally {
        if (!cancel) setCargandoSlots(false);
      }
    })();

    return () => {
      cancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Construye "YYYY-MM-DDTHH:MM"
    const fechaHora = `${fecha}T${hora}`;
    onSubmit({ fechaHora, tipoConsulta, notas });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
      {/* Fecha */}
      <label>
        <strong>Fecha</strong>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
          style={inputS}
        />
      </label>

      {/* Hora */}
      <label>
        <strong>Hora</strong>
        <select
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          required
          style={inputS}
        >
          <option value="" disabled>
            {cargandoSlots ? "Cargando horarios…" : "Selecciona una hora"}
          </option>

          {listaHoras.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>

        {errorSlots && (
          <div
            style={{
              marginTop: 6,
              color: "#b01515",
              fontWeight: 700,
            }}
          >
            {errorSlots}
          </div>
        )}

        {!errorSlots && !cargandoSlots && listaHoras.length === 0 && (
          <div style={{ marginTop: 6, color: "var(--muted)" }}>
            No hay horarios disponibles para esta fecha.
          </div>
        )}
      </label>

      {/* Tipo de consulta */}
      <label>
        <strong>Tipo de consulta</strong>
        <select
          value={tipoConsulta}
          onChange={(e) => setTipoConsulta(e.target.value)}
          style={inputS}
        >
          <option>General</option>
          <option>Farmacológica</option>
          <option>Seguimiento</option>
        </select>
      </label>

      {/* Notas */}
      <label>
        <strong>Notas</strong>
        <textarea
          rows={3}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Motivo, síntomas, etc."
          style={inputS}
        />
      </label>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn-cta" disabled={!puedeEnviar} type="submit">
          {submitting ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
