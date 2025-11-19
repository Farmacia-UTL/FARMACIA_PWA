// src/proveedores/PedirMedicamentosProveedor.jsx
import React, { useEffect, useState } from "react";
import "../inicios/inicio.css";

const API_URL = import.meta.env.VITE_API_URL || "https://api-farmacia.ngrok.app";

export default function PedirMedicamentosProveedor() {
  const [proveedores, setProveedores] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);

  const [proveedorId, setProveedorId] = useState("");
  const [modo, setModo] = useState("existente"); // "existente" | "nuevo"

  // Pedido de medicamento existente
  const [pedidoExistente, setPedidoExistente] = useState({
    medicamentoId: "",
    cantidad: "",
  });

  // Crear nuevo medicamento
  const [nuevoMed, setNuevoMed] = useState({
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

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar proveedores y medicamentos al montar
  useEffect(() => {
    const loadData = async () => {
      try {
        const [provRes, medRes] = await Promise.all([
          fetch(`${API_URL}/api/Proveedores`),
          fetch(`${API_URL}/api/Medicamentos`),
        ]);

        const provData = await provRes.json().catch(() => []);
        const medData = await medRes.json().catch(() => []);

        if (provRes.ok) setProveedores(provData);
        if (medRes.ok) setMedicamentos(medData);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  // Handlers
  const onChangeProveedor = (e) => {
    setProveedorId(e.target.value);
    setMsg("");
  };

  const onChangeModo = (nuevoModo) => {
    setModo(nuevoModo);
    setMsg("");
  };

  const onChangePedidoExistente = (e) => {
    const { name, value } = e.target;
    setPedidoExistente((s) => ({ ...s, [name]: value }));
  };

  const onChangeNuevoMed = (e) => {
    const { name, value } = e.target;
    setNuevoMed((s) => ({ ...s, [name]: value }));
  };

  // === 2.1 Pedir de medicamento existente (sumar a Cantidad) ===
  const onSubmitExistente = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!proveedorId) {
      setMsg("⚠️ Selecciona un proveedor.");
      return;
    }

    if (!pedidoExistente.medicamentoId || !pedidoExistente.cantidad) {
      setMsg("⚠️ Selecciona un medicamento y cantidad.");
      return;
    }

    const medId = Number(pedidoExistente.medicamentoId);
    const extra = Number(pedidoExistente.cantidad);

    const seleccionado = medicamentos.find((m) => m.id === medId || m.Id === medId);
    if (!seleccionado) {
      setMsg("❌ No se encontró el medicamento seleccionado.");
      return;
    }

    const cantidadActual = seleccionado.cantidad ?? seleccionado.Cantidad ?? 0;
    const nuevaCantidad = cantidadActual + extra;

    const payload = {
      nombre: seleccionado.nombre ?? seleccionado.Nombre,
      cantidad: nuevaCantidad,
      tipo: seleccionado.tipo ?? seleccionado.Tipo ?? "",
      precio: seleccionado.precio ?? seleccionado.Precio ?? 0,
      descripcion: seleccionado.descripcion ?? seleccionado.Descripcion ?? "",
      beneficios: seleccionado.beneficios ?? seleccionado.Beneficios ?? "",
      instrucciones: seleccionado.instrucciones ?? seleccionado.Instrucciones ?? "",
      advertencias: seleccionado.advertencias ?? seleccionado.Advertencias ?? "",
      fotoUrl: seleccionado.fotoUrl ?? seleccionado.FotoUrl ?? null,
      // Si tu backend ya acepta ProveedorId en el DTO, esto servirá.
      proveedorId: Number(proveedorId),
    };

    try {
      setLoading(true);
      const resp = await fetch(`${API_URL}/api/Medicamentos/${medId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => null);

      if (resp.ok) {
        setMsg("✅ Pedido registrado, stock actualizado");

        // Actualizar lista de medicamentos en el front
        setMedicamentos((lista) =>
          lista.map((m) =>
            (m.id === medId || m.Id === medId)
              ? { ...m, cantidad: nuevaCantidad, Cantidad: nuevaCantidad }
              : m
          )
        );

        setPedidoExistente({ medicamentoId: "", cantidad: "" });
      } else {
        setMsg(data?.title || data?.message || "❌ No se pudo registrar el pedido");
      }
    } catch (err) {
      console.error(err);
      setMsg("❌ Error de red");
    } finally {
      setLoading(false);
    }
  };

  // === 2.2 Crear nuevo medicamento para el proveedor seleccionado ===
  const onSubmitNuevo = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!proveedorId) {
      setMsg("⚠️ Selecciona un proveedor.");
      return;
    }

    const payload = {
      nombre: nuevoMed.nombre,
      cantidad: Number(nuevoMed.cantidad || 0),
      tipo: nuevoMed.tipo || "",
      precio: Number(nuevoMed.precio || 0),
      descripcion: nuevoMed.descripcion || "",
      beneficios: nuevoMed.beneficios || "",
      instrucciones: nuevoMed.instrucciones || "",
      advertencias: nuevoMed.advertencias || "",
      fotoUrl: nuevoMed.fotoUrl || null,
      // Este campo extra será ignorado si tu DTO no lo tiene todavía,
      // pero ya queda listo por si lo agregas.
      proveedorId: Number(proveedorId),
    };

    try {
      setLoading(true);
      const resp = await fetch(`${API_URL}/api/Medicamentos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => null);

      if (resp.ok) {
        setMsg("✅ Medicamento creado para este proveedor");
        setNuevoMed({
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

        // Agregar a la lista local de medicamentos
        setMedicamentos((lista) => [...lista, data]);
      } else {
        setMsg(data?.title || data?.message || "❌ No se pudo crear el medicamento");
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
      <h2>Pedir medicamentos por proveedor</h2>

      {/* Selector de proveedor */}
      <div
        className="card"
        style={{
          marginBottom: 18,
          padding: 14,
          borderRadius: 14,
          background: "#fff",
          boxShadow: "0 8px 24px rgba(0,0,0,.08)",
          display: "grid",
          gap: 10,
        }}
      >
        <label style={{ fontWeight: 600 }}>Proveedor</label>
        <select
          value={proveedorId}
          onChange={onChangeProveedor}
          className="select-proveedor"
        >
          <option value="">-- Selecciona un proveedor --</option>
          {proveedores.map((p) => (
            <option key={p.id ?? p.Id} value={p.id ?? p.Id}>
              {p.nombre ?? p.Nombre}
            </option>
          ))}
        </select>
        <small style={{ color: "#64748b" }}>
          Primero elige el proveedor con el que vas a hacer el pedido.
        </small>
      </div>

      {/* Tabs: existente / nuevo */}
      <div
        className="card"
        style={{
          padding: 18,
          borderRadius: 14,
          background: "#fff",
          boxShadow: "0 8px 24px rgba(0,0,0,.12)",
          display: "grid",
          gap: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 8,
          }}
        >
          <button
            type="button"
            className={`btn-login ${modo === "existente" ? "active" : ""}`}
            style={{
              flex: 1,
              opacity: modo === "existente" ? 1 : 0.7,
            }}
            onClick={() => onChangeModo("existente")}
          >
            Pedir de medicamento existente
          </button>
          <button
            type="button"
            className={`btn-login ${modo === "nuevo" ? "active" : ""}`}
            style={{
              flex: 1,
              opacity: modo === "nuevo" ? 1 : 0.7,
            }}
            onClick={() => onChangeModo("nuevo")}
          >
            Crear nuevo medicamento
          </button>
        </div>

        {modo === "existente" && (
          <form
            onSubmit={onSubmitExistente}
            style={{ display: "grid", gap: 14 }}
          >
            <h3 style={{ margin: 0 }}>Pedir de uno que ya existe</h3>

            <div className="grid2">
              <div>
                <label>Medicamento</label>
                <select
                  name="medicamentoId"
                  value={pedidoExistente.medicamentoId}
                  onChange={onChangePedidoExistente}
                >
                  <option value="">-- Selecciona medicamento --</option>
                  {medicamentos.map((m) => (
                    <option key={m.id ?? m.Id} value={m.id ?? m.Id}>
                      {m.nombre ?? m.Nombre}{" "}
                      {`(stock: ${m.cantidad ?? m.Cantidad ?? 0})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Cantidad a pedir</label>
                <input
                  type="number"
                  min="1"
                  name="cantidad"
                  value={pedidoExistente.cantidad}
                  onChange={onChangePedidoExistente}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? "Procesando…" : "Registrar pedido (sumar al stock)"}
            </button>
          </form>
        )}

        {modo === "nuevo" && (
          <form
            onSubmit={onSubmitNuevo}
            style={{ display: "grid", gap: 14 }}
          >
            <h3 style={{ margin: 0 }}>Crear nuevo medicamento</h3>

            <div className="grid2">
              <div>
                <label>Nombre</label>
                <input
                  name="nombre"
                  value={nuevoMed.nombre}
                  onChange={onChangeNuevoMed}
                  required
                />
              </div>
              <div>
                <label>Tipo</label>
                <input
                  name="tipo"
                  value={nuevoMed.tipo}
                  onChange={onChangeNuevoMed}
                  placeholder="Tableta, jarabe, etc."
                />
              </div>
            </div>

            <div className="grid2">
              <div>
                <label>Cantidad inicial</label>
                <input
                  type="number"
                  min="0"
                  name="cantidad"
                  value={nuevoMed.cantidad}
                  onChange={onChangeNuevoMed}
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
                  value={nuevoMed.precio}
                  onChange={onChangeNuevoMed}
                  required
                />
              </div>
            </div>

            <div>
              <label>Descripción</label>
              <textarea
                rows={3}
                name="descripcion"
                value={nuevoMed.descripcion}
                onChange={onChangeNuevoMed}
              />
            </div>

            <div className="grid3">
              <div>
                <label>Beneficios</label>
                <textarea
                  rows={3}
                  name="beneficios"
                  value={nuevoMed.beneficios}
                  onChange={onChangeNuevoMed}
                />
              </div>
              <div>
                <label>Instrucciones</label>
                <textarea
                  rows={3}
                  name="instrucciones"
                  value={nuevoMed.instrucciones}
                  onChange={onChangeNuevoMed}
                />
              </div>
              <div>
                <label>Advertencias</label>
                <textarea
                  rows={3}
                  name="advertencias"
                  value={nuevoMed.advertencias}
                  onChange={onChangeNuevoMed}
                />
              </div>
            </div>

            <div>
              <label>URL de la foto (opcional)</label>
              <input
                type="url"
                name="fotoUrl"
                value={nuevoMed.fotoUrl}
                onChange={onChangeNuevoMed}
                placeholder="https://mi-cdn.com/img/producto.png"
              />
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? "Guardando…" : "Crear medicamento"}
            </button>
          </form>
        )}

        {msg && <p className="login-message">{msg}</p>}
      </div>

      <style>{`
        .grid2 { display:grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .grid3 { display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
        @media (max-width: 900px){
          .grid2, .grid3 { grid-template-columns: 1fr; }
        }
        .card input,
        .card textarea,
        .card select {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          outline: none;
        }
        .card label {
          display:block;
          font-weight:600;
          margin-bottom:6px;
        }
      `}</style>
    </div>
  );
}
