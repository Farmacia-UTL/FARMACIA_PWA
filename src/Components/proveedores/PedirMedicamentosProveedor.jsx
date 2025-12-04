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

      // 5.3 Registrar pedido en historial del proveedor (DTO del back)
      const dtoHist = {
        solicitadoPor: solicitadoPor || "Sin nombre",
        notas: notasPedido || "",
        items: [
          ...itemsExistentes.map((it) => ({
            origen: "Existente",
            nombreMedicamento: it.nombre,
            tipo: it.tipo || null,
            cantidad: it.cantidad,
            precio: it.precio,
          })),
          ...itemsNuevos.map((it) => ({
            origen: "Nuevo",
            nombreMedicamento: it.nombre,
            tipo: it.tipo || null,
            cantidad: it.cantidad,
            precio: it.precio,
          })),
        ],
      };

      const respHist = await fetch(
        `${API_URL}/api/Proveedores/${proveedorId}/pedidos-historial`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dtoHist),
        }
      );

      if (!respHist.ok) {
        const txt = await respHist.text();
        console.error("Error al guardar historial:", txt);
      } else {
        const guardado = await respHist.json().catch(() => null);
        if (guardado) {
          setHistorial((lista) => [...lista, guardado]);
        }
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

    const num = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    const items = Array.isArray(p.items)
      ? p.items
      : Array.isArray(p.Items)
      ? p.Items
      : [];

    const proveedorSeleccionado = proveedores.find(
      (prov) => (prov.id ?? prov.Id) === Number(proveedorId)
    );
    const proveedorNombre =
      proveedorSeleccionado?.nombre ??
      proveedorSeleccionado?.Nombre ??
      "";

    const solicitadoPor = p.solicitadoPor ?? p.SolicitadoPor ?? "";
    const notas = p.notas ?? p.Notas ?? "";

    const totalExistentesPedido = num(
      p.totalExistentes ?? p.TotalExistentes
    );
    const totalNuevosPedido = num(p.totalNuevos ?? p.TotalNuevos);
    const totalGeneralPedido = num(p.totalGeneral ?? p.TotalGeneral);

    const win = window.open("", "_blank");
    if (!win) return;

    const fechaIso = p.fecha ?? p.Fecha ?? new Date().toISOString();
    const fechaLocal = new Date(fechaIso).toLocaleString();

    const rowsHtml = (items || [])
      .map((it, idx) => {
        const cant = num(it.cantidad ?? it.Cantidad);
        const precio = num(it.precio ?? it.Precio);
        const subtotal = num(it.subtotal ?? it.Subtotal);

        const nombreMed =
          it.nombreMedicamento ??
          it.NombreMedicamento ??
          it.nombre ??
          it.Nombre ??
          "";

        return `
          <tr>
            <td style="padding:4px;">${idx + 1}</td>
            <td style="padding:4px;">${it.origen ?? it.Origen ?? ""}</td>
            <td style="padding:4px;">${nombreMed}</td>
            <td style="padding:4px;">${it.tipo ?? it.Tipo ?? ""}</td>
            <td style="padding:4px; text-align:right;">${cant}</td>
            <td style="padding:4px; text-align:right;">
              $${precio.toFixed(2)}
            </td>
            <td style="padding:4px; text-align:right;">
              $${subtotal.toFixed(2)}
            </td>
          </tr>`;
      })
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
          <p><b>Proveedor:</b> ${proveedorNombre || "(sin nombre)"}</p>
          <p><b>Solicitado por:</b> ${solicitadoPor || "(sin nombre)"}</p>
          <p><b>Notas:</b> ${notas || "(sin notas)"}</p>

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
  const totalNuevos = itemsNuevos.reduce((sum, it) => sum + it.subtotal, 0);
  const totalGeneral = totalExistentes + totalNuevos;

  // ==========================
  // Render
  // ==========================
  return (
    <>
      {/* Topbar simple (admin-menu ya viene de inicio.css) */}
      <header className="admin-menu">
        <div className="admin-left">
          <div className="admin-logo">
            <span className="logo-badge">⚕</span>
            <div className="logo-text">
              <span className="logo-title">Farmacia · Admin</span>
              <span className="logo-subtitle">Pedidos a proveedores</span>
            </div>
          </div>
        </div>
      </header>

      <main className="pedido-page">
        <header className="pedido-header">
          <div>
            <h1>Pedidos a proveedores</h1>
            <p>
              Elige un proveedor, agrega medicamentos al pedido y actualiza el
              inventario de forma controlada.
            </p>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(-1)}
          >
            ← Regresar
          </button>
        </header>

        {/* Selector de proveedor */}
        <section className="pedido-card">
          <div className="pedido-card-header">
            <div className="pedido-icon">🏢</div>
            <div>
              <h2>Proveedor</h2>
              <p>Selecciona el proveedor con el que vas a realizar el pedido.</p>
            </div>
          </div>

          <div className="pedido-field-wrap">
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
              Al cambiar de proveedor se limpiará el pedido actual.
            </small>
          </div>
        </section>

        {/* Card principal: tabs + formularios */}
        <section className="pedido-card">
          <div className="pedido-card-header">
            <div className="pedido-icon">💊</div>
            <div>
              <h2>Agregar medicamentos al pedido</h2>
              <p>
                Puedes solicitar medicamentos ya registrados o crear nuevos al
                mismo tiempo.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="tab-row">
            <button
              type="button"
              className={`tab-btn ${modo === "existente" ? "active" : ""}`}
              onClick={() => onChangeModo("existente")}
            >
              Medicamento existente
            </button>
            <button
              type="button"
              className={`tab-btn ${modo === "nuevo" ? "active" : ""}`}
              onClick={() => onChangeModo("nuevo")}
            >
              Nuevo medicamento
            </button>
          </div>

          {/* Formulario: EXISTENTE */}
          {modo === "existente" && (
            <form
              onSubmit={onAddExistenteToCarrito}
              className="pedido-form-grid"
            >
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

              <div className="pedido-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  Agregar al pedido
                </button>
              </div>
            </form>
          )}

          {/* Formulario: NUEVO */}
          {modo === "nuevo" && (
            <form onSubmit={onAddNuevoToCarrito} className="pedido-form-grid">
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
                  className="pedido-field textarea"
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
                    className="pedido-field textarea"
                  />
                </div>
                <div className="pedido-field-wrap">
                  <label className="pedido-label">Instrucciones</label>
                  <textarea
                    rows={3}
                    name="instrucciones"
                    value={nuevoMed.instrucciones}
                    onChange={onChangeNuevoMed}
                    className="pedido-field textarea"
                  />
                </div>
                <div className="pedido-field-wrap">
                  <label className="pedido-label">Advertencias</label>
                  <textarea
                    rows={3}
                    name="advertencias"
                    value={nuevoMed.advertencias}
                    onChange={onChangeNuevoMed}
                    className="pedido-field textarea"
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

              <div className="pedido-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  Agregar al pedido
                </button>
              </div>
            </form>
          )}

          {msg && (
            <p
              className={`pedido-msg ${
                msg.startsWith("✅") ? "ok" : "err"
              }`}
            >
              {msg}
            </p>
          )}
        </section>

        {/* Resumen del pedido */}
        <section className="pedido-card">
          <div className="pedido-card-header">
            <div className="pedido-icon">🧾</div>
            <div>
              <h2>Resumen del pedido</h2>
              <p>
                Revisa los medicamentos incluidos antes de confirmar y actualizar el inventario.
              </p>
            </div>
          </div>

          <div className="grid2">
            <div className="pedido-field-wrap">
              <label className="pedido-label">Proveedor que envía</label>
              <div className="pill-info">
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
              className="pedido-field textarea"
              placeholder="Ej. Urgente, entregar antes del viernes, etc."
            />
          </div>

          {/* Tabla de items */}
          <div className="table-wrap">
            <table className="pedido-table">
              <thead>
                <tr>
                  <th>Origen</th>
                  <th>Medicamento</th>
                  <th>Tipo</th>
                  <th style={{ textAlign: "right" }}>Cantidad</th>
                  <th style={{ textAlign: "right" }}>Precio</th>
                  <th style={{ textAlign: "right" }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {itemsExistentes.map((it) => (
                  <tr key={`ex-${it.id}`}>
                    <td>Existente</td>
                    <td>{it.nombre}</td>
                    <td>{it.tipo}</td>
                    <td style={{ textAlign: "right" }}>{it.cantidad}</td>
                    <td style={{ textAlign: "right" }}>
                      ${it.precio.toFixed(2)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      ${it.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}

                {itemsNuevos.map((it) => (
                  <tr key={`new-${it.tempId}`}>
                    <td>Nuevo</td>
                    <td>{it.nombre}</td>
                    <td>{it.tipo}</td>
                    <td style={{ textAlign: "right" }}>{it.cantidad}</td>
                    <td style={{ textAlign: "right" }}>
                      ${it.precio.toFixed(2)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      ${it.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}

                {itemsExistentes.length === 0 &&
                  itemsNuevos.length === 0 && (
                    <tr>
                      <td colSpan={6} className="pedido-empty">
                        No hay medicamentos en el pedido todavía.
                      </td>
                    </tr>
                  )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5} className="pedido-total-label">
                    Total medicamentos existentes:
                  </td>
                  <td className="pedido-total-value">
                    ${totalExistentes.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={5} className="pedido-total-label">
                    Total medicamentos nuevos:
                  </td>
                  <td className="pedido-total-value">
                    ${totalNuevos.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={5} className="pedido-total-label">
                    Total general del pedido:
                  </td>
                  <td className="pedido-total-value">
                    ${totalGeneral.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="pedido-actions">
            <button
              type="button"
              className="btn-teal"
              disabled={
                loading ||
                (!itemsExistentes.length && !itemsNuevos.length) ||
                !proveedorId
              }
              onClick={onConfirmarPedido}
            >
              {loading
                ? "Procesando pedido…"
                : "Confirmar pedido y actualizar inventario"}
            </button>
          </div>
        </section>

        {/* Historial */}
        <section className="pedido-card">
          <div className="pedido-card-header">
            <div className="pedido-icon">📚</div>
            <div>
              <h2>Historial de pedidos</h2>
              <p>
                Consulta pedidos anteriores y genera un PDF con el detalle de cada uno.
              </p>
            </div>
          </div>

          {(!proveedorId || historial.length === 0) && (
            <p className="pedido-helper-text">
              {proveedorId
                ? "Este proveedor aún no tiene pedidos registrados."
                : "Selecciona un proveedor para ver su historial de pedidos."}
            </p>
          )}

          {proveedorId && historial.length > 0 && (
            <div className="table-wrap">
              <table className="pedido-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Solicitado por</th>
                    <th style={{ textAlign: "right" }}>Total existentes</th>
                    <th style={{ textAlign: "right" }}>Total nuevos</th>
                    <th style={{ textAlign: "right" }}>Total general</th>
                    <th style={{ textAlign: "center" }}>Acciones</th>
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
                        <td>
                          {new Date(p.fecha ?? p.Fecha).toLocaleString()}
                        </td>
                        <td>
                          {p.solicitadoPor ??
                            p.SolicitadoPor ??
                            "Sin nombre"}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          ${totalExistentesPedido.toFixed(2)}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          ${totalNuevosPedido.toFixed(2)}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          ${totalGeneralPedido.toFixed(2)}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            type="button"
                            className="btn-chip"
                            onClick={() => handleExportPedido(p)}
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
        </section>

        {/* Estilos locales */}
        <style>{`
          .pedido-page {
            max-width: 1100px;
            margin: 32px auto 40px;
            padding: 0 18px;
            color: #0f172a;
          }

          .pedido-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 18px;
          }

          .pedido-header h1 {
            margin: 0;
            font-size: 28px;
            color: #ffffff;
          }

          .pedido-header p {
            margin: 4px 0 0;
            font-size: 14px;
            color: #FFFFFF;
          }

          .btn-secondary {
            background: linear-gradient(90deg,#0ea5e9,#3b82f6);
            color: #ffffff;
            border: none;
            padding: 9px 18px;
            border-radius: 999px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 10px 22px rgba(37,99,235,0.35);
          }

          .btn-secondary:hover {
            filter: brightness(1.05);
            transform: translateY(-1px);
          }

          .pedido-card {
            margin-bottom: 18px;
            padding: 20px 20px 22px;
            border-radius: 22px;
            background: linear-gradient(145deg,#ffffff,#f1f5f9);
            border: 1px solid rgba(148,163,184,0.55);
            box-shadow:
              0 0 0 1px rgba(148,163,184,0.15),
              0 16px 40px rgba(15,23,42,0.12);
          }

          .pedido-card-header {
            display: flex;
            gap: 10px;
            align-items: center;
            margin-bottom: 12px;
          }

          .pedido-card-header h2 {
            margin: 0;
            font-size: 20px;
            color: #111827;
          }

          .pedido-card-header p {
            margin: 2px 0 0;
            font-size: 13px;
            color: #6b7280;
          }

          .pedido-icon {
            width: 42px;
            height: 42px;
            border-radius: 999px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            background: radial-gradient(circle at 30% 20%, #4ade80, #2563eb);
            color: #eff6ff;
            box-shadow: 0 10px 20px rgba(37,99,235,0.45);
          }

          .pedido-field-wrap {
            display: flex;
            flex-direction: column;
            gap: 4px;
            margin-bottom: 12px;
          }

          .pedido-label {
            font-size: 13px;
            font-weight: 600;
            color: #111827;
          }

          .pedido-help {
            color: #6b7280;
            font-size: 12px;
          }

          .pedido-field {
            width: 100%;
            padding: 9px 3px;
            border-radius: 12px;
            border: 1px solid #cbd5e1;
            background: #ffffff;
            font-size: 14px;
            color: #0f172a;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s, transform 0.1s;
          }

          .pedido-field.textarea {
            resize: vertical;
          }

          .pedido-field:focus {
            border-color: #3b82f6;
            box-shadow:
              0 0 0 1px rgba(59,130,246,0.2),
              0 0 0 4px rgba(191,219,254,0.75);
            transform: translateY(-1px);
          }

          select.pedido-field {
            appearance: none;
            background-image:
              linear-gradient(45deg, transparent 50%, #64748b 50%),
              linear-gradient(135deg, #64748b 50%, transparent 50%);
            background-position:
              calc(100% - 14px) 10px,
              calc(100% - 9px) 10px;
            background-size: 5px 5px, 5px 5px;
            background-repeat: no-repeat;
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

          @media (max-width: 900px) {
            .grid2,
            .grid3 {
              grid-template-columns: 1fr;
            }

            .pedido-header {
              flex-direction: column;
              align-items: flex-start;
            }
          }

          .tab-row {
            display: inline-flex;
            gap: 8px;
            padding: 4px;
            background: #e5edff;
            border-radius: 999px;
            margin-bottom: 12px;
          }

          .tab-btn {
            border: none;
            background: transparent;
            padding: 7px 14px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            color: #475569;
          }

          .tab-btn.active {
            background: linear-gradient(90deg,#2563eb,#22c55e);
            color: #f9fafb;
            box-shadow: 0 8px 20px rgba(37,99,235,0.55);
          }

          .pedido-form-grid {
            margin-top: 8px;
          }

          .pedido-actions {
            margin-top: 8px;
            display: flex;
            gap: 8px;
            justify-content: flex-end;
          }

          .btn-primary {
            background: linear-gradient(90deg,#2563eb,#1d4ed8);
            color: #ffffff;
            border: none;
            padding: 9px 18px;
            border-radius: 999px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 10px 22px rgba(37,99,235,0.4);
          }

          .btn-primary:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            box-shadow: none;
          }

          .btn-primary:hover:not(:disabled) {
            filter: brightness(1.05);
            transform: translateY(-1px);
          }

          .btn-teal {
            background: linear-gradient(90deg,#14b8a6,#0ea5e9);
            color: #ffffff;
            border: none;
            padding: 10px 22px;
            border-radius: 999px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 12px 26px rgba(20,184,166,0.45);
          }

          .btn-teal:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            box-shadow: none;
          }

          .btn-teal:hover:not(:disabled) {
            filter: brightness(1.05);
            transform: translateY(-1px);
          }

          .pedido-msg {
            font-size: 13px;
            margin-top: 10px;
          }

          .pedido-msg.ok {
            color: #16a34a;
          }

          .pedido-msg.err {
            color: #b91c1c;
          }

          .pill-info {
            padding: 9px 11px;
            border-radius: 12px;
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            font-size: 13px;
            color: #1f2933;
          }

          .table-wrap {
            overflow-x: auto;
            margin-top: 10px;
          }

          .pedido-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
          }

          .pedido-table th {
            padding: 9px 8px;
            text-align: left;
            background: #e5edff;
            color: #1f2937;
            border-bottom: 1px solid #d1d5db;
          }

          .pedido-table td {
            padding: 9px 8px;
            border-bottom: 1px solid #e5e7eb;
            color: #111827;
          }

          .pedido-empty {
            text-align: center;
            padding: 12px;
            color: #94a3b8;
          }

          .pedido-total-label {
            padding: 8px;
            text-align: right;
            font-weight: 600;
            background: #f9fafb;
          }

          .pedido-total-value {
            padding: 8px;
            text-align: right;
            font-weight: 700;
            background: #f9fafb;
          }

          .btn-chip {
            border: none;
            background: #eff6ff;
            color: #1d4ed8;
            padding: 6px 12px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(148,163,184,0.4);
          }

          .btn-chip:hover {
            filter: brightness(1.04);
            transform: translateY(-1px);
          }

          .pedido-helper-text {
            font-size: 13px;
            color: #6b7280;
            margin: 4px 0 0;
          }
        `}</style>
      </main>
    </>
  );
}
