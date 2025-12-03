// src/Components/citas/__CitaForm.jsx
import React, { useEffect, useState } from "react";
import { getSlots } from "./services/citasApi";

export default function CitaForm({ initial = {}, onSubmit, submitting }) {
  const preFecha = initial.fechaHora ? initial.fechaHora.slice(0, 10) : "";
  const preHora = initial.fechaHora ? initial.fechaHora.slice(11, 16) : "";

  const [form, setForm] = useState({
    nombrePaciente: initial.nombrePaciente || "",
    fecha: preFecha,
    hora: preHora,
    tipoConsulta: initial.tipoConsulta || "",
    notas: initial.notas || "",
  });

  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const cargarSlots = async () => {
      if (!form.fecha) {
        setSlots([]);
        setSlotsError("");
        return;
      }
      try {
        setSlotsLoading(true);
        setSlotsError("");
        const data = await getSlots({ fecha: form.fecha });
        setSlots(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setSlots([]);
        setSlotsError(e.message || "No se pudieron cargar los horarios.");
      } finally {
        setSlotsLoading(false);
      }
    };

    cargarSlots();
  }, [form.fecha]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));

    if (name === "fecha") {
      setForm((fPrev) => ({ ...fPrev, fecha: value, hora: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.nombrePaciente.trim()) {
      alert("Escribe el nombre del paciente.");
      return;
    }
    if (!form.fecha) {
      alert("Selecciona una fecha.");
      return;
    }
    if (!form.hora) {
      alert("Selecciona un horario disponible.");
      return;
    }
    if (!form.tipoConsulta) {
      alert("Selecciona el tipo de consulta.");
      return;
    }

    const seleccion = new Date(`${form.fecha}T${form.hora}`);
    const ahora = new Date();
    if (seleccion < ahora) {
      alert("No puedes agendar una cita en una fecha u hora pasada.");
      return;
    }

    onSubmit({
      nombrePaciente: form.nombrePaciente.trim(),
      fecha: form.fecha,
      hora: form.hora,
      tipoConsulta: form.tipoConsulta,
      notas: form.notas,
    });
  };

  const slotsDisponibles = slots.filter((s) => s.disponible);

  const inputBase = {
    width: "100%",
    padding: "9px 3px",
    borderRadius: 14,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    background: "rgba(248,250,252,0.92)",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
  };

  const labelBase = {
    display: "block",
    fontWeight: 600,
    marginBottom: 4,
    fontSize: 14,
    color: "#0f172a",
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "grid",
        gap: 16,
        marginTop: 10,
      }}
    >
      {/* Nombre del paciente */}
      <div>
        <label htmlFor="nombrePaciente" style={labelBase}>
          Nombre del paciente
        </label>
        <input
          id="nombrePaciente"
          name="nombrePaciente"
          type="text"
          required
          value={form.nombrePaciente}
          onChange={handleChange}
          placeholder="Ej. Juan Pérez López"
          style={inputBase}
        />
      </div>

      {/* Grid fecha + hora */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 14,
        }}
      >
        {/* Fecha */}
        <div>
          <label htmlFor="fecha" style={labelBase}>
            Fecha
          </label>
          <input
            id="fecha"
            name="fecha"
            type="date"
            required
            min={today}
            value={form.fecha}
            onChange={handleChange}
            style={inputBase}
          />
        </div>

        {/* Horario */}
        <div>
          <label htmlFor="hora" style={labelBase}>
            Horario disponible
          </label>
          <select
            id="hora"
            name="hora"
            required
            value={form.hora}
            onChange={handleChange}
            disabled={
              !form.fecha || slotsLoading || slotsDisponibles.length === 0
            }
            style={inputBase}
          >
            {!form.fecha && (
              <option value="">Selecciona primero una fecha</option>
            )}

            {form.fecha && slotsLoading && (
              <option value="">Cargando horarios...</option>
            )}

            {form.fecha && !slotsLoading && slotsDisponibles.length === 0 && (
              <option value="">No hay horarios disponibles este día</option>
            )}

            {form.fecha &&
              !slotsLoading &&
              slotsDisponibles.length > 0 && (
                <>
                  <option value="">Selecciona un horario</option>
                  {slotsDisponibles.map((s) => (
                    <option key={s.fechaHora} value={s.horaTexto}>
                      {s.horaTexto}
                    </option>
                  ))}
                </>
              )}
          </select>
          {slotsError && (
            <p
              style={{
                marginTop: 4,
                fontSize: 12,
                color: "#b91c1c",
              }}
            >
              {slotsError}
            </p>
          )}
        </div>
      </div>

      {/* Tipo de consulta */}
      <div>
        <label htmlFor="tipoConsulta" style={labelBase}>
          Tipo de consulta
        </label>
        <select
          id="tipoConsulta"
          name="tipoConsulta"
          required
          value={form.tipoConsulta}
          onChange={handleChange}
          style={inputBase}
        >
          <option value="">Selecciona una opción</option>
          <option value="General">Consulta general</option>
          <option value="Control">Control</option>
          <option value="Receta">Receta / Seguimiento</option>
        </select>
      </div>

      {/* Notas */}
      <div>
        <label htmlFor="notas" style={labelBase}>
          Notas
        </label>
        <textarea
          id="notas"
          name="notas"
          rows={3}
          value={form.notas}
          onChange={handleChange}
          placeholder="Notas adicionales (opcional)"
          style={{
            ...inputBase,
            resize: "vertical",
          }}
        />
      </div>

      {/* Botón guardar (AZUL) */}
      <button
        type="submit"
        disabled={submitting}
        style={{
          marginTop: 4,
          alignSelf: "flex-end",
          padding: "10px 22px",
          borderRadius: 999,
          border: "none",
          fontWeight: 600,
          fontSize: 15,
          cursor: submitting ? "not-allowed" : "pointer",
          background:
            "linear-gradient(90deg, rgba(37,99,235,1) 0%, rgba(59,130,246,1) 100%)",
          color: "#f9fafb",
          boxShadow: "0 10px 26px rgba(37,99,235,0.55)",
        }}
      >
        {submitting ? "Guardando..." : "Guardar cita"}
      </button>
    </form>
  );
}
