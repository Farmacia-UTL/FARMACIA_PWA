// src/proveedores/CrearProveedor.jsx
import React, { useState } from "react";
import "../inicios/inicio.css";

const API_URL = import.meta.env.VITE_API_URL || "https://api-farmacia.ngrok.app";

export default function CrearProveedor() {
  const [form, setForm] = useState({
    nombre: "",
    contacto: "",
    telefono: "",
    email: "",
    direccion: "",
    rfc: "",
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    const payload = {
      nombre: form.nombre,
      contacto: form.contacto || null,
      telefono: form.telefono || null,
      email: form.email || null,
      direccion: form.direccion || null,
      rfc: form.rfc || null,
    };

    try {
      const resp = await fetch(`${API_URL}/api/Proveedores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => null);

      if (resp.ok) {
        setMsg("✅ Proveedor registrado correctamente");
        setForm({
          nombre: "",
          contacto: "",
          telefono: "",
          email: "",
          direccion: "",
          rfc: "",
        });
      } else {
        setMsg(data?.title || data?.message || "❌ No se pudo registrar el proveedor");
      }
    } catch (err) {
      console.error(err);
      setMsg("❌ Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: "0 16px" }}>
      <h2>Registrar proveedor</h2>

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
            <label>Nombre de la empresa</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={onChange}
              required
            />
          </div>
          <div>
            <label>Contacto (persona)</label>
            <input
              name="contacto"
              value={form.contacto}
              onChange={onChange}
              placeholder="Ej. Juan Pérez"
            />
          </div>
        </div>

        <div className="grid2">
          <div>
            <label>Teléfono</label>
            <input
              name="telefono"
              value={form.telefono}
              onChange={onChange}
              placeholder="Ej. 477 123 4567"
            />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="correo@empresa.com"
            />
          </div>
        </div>

        <div>
          <label>Dirección</label>
          <textarea
            rows={2}
            name="direccion"
            value={form.direccion}
            onChange={onChange}
            placeholder="Calle, colonia, ciudad…"
          />
        </div>

        <div>
          <label>RFC</label>
          <input
            name="rfc"
            value={form.rfc}
            onChange={onChange}
            placeholder="RFC opcional"
          />
        </div>

        <button type="submit" className="btn-login" disabled={loading}>
          {loading ? "Guardando…" : "Guardar proveedor"}
        </button>
        {msg && <p className="login-message">{msg}</p>}
      </form>

      <style>{`
        .grid2 { display:grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 900px){
          .grid2 { grid-template-columns: 1fr; }
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
