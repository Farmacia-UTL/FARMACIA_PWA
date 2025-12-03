// src/proveedores/PedirMedicamentosProveedor.jsx
import React, { useEffect, useState } from "react";
import "../inicios/inicio.css";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "https://api-farmacia.ngrok.app";

export default function PedirMedicamentosProveedor() {
  const navigate = useNavigate();

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

  // Carrito
  const [itemsExistentes, setItemsExistentes] = useState([]);
  const [itemsNuevos, setItemsNuevos] = useState([]);

  // Datos del pedido
  const [solicitadoPor, setSolicitadoPor] = useState("");
  const [notasPedido, setNotasPedido] = useState("");

  // Historial del proveedor
  const [historial, setHistorial] = useState([]);

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================
  // 1) Cargar proveedores + meds
  // ==========================
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

  // ==========================
  // 2) Cargar historial al cambiar proveedor
  // ==========================
  useEffect(() => {
    const cargarHistorial = async () => {
      if (!proveedorId) {
        setHistorial([]);
        return;
      }
      try {
        const resp = await fetch(
          `${API_URL}/api/Proveedores/${proveedorId}/pedidos-historial`
        );
        if (!resp.ok) {
          setHistorial([]);
          return;
        }
        const data = await resp.json().catch(() => []);
        setHistorial(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setHistorial([]);
      }
    };

    cargarHistorial();
  }, [proveedorId]);

  // ==========================
  // Handlers básicos
  // ==========================
  const onChangeProveedor = (e) => {
    setProveedorId(e.target.value);
    setMsg("");
    setItemsExistentes([]);
    setItemsNuevos([]);
    setNotasPedido("");
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

  // ==========================
  // 3) Agregar EXISTENTE al carrito
  // ==========================
  const onAddExistenteToCarrito = (e) => {
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

    if (extra <= 0) {
      setMsg("⚠️ La cantidad debe ser mayor a 0.");
      return;
    }

    const seleccionado = medicamentos.find(
      (m) => m.id === medId || m.Id === medId
    );
    if (!seleccionado) {
      setMsg("❌ No se encontró el medicamento seleccionado.");
      return;
    }

    const precioUnit = Number(seleccionado.precio ?? seleccionado.Precio ?? 0);

    setItemsExistentes((prev) => {
      const idx = prev.findIndex((x) => x.id === medId);
      if (idx >= 0) {
        const copia = [...prev];
        const actual = copia[idx];
        const nuevaCantidad = actual.cantidad + extra;
        copia[idx] = {
          ...actual,
          cantidad: nuevaCantidad,
          subtotal: nuevaCantidad * actual.precio,
        };
        return copia;
      }

      return [
        ...prev,
        {
          id: medId,
          nombre: seleccionado.nombre ?? seleccionado.Nombre,
          tipo: seleccionado.tipo ?? seleccionado.Tipo ?? "",
          cantidad: extra,
          precio: precioUnit,
          subtotal: extra * precioUnit,
          origen: "Existente",
        },
      ];
    });

    setPedidoExistente({ medicamentoId: "", cantidad: "" });
    setMsg("✅ Medicamento existente agregado al pedido.");
  };

  // ==========================
  // 4) Agregar NUEVO al carrito
  // ==========================
  const onAddNuevoToCarrito = (e) => {
    e.preventDefault();
    setMsg("");

    if (!proveedorId) {
      setMsg("⚠️ Selecciona un proveedor.");
      return;
    }

    if (!nuevoMed.nombre || !nuevoMed.cantidad || !nuevoMed.precio) {
      setMsg("⚠️ Nombre, cantidad y precio son obligatorios.");
      return;
    }

    const cantidad = Number(nuevoMed.cantidad || 0);
    const precio = Number(nuevoMed.precio || 0);

    if (cantidad <= 0 || precio < 0) {
      setMsg("⚠️ Verifica cantidad y precio.");
      return;
    }

    setItemsNuevos((prev) => [
      ...prev,
      {
        tempId: Date.now() + Math.random(),
        nombre: nuevoMed.nombre,
        tipo: nuevoMed.tipo || "",
        cantidad,
        precio,
        subtotal: cantidad * precio,
        descripcion: nuevoMed.descripcion || "",
        beneficios: nuevoMed.beneficios || "",
        instrucciones: nuevoMed.instrucciones || "",
        advertencias: nuevoMed.advertencias || "",
        fotoUrl: nuevoMed.fotoUrl || null,
        origen: "Nuevo",
      },
    ]);

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

    setMsg("✅ Medicamento nuevo agregado al pedido.");
  };

  // ==========================
  // 5) Confirmar pedido
  // ==========================
  const onConfirmarPedido = async () => {
    setMsg("");

    if (!proveedorId) {
      setMsg("⚠️ Selecciona un proveedor.");
      return;
    }

    if (itemsExistentes.length === 0 && itemsNuevos.length === 0) {
      setMsg("⚠️ No hay medicamentos en el pedido.");
      return;
    }

    try {
      setLoading(true);

      // 5.1 Actualizar EXISTENTES
      for (const item of itemsExistentes) {
        const medId = item.id;

        const seleccionado = medicamentos.find(
          (m) => m.id === medId || m.Id === medId
        );
        if (!seleccionado) continue;

        const cantidadActual =
          seleccionado.cantidad ?? seleccionado.Cantidad ?? 0;
        const nuevaCantidad = cantidadActual + item.cantidad;

        const payload = {
          nombre: seleccionado.nombre ?? seleccionado.Nombre,
          cantidad: nuevaCantidad,
          tipo: seleccionado.tipo ?? seleccionado.Tipo ?? "",
          precio: seleccionado.precio ?? seleccionado.Precio ?? 0,
          descripcion:
            seleccionado.descripcion ?? seleccionado.Descripcion ?? "",
          beneficios:
            seleccionado.beneficios ?? seleccionado.Beneficios ?? "",
          instrucciones:
            seleccionado.instrucciones ?? seleccionado.Instrucciones ?? "",
          advertencias:
            seleccionado.advertencias ?? seleccionado.Advertencias ?? "",
          fotoUrl: seleccionado.fotoUrl ?? seleccionado.FotoUrl ?? null,
        };

        const resp = await fetch(`${API_URL}/api/Medicamentos/${medId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(text || "Error al actualizar un medicamento.");
        }

        setMedicamentos((lista) =>
          lista.map((m) =>
            m.id === medId || m.Id === medId
              ? { ...m, cantidad: nuevaCantidad, Cantidad: nuevaCantidad }
              : m
          )
        );
      }

      // 5.2 Crear NUEVOS
      for (const item of itemsNuevos) {
        const rawFotoNueva = item.fotoUrl;
        const fotoUrlNuevaSanitizada =
          rawFotoNueva && /^https?:\/\//i.test(rawFotoNueva)
            ? rawFotoNueva
            : null;

        const payload = {
          nombre: item.nombre,
          cantidad: item.cantidad,
          tipo: item.tipo,
          precio: item.precio,
          descripcion: item.descripcion,
          beneficios: item.beneficios,
          instrucciones: item.instrucciones,
          advertencias: item.advertencias,
          fotoUrl: fotoUrlNuevaSanitizada,
        };

        const resp = await fetch(`${API_URL}/api/Medicamentos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(text || "Error al crear un medicamento nuevo.");
        }

        const data = await resp.json().catch(() => null);
        if (data) {
          setMedicamentos((lista) => [...lista, data]);
        }
      }

      // 5.3 Registrar pedido en historial
      const totalExistentes = itemsExistentes.reduce(
        (sum, it) => sum + it.subtotal,
        0
      );
      const totalNuevos = itemsNuevos.reduce(
        (sum, it) => sum + it.subtotal,
        0
      );
      const totalGeneral = totalExistentes + totalNuevos;

      const proveedorSeleccionado = proveedores.find(
        (p) => (p.id ?? p.Id) === Number(proveedorId)
      );

      const nuevoRegistro = {
        fecha: new Date().toISOString(),
        proveedorId: Number(proveedorId),
        proveedorNombre:
          proveedorSeleccionado?.nombre ??
          proveedorSeleccionado?.Nombre ??
          "",
        solicitadoPor: solicitadoPor || "Sin nombre",
        notas: notasPedido || "",
        totalExistentes,
        totalNuevos,
        totalGeneral,
        items: [...itemsExistentes, ...itemsNuevos],
      };

      const respHist = await fetch(
        `${API_URL}/api/Proveedores/${proveedorId}/registrar-pedido`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevoRegistro),
        }
      );

      if (!respHist.ok) {
        const txt = await respHist.text();
        console.error("Error al guardar historial:", txt);
      } else {
        const dataHist = await respHist.json().catch(() => []);
        setHistorial(Array.isArray(dataHist) ? dataHist : []);
      }

      setMsg("✅ Pedido registrado y stock actualizado.");
      setItemsExistentes([]);
      setItemsNuevos([]);
      setNotasPedido("");
    } catch (err) {
      console.error(err);
      setMsg(err.message || "❌ Error al registrar el pedido.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // 6) Exportar un pedido del historial a "PDF"
  // ==========================
  const handleExportPedido = (p) => {
    if (!p) return;

    const items = p.items ?? p.Items ?? [];

    const proveedorNombre =
      p.proveedorNombre ??
      p.ProveedorNombre ??
      proveedores.find(
        (prov) =>
          (prov.id ?? prov.Id) ===
          Number(p.proveedorId ?? p.ProveedorId ?? proveedorId)
      )?.nombre ??
      proveedores.find(
        (prov) =>
          (prov.id ?? prov.Id) ===
          Number(p.proveedorId ?? p.ProveedorId ?? proveedorId)
      )?.Nombre ??
      "";

    const solicitadoPor = p.solicitadoPor ?? p.SolicitadoPor ?? "";
    const notas = p.notas ?? p.Notas ?? "";

    const totalExistentesPedido = Number(
      p.totalExistentes ?? p.TotalExistentes ?? 0
    );
    const totalNuevosPedido = Number(
      p.totalNuevos ?? p.TotalNuevos ?? 0
    );
    const totalGeneralPedido = Number(
      p.totalGeneral ?? p.TotalGeneral ?? 0
    );

    const win = window.open("", "_blank");
    if (!win) return;

    const fechaLocal = new Date(p.fecha).toLocaleString();

    const rowsHtml = (items || [])
      .map(
        (it, idx) => `
        <tr>
          <td style="padding:4px;">${idx + 1}</td>
          <td style="padding:4px;">${it.origen ?? it.Origen ?? ""}</td>
          <td style="padding:4px;">${it.nombre ?? it.Nombre ?? ""}</td>
          <td style="padding:4px;">${it.tipo ?? it.Tipo ?? ""}</td>
          <td style="padding:4px; text-align:right;">${
            it.cantidad ?? it.Cantidad ?? ""
          }</td>
          <td style="padding:4px; text-align:right;">
            $${Number(it.precio ?? it.Precio ?? 0).toFixed(2)}
          </td>
          <td style="padding:4px; text-align:right;">
            $${Number(it.subtotal ?? it.Subtotal ?? 0).toFixed(2)}
          </td>
        </tr>`
      )
      .join("");

    win.document.write(`
      <html>
        <head>
          <title>Pedido proveedor</title>
          <meta charset="utf-8" />
        </head>
        <body style="font-family: Arial, sans-serif; padding:16px;">
          <h2>Pedido a proveedor</h2>
          <p><b>Fecha:</b> ${fechaLocal}</p>
          <p><b>Proveedor:</b> ${proveedorNombre}</p>
          <p><b>Solicitado por:</b> ${solicitadoPor}</p>
          <p><b>Notas:</b> ${notas}</p>

          <table style="width:100%; border-collapse:collapse; margin-top:16px; font-size:13px;" border="1">
            <thead>
              <tr>
                <th style="padding:4px;">#</th>
                <th style="padding:4px;">Origen</th>
                <th style="padding:4px;">Medicamento</th>
                <th style="padding:4px;">Tipo</th>
                <th style="padding:4px;">Cantidad</th>
                <th style="padding:4px;">Precio</th>
                <th style="padding:4px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${
                rowsHtml ||
                "<tr><td colspan='7' style='text-align:center; padding:8px;'>Sin items</td></tr>"
              }
            </tbody>
          </table>

          <h3 style="margin-top:16px; text-align:right;">
            Totales
          </h3>
          <p style="text-align:right; margin:0;">
            <b>Total medicamentos existentes:</b>
            $${totalExistentesPedido.toFixed(2)}
          </p>
          <p style="text-align:right; margin:0;">
            <b>Total medicamentos nuevos:</b>
            $${totalNuevosPedido.toFixed(2)}
          </p>
          <p style="text-align:right; margin:0;">
            <b>Total general del pedido:</b>
            $${totalGeneralPedido.toFixed(2)}
          </p>

          <script>
            window.print();
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // ==========================
  // 7) Totales del pedido ACTUAL
  // ==========================
  const proveedorSeleccionado = proveedores.find(
    (p) => (p.id ?? p.Id) === Number(proveedorId)
  );

  const totalExistentes = itemsExistentes.reduce(
    (sum, it) => sum + it.subtotal,
    0
  );
  const totalNuevos = itemsNuevos.reduce(
    (sum, it) => sum + it.subtotal,
    0
  );
  const totalGeneral = totalExistentes + totalNuevos;

  // ==========================
  // Render
  // ==========================
  return (
    <>
      {/* Topbar simple (ya tienes admin-menu en inicio.css) */}
      <header className="admin-menu">
        <div className="admin-left">
          <div className="admin-logo">
            <span className="logo-badge"></span>
            <div className="logo-text">
              <span className="logo-title">Farmacia</span>
              <span className="logo-subtitle">Panel administrador</span>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "34px auto", padding: "0 16px" }}>
        <h1 style={{ marginBottom: 10, fontSize: 26 }}>
          Pedir medicamentos por proveedor
        </h1>

        {/* Botón regresar (azul) */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            marginBottom: 20,
            background: "linear-gradient(90deg,#2563eb,#1d4ed8)",
            color: "#ffffff",
            fontWeight: 600,
            border: "1px solid #1d4ed8",
            padding: "10px 22px",
            borderRadius: "999px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 10px 25px rgba(37,99,235,0.55)",
            transition: "background 0.2s, box-shadow 0.2s, transform 0.1s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(90deg,#1d4ed8,#1e40af)";
            e.currentTarget.style.boxShadow =
              "0 12px 30px rgba(30,64,175,0.65)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(90deg,#2563eb,#1d4ed8)";
            e.currentTarget.style.boxShadow =
              "0 10px 25px rgba(37,99,235,0.55)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          ← Regresar
        </button>

        {/* Selector de proveedor */}
        <div
          className="card pedido-card"
          style={{ marginBottom: 18, display: "grid", gap: 10 }}
        >
          <label className="pedido-label">Proveedor</label>
          <select
            value={proveedorId}
            onChange={onChangeProveedor}
            className="pedido-field"
          >
            <option value="">-- Selecciona un proveedor --</option>
            {proveedores.map((p) => (
              <option key={p.id ?? p.Id} value={p.id ?? p.Id}>
                {p.nombre ?? p.Nombre}
              </option>
            ))}
          </select>
          <small className="pedido-help">
            Primero elige el proveedor con el que vas a hacer el pedido.
          </small>
        </div>

        {/* Card principal: tabs + formularios */}
        <div className="card pedido-card" style={{ display: "grid", gap: 18 }}>
          {/* Tabs */}
          <div className="tab-row">
            <button
              type="button"
              className="tab-btn"
              data-active={modo === "existente"}
              onClick={() => onChangeModo("existente")}
            >
              Pedir de medicamento existente
            </button>
            <button
              type="button"
              className="tab-btn"
              data-active={modo === "nuevo"}
              onClick={() => onChangeModo("nuevo")}
            >
              Crear nuevo medicamento
            </button>
          </div>

          {/* Formulario: EXISTENTE */}
          {modo === "existente" && (
            <form
              onSubmit={onAddExistenteToCarrito}
              style={{ display: "grid", gap: 14, marginTop: 4 }}
            >
              <h3 className="pedido-title">Agregar al pedido (existente)</h3>

              <div className="grid2">
                <div className="pedido-field-wrap">
                  <label className="pedido-label">Medicamento</label>
                  <select
                    name="medicamentoId"
                    value={pedidoExistente.medicamentoId}
                    onChange={onChangePedidoExistente}
                    className="pedido-field"
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

                <div className="pedido-field-wrap">
                  <label className="pedido-label">Cantidad a pedir</label>
                  <input
                    type="number"
                    min="1"
                    name="cantidad"
                    value={pedidoExistente.cantidad}
                    onChange={onChangePedidoExistente}
                    className="pedido-field"
                    required
                  />
                </div>
              </div>

              <div style={{ marginTop: 4 }}>
                <button
                  type="submit"
                  className="btn teal"
                  disabled={loading}
                  style={{ paddingInline: 20 }}
                >
                  Agregar al pedido
                </button>
              </div>
            </form>
          )}

          {/* Formulario: NUEVO */}
          {modo === "nuevo" && (
            <form
              onSubmit={onAddNuevoToCarrito}
              style={{ display: "grid", gap: 14, marginTop: 4 }}
            >
              <h3 className="pedido-title">
                Agregar al pedido (nuevo medicamento)
              </h3>

              <div className="grid2">
                <div className="pedido-field-wrap">
                  <label className="pedido-label">Nombre</label>
                  <input
                    name="nombre"
                    value={nuevoMed.nombre}
                    onChange={onChangeNuevoMed}
                    className="pedido-field"
                    required
                  />
                </div>
                <div className="pedido-field-wrap">
                  <label className="pedido-label">Tipo</label>
                  <input
                    name="tipo"
                    value={nuevoMed.tipo}
                    onChange={onChangeNuevoMed}
                    className="pedido-field"
                    placeholder="Tableta, jarabe, etc."
                  />
                </div>
              </div>

              <div className="grid2">
                <div className="pedido-field-wrap">
                  <label className="pedido-label">Cantidad inicial</label>
                  <input
                    type="number"
                    min="0"
                    name="cantidad"
                    value={nuevoMed.cantidad}
                    onChange={onChangeNuevoMed}
                    className="pedido-field"
                    required
                  />
                </div>
                <div className="pedido-field-wrap">
                  <label className="pedido-label">Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="precio"
                    value={nuevoMed.precio}
                    onChange={onChangeNuevoMed}
                    className="pedido-field"
                    required
                  />
                </div>
              </div>

              <div className="pedido-field-wrap">
                <label className="pedido-label">Descripción</label>
                <textarea
                  rows={3}
                  name="descripcion"
                  value={nuevoMed.descripcion}
                  onChange={onChangeNuevoMed}
                  className="pedido-field"
                />
              </div>

              <div className="grid3">
                <div className="pedido-field-wrap">
                  <label className="pedido-label">Beneficios</label>
                  <textarea
                    rows={3}
                    name="beneficios"
                    value={nuevoMed.beneficios}
                    onChange={onChangeNuevoMed}
                    className="pedido-field"
                  />
                </div>
                <div className="pedido-field-wrap">
                  <label className="pedido-label">Instrucciones</label>
                  <textarea
                    rows={3}
                    name="instrucciones"
                    value={nuevoMed.instrucciones}
                    onChange={onChangeNuevoMed}
                    className="pedido-field"
                  />
                </div>
                <div className="pedido-field-wrap">
                  <label className="pedido-label">Advertencias</label>
                  <textarea
                    rows={3}
                    name="advertencias"
                    value={nuevoMed.advertencias}
                    onChange={onChangeNuevoMed}
                    className="pedido-field"
                  />
                </div>
              </div>

              <div className="pedido-field-wrap">
                <label className="pedido-label">
                  URL de la foto (opcional)
                </label>
                <input
                  type="url"
                  name="fotoUrl"
                  value={nuevoMed.fotoUrl}
                  onChange={onChangeNuevoMed}
                  className="pedido-field"
                  placeholder="https://mi-cdn.com/img/producto.png"
                />
              </div>

              <div style={{ marginTop: 4 }}>
                <button
                  type="submit"
                  className="btn teal"
                  disabled={loading}
                  style={{ paddingInline: 20 }}
                >
                  Agregar al pedido
                </button>
              </div>
            </form>
          )}

          {msg && (
            <p
              style={{
                marginTop: 8,
                fontSize: 14,
                color: msg.startsWith("✅") ? "#16a34a" : "#b91c1c",
              }}
            >
              {msg}
            </p>
          )}
        </div>

        {/* Resumen del pedido */}
        <div className="card pedido-card" style={{ marginTop: 20 }}>
          <h2 className="pedido-title">Resumen del pedido</h2>

          <div className="grid2">
            <div className="pedido-field-wrap">
              <label className="pedido-label">Proveedor que envía</label>
              <div className="pedido-chip">
                {proveedorSeleccionado
                  ? `${
                      proveedorSeleccionado.nombre ??
                      proveedorSeleccionado.Nombre
                    } (${
                      proveedorSeleccionado.contacto ??
                      proveedorSeleccionado.Contacto ??
                      "sin contacto"
                    })`
                  : "Sin proveedor seleccionado"}
              </div>
            </div>

            <div className="pedido-field-wrap">
              <label className="pedido-label">Solicitado por</label>
              <input
                value={solicitadoPor}
                onChange={(e) => setSolicitadoPor(e.target.value)}
                className="pedido-field"
                placeholder="Nombre de quien hace el pedido"
              />
            </div>
          </div>

          <div className="pedido-field-wrap">
            <label className="pedido-label">Notas del pedido</label>
            <textarea
              rows={3}
              value={notasPedido}
              onChange={(e) => setNotasPedido(e.target.value)}
              className="pedido-field"
              placeholder="Ej. Urgente, entregar antes del viernes, etc."
            />
          </div>

          {/* Tabla de items */}
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 8 }}>Origen</th>
                  <th style={{ textAlign: "left", padding: 8 }}>
                    Medicamento
                  </th>
                  <th style={{ textAlign: "left", padding: 8 }}>Tipo</th>
                  <th style={{ textAlign: "right", padding: 8 }}>Cantidad</th>
                  <th style={{ textAlign: "right", padding: 8 }}>Precio</th>
                  <th style={{ textAlign: "right", padding: 8 }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {itemsExistentes.map((it) => (
                  <tr key={`ex-${it.id}`}>
                    <td style={{ padding: 8 }}>Existente</td>
                    <td style={{ padding: 8 }}>{it.nombre}</td>
                    <td style={{ padding: 8 }}>{it.tipo}</td>
                    <td style={{ padding: 8, textAlign: "right" }}>
                      {it.cantidad}
                    </td>
                    <td style={{ padding: 8, textAlign: "right" }}>
                      ${it.precio.toFixed(2)}
                    </td>
                    <td style={{ padding: 8, textAlign: "right" }}>
                      ${it.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}

                {itemsNuevos.map((it) => (
                  <tr key={`new-${it.tempId}`}>
                    <td style={{ padding: 8 }}>Nuevo</td>
                    <td style={{ padding: 8 }}>{it.nombre}</td>
                    <td style={{ padding: 8 }}>{it.tipo}</td>
                    <td style={{ padding: 8, textAlign: "right" }}>
                      {it.cantidad}
                    </td>
                    <td style={{ padding: 8, textAlign: "right" }}>
                      ${it.precio.toFixed(2)}
                    </td>
                    <td style={{ padding: 8, textAlign: "right" }}>
                      ${it.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}

                {itemsExistentes.length === 0 && itemsNuevos.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: 8,
                        textAlign: "center",
                        color: "#6b7280",
                      }}
                    >
                      No hay medicamentos en el pedido todavía.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5} style={{ padding: 8, textAlign: "right" }}>
                    <b>Total medicamentos existentes:</b>
                  </td>
                  <td style={{ padding: 8, textAlign: "right" }}>
                    ${totalExistentes.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={5} style={{ padding: 8, textAlign: "right" }}>
                    <b>Total medicamentos nuevos:</b>
                  </td>
                  <td style={{ padding: 8, textAlign: "right" }}>
                    ${totalNuevos.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={5} style={{ padding: 8, textAlign: "right" }}>
                    <b>Total general del pedido:</b>
                  </td>
                  <td style={{ padding: 8, textAlign: "right" }}>
                    ${totalGeneral.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style={{ marginTop: 10 }}>
            <button
              type="button"
              className="btn teal"
              disabled={
                loading ||
                (!itemsExistentes.length && !itemsNuevos.length) ||
                !proveedorId
              }
              onClick={onConfirmarPedido}
              style={{ paddingInline: 24 }}
            >
              {loading
                ? "Procesando pedido…"
                : "Confirmar pedido y actualizar inventario"}
            </button>
          </div>
        </div>

        {/* Historial */}
        <div className="card pedido-card" style={{ marginTop: 24 }}>
          <h2 className="pedido-title">Historial de pedidos</h2>

          {(!proveedorId || historial.length === 0) && (
            <p style={{ fontSize: 14, color: "#cbd5f5" }}>
              {proveedorId
                ? "Este proveedor aún no tiene pedidos registrados."
                : "Selecciona un proveedor para ver su historial de pedidos."}
            </p>
          )}

          {proveedorId && historial.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr>
                    <th style={{ padding: 8, textAlign: "left" }}>Fecha</th>
                    <th style={{ padding: 8, textAlign: "left" }}>
                      Solicitado por
                    </th>
                    <th style={{ padding: 8, textAlign: "right" }}>
                      Total existentes
                    </th>
                    <th style={{ padding: 8, textAlign: "right" }}>
                      Total nuevos
                    </th>
                    <th style={{ padding: 8, textAlign: "right" }}>
                      Total general
                    </th>
                    <th style={{ padding: 8, textAlign: "center" }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((p, idx) => {
                    const totalExistentesPedido = Number(
                      p.totalExistentes ?? p.TotalExistentes ?? 0
                    );
                    const totalNuevosPedido = Number(
                      p.totalNuevos ?? p.TotalNuevos ?? 0
                    );
                    const totalGeneralPedido = Number(
                      p.totalGeneral ?? p.TotalGeneral ?? 0
                    );

                    return (
                      <tr key={idx}>
                        <td style={{ padding: 8 }}>
                          {new Date(p.fecha).toLocaleString()}
                        </td>
                        <td style={{ padding: 8 }}>
                          {p.solicitadoPor || "Sin nombre"}
                        </td>
                        <td
                          style={{
                            padding: 8,
                            textAlign: "right",
                          }}
                        >
                          ${totalExistentesPedido.toFixed(2)}
                        </td>
                        <td
                          style={{
                            padding: 8,
                            textAlign: "right",
                          }}
                        >
                          ${totalNuevosPedido.toFixed(2)}
                        </td>
                        <td
                          style={{
                            padding: 8,
                            textAlign: "right",
                          }}
                        >
                          ${totalGeneralPedido.toFixed(2)}
                        </td>
                        <td
                          style={{
                            padding: 8,
                            textAlign: "center",
                          }}
                        >
                          <button
                            type="button"
                            className="chip"
                            onClick={() => handleExportPedido(p)}
                            style={{
                              fontSize: 12,
                              padding: "6px 10px",
                            }}
                          >
                            📄 Ver / descargar PDF
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Estilos locales */}
        <style>{`
          .pedido-card {
            padding: 22px;
            border-radius: 22px;
            background: radial-gradient(circle at top left,#0f172a 0,#020617 55%);
            border: 1px solid rgba(148,163,184,0.45);
            box-shadow:
              0 0 0 1px rgba(15,23,42,0.7),
              0 18px 40px rgba(15,23,42,0.85);
            color: #e5e7eb;
          }

          .pedido-title {
            margin: 0 0 8px 0;
            font-size: 20px;
            color: #e5e7eb;
          }

          .pedido-label {
            display: block;
            font-weight: 600;
            margin-bottom: 4px;
            font-size: 13px;
            color: #e5e7eb;
          }

          .pedido-help {
            color: #cbd5f5;
            font-size: 13px;
          }

          .grid2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
          }
          .grid3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 14px;
          }
          @media (max-width: 900px){
            .grid2, .grid3 { grid-template-columns: 1fr; }
          }

          .pedido-field-wrap {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .pedido-field {
            width: 100%;
            padding: 10px 12px;
            border-radius: 12px;
            border: 1px solid #1d4ed8;
            background: rgba(15,23,42,0.85);
            outline: none;
            font-size: 14px;
            color: #f9fafb;
            backdrop-filter: blur(18px);
            transition: border-color 0.2s, box-shadow 0.2s, background 0.2s, transform 0.1s;
          }

          /* Para que los SELECT no queden texto blanco sobre blanco */
          select.pedido-field {
            background: rgba(15,23,42,0.95);
            color: #f9fafb;
          }
          select.pedido-field option {
            background: #020617;
            color: #f9fafb;
          }

          .pedido-field:focus {
            border-color: #38bdf8;
            background: rgba(15,23,42,0.98);
            box-shadow:
              0 0 0 1px rgba(56,189,248,0.6),
              0 0 0 6px rgba(30,64,175,0.6);
            transform: translateY(-1px);
          }

          .pedido-chip {
            padding: 10px 12px;
            border-radius: 12px;
            border: 1px solid rgba(148,163,184,0.6);
            background: rgba(15,23,42,0.9);
            font-size: 14px;
          }

          .tab-row {
            display: flex;
            gap: 8px;
            margin-bottom: 8px;
          }

          .tab-btn {
            flex: 1;
            padding: 8px 10px;
            border-radius: 999px;
            border: 1px solid rgba(148,163,184,0.7);
            background: rgba(15,23,42,0.9);
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            color: #e5e7eb;
            transition: background 0.2s, color 0.2s, border-color 0.2s,
              box-shadow 0.2s, transform 0.1s;
          }

          .tab-btn[data-active="true"] {
            background: linear-gradient(90deg,#2563eb,#22c55e);
            border-color: #38bdf8;
            color: #f9fafb;
            box-shadow: 0 10px 26px rgba(37,99,235,0.7);
            transform: translateY(-1px);
          }

          .tab-btn[data-active="false"] {
            color: #e5e7eb;
          }
        `}</style>
      </div>
    </>
  );
}
