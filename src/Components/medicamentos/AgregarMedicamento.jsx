import React, { useState } from "react";
import "../inicios/inicio.css"; // reusa tu paleta/clases si gustas

const API_URL = import.meta.env.VITE_API_URL || "https://api-farmacia.ngrok.app";

export default function AgregarMedicamento() {
  const [form, setForm] = useState({
    nombre: "",
    cantidad: "",
    tipo: "",
    precio: "",
    descripcion: "",
    beneficios: "",
    instrucciones: "",
    advertencias: "",
    fotoUrl: "",          // 👈 ahora se captura la URL aquí
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [imgOk, setImgOk] = useState(true);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    // construir payload JSON
    const payload = {
      nombre: form.nombre,
      cantidad: Number(form.cantidad || 0),
      tipo: form.tipo || "",
      precio: Number(form.precio || 0),
      descripcion: form.descripcion || "",
      beneficios: form.beneficios || "",
      instrucciones: form.instrucciones || "",
      advertencias: form.advertencias || "",
      fotoUrl: form.fotoUrl || null, // puede ser null/"" si no hay imagen
    };

    try {
      const resp = await fetch(`${API_URL}/api/Medicamentos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => null);

      if (resp.ok) {
        setMsg("✅ Medicamento agregado");
        setForm({
          nombre: "",
          cantidad: "",
          tipo: "",
          precio: "",
          descripcion: "",
          beneficios: "",
          instrucciones: "",
          advertencias: "",
          fotoUrl: "",
        });
        setImgOk(true);
      } else {
        setMsg(data?.title || data?.message || "❌ No se pudo guardar");
      }
    } catch (err) {
      console.error(err);
      setMsg("❌ Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "24px auto", padding: "0 16px" }}>
      <h2>Agregar medicamento</h2>

      <form
        onSubmit={onSubmit}
        className="card"
        style={{
          display: "grid",
          gap: 14,
          background: "#fff",
          padding: 18,
          borderRadius: 14,
          boxShadow: "0 8px 24px rgba(0,0,0,.12)",
        }}
      >
        <div className="grid2">
          <div>
            <label>Nombre</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={onChange}
              required
            />
          </div>
          <div>
            <label>Tipo</label>
            <input
              name="tipo"
              value={form.tipo}
              onChange={onChange}
              placeholder="Tableta, jarabe, etc."
            />
          </div>
        </div>

        <div className="grid2">
          <div>
            <label>Cantidad</label>
            <input
              type="number"
              min="0"
              name="cantidad"
              value={form.cantidad}
              onChange={onChange}
              required
            />
          </div>
          <div>
            <label>Precio</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="precio"
              value={form.precio}
              onChange={onChange}
              required
            />
          </div>
        </div>

        <div>
          <label>Descripción</label>
          <textarea
            rows={3}
            name="descripcion"
            value={form.descripcion}
            onChange={onChange}
          />
        </div>

        <div className="grid3">
          <div>
            <label>Beneficios</label>
            <textarea
              rows={3}
              name="beneficios"
              value={form.beneficios}
              onChange={onChange}
              placeholder="Ej. alivia dolor, reduce fiebre…"
            />
          </div>
          <div>
            <label>Instrucciones</label>
            <textarea
              rows={3}
              name="instrucciones"
              value={form.instrucciones}
              onChange={onChange}
              placeholder="Ej. tomar 1 tableta cada 8 horas…"
            />
          </div>
          <div>
            <label>Advertencias</label>
            <textarea
              rows={3}
              name="advertencias"
              value={form.advertencias}
              onChange={onChange}
              placeholder="Ej. no usar en embarazo, puede causar somnolencia…"
            />
          </div>
        </div>

        {/* 👉 CAMBIO: campo para URL de la imagen con preview */}
        <div className="grid2">
          <div>
            <label>URL de la foto (opcional)</label>
            <input
              type="url"
              name="fotoUrl"
              value={form.fotoUrl}
              onChange={onChange}
              placeholder="https://mi-cdn.com/img/producto.png"
            />
            <small style={{ color: "#64748b" }}>
              Debe ser una URL válida (https://…).
            </small>
          </div>

          <div style={{ display: "grid", alignItems: "end" }}>
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 6,
                background: "#fafafa",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <img
                src={
                  form.fotoUrl?.trim()
                    ? form.fotoUrl.trim()
                    : "https://via.placeholder.com/120x90?text=Preview"
                }
                onError={() => setImgOk(false)}
                onLoad={() => setImgOk(true)}
                alt="Preview"
                style={{
                  width: 120,
                  height: 90,
                  objectFit: "cover",
                  borderRadius: 8,
                  background: "#e5e7eb",
                }}
              />
              <span style={{ color: imgOk ? "#16a34a" : "#ef4444" }}>
                {imgOk ? "Vista previa OK" : "URL inválida o no accesible"}
              </span>
            </div>
          </div>
        </div>

        <button type="submit" className="btn-login" disabled={loading}>
          {loading ? "Guardando…" : "Guardar"}
        </button>
        {msg && <p className="login-message">{msg}</p>}
      </form>

      {/* utilidades de grilla si no existen en tu CSS */}
      <style>{`
        .grid2 { display:grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .grid3 { display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
        @media (max-width: 900px){
          .grid2, .grid3 { grid-template-columns: 1fr; }
        }
        .card input, .card textarea {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          outline: none;
        }
        .card label { display:block; font-weight:600; margin-bottom:6px; }
      `}</style>
    </div>
  );
}
