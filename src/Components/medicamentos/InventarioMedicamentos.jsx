import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import "./inventarioMedicamentos.css";

const API_URL = import.meta.env.VITE_API_URL || "https://api-farmacia.ngrok.app";

export default function InventarioMedicamentos() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  // filtros/orden
  const [estado, setEstado] = useState("todos"); // todos | activos | inactivos
  const [tipo, setTipo] = useState("todos");
  const [orden, setOrden] = useState("recientes"); // recientes | precioAsc | precioDesc | cantidad

  // Modales
  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [imgOk, setImgOk] = useState(true);

  // Cargar datos
  const cargar = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/api/Medicamentos`);
      const data = await resp.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showToast("❌ No se pudo cargar el inventario");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { cargar(); }, []);

  // Tipos para filtro
  const tiposDisponibles = useMemo(() => {
    const tps = new Set(
      items.map(m => (m.tipo || "").trim()).filter(Boolean).map(s => s.toLowerCase())
    );
    return ["todos", ...Array.from(tps)];
  }, [items]);

  // Métricas
  const total = items.length;
  const activos = items.filter(m => m.activo).length;
  const inactivos = total - activos;

  // Helpers
  const foto = (src) => {
    if (!src) return "https://via.placeholder.com/320x220?text=Sin+Foto";
    if (/^https?:\/\//i.test(src)) return src;
    return `${API_URL}/${src.replace(/^\/+/, "")}`;
  };
  const money = (n) =>
    Number(n || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });
  const showToast = (t) => { setToast(t); setTimeout(() => setToast(""), 2200); };

  // Modales
  const openEdit = (item) => {
    setCurrent({
      ...item,
      descripcion: item.descripcion || "",
      beneficios: item.beneficios || "",
      instrucciones: item.instrucciones || "",
      advertencias: item.advertencias || "",
      fotoUrl: item.fotoUrl || "",
    });
    setImgOk(true);
    setEditOpen(true);
  };
  const closeEdit = () => { setEditOpen(false); setCurrent(null); };
  const openDelete = (item) => { setCurrent(item); setDelOpen(true); };
  const closeDelete = () => { setDelOpen(false); setCurrent(null); };

  // PUT JSON
  const saveEdit = async (e) => {
    e.preventDefault();
    if (!current) return;
    try {
      const payload = {
        nombre: current.nombre ?? "",
        cantidad: Number(current.cantidad ?? 0),
        tipo: current.tipo ?? "",
        precio: Number(current.precio ?? 0),
        descripcion: current.descripcion ?? "",
        beneficios: current.beneficios ?? "",
        instrucciones: current.instrucciones ?? "",
        advertencias: current.advertencias ?? "",
        fotoUrl: current.fotoUrl?.trim() || null,
      };
      const resp = await fetch(`${API_URL}/api/Medicamentos/${current.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error(await resp.text());
      showToast("✅ Medicamento actualizado");
      closeEdit();
      await cargar();
    } catch (err) {
      console.error(err);
      showToast("❌ No se pudo actualizar");
    }
  };

  // DELETE
  const confirmDelete = async () => {
    if (!current) return;
    try {
      const resp = await fetch(`${API_URL}/api/Medicamentos/${current.id}`, { method: "DELETE" });
      if (!resp.ok) throw new Error("Error al eliminar");
      showToast("🗑️ Eliminado");
      closeDelete();
      await cargar();
    } catch (err) {
      console.error(err);
      showToast("❌ No se pudo eliminar");
    }
  };

  // PATCH toggle
  const toggleActivo = async (item) => {
    try {
      const resp = await fetch(`${API_URL}/api/Medicamentos/${item.id}/toggle`, { method: "PATCH" });
      if (!resp.ok) throw new Error("Error al cambiar estado");
      showToast(item.activo ? "⛔ Desactivado" : "✅ Activado");
      await cargar();
    } catch (err) {
      console.error(err);
      showToast("❌ No se pudo cambiar estado");
    }
  };

  // Filtros/orden/búsqueda
  const view = useMemo(() => {
    let list = [...items];

    if (q.trim()) {
      const t = q.trim().toLowerCase();
      list = list.filter(m =>
        (m.nombre || "").toLowerCase().includes(t) ||
        (m.tipo || "").toLowerCase().includes(t)
      );
    }
    if (estado !== "todos") list = list.filter(m => (estado === "activos" ? m.activo : !m.activo));
    if (tipo !== "todos") list = list.filter(m => (m.tipo || "").toLowerCase() === tipo);

    switch (orden) {
      case "precioAsc": list.sort((a,b)=>Number(a.precio)-Number(b.precio)); break;
      case "precioDesc": list.sort((a,b)=>Number(b.precio)-Number(a.precio)); break;
      case "cantidad": list.sort((a,b)=>Number(b.cantidad)-Number(a.cantidad)); break;
      default:
        list.sort((a,b)=>
          new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
        );
    }
    return list;
  }, [items, q, estado, tipo, orden]);

  return (
    <div className="inv-wrap">

      {/* HERO / MÉTRICAS */}
      <section className="iv-hero">
        <div className="iv-hero-left">
          <h1>Inventario de medicamentos</h1>
          <p className="muted">
            Controla existencias, precios y estado. Todo en una vista moderna al estilo farmacia.
          </p>
          <div className="iv-hero-actions">
            <NavLink to="/medicamentos/agregar" className="btn teal">➕ Agregar</NavLink>
            <button className="btn ghost" onClick={cargar}>Recargar</button>
          </div>
        </div>

        <div className="iv-stats">
          <div className="stat">
            <div className="stat-num">{total}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat">
            <div className="stat-num ok">{activos}</div>
            <div className="stat-label">Activos</div>
          </div>
          <div className="stat">
            <div className="stat-num off">{inactivos}</div>
            <div className="stat-label">Inactivos</div>
          </div>
        </div>
      </section>

      {/* CONTROLES (sticky, SIN labels arriba) */}
      <section className="iv-controls sticky iv-controls--flat">
        <input
          className="ctrl-field"
          placeholder="Buscar por nombre o tipo…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <select
          className="ctrl-field"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        >
          <option value="todos">Estado: Todos</option>
          <option value="activos">Estado: Activos</option>
          <option value="inactivos">Estado: Inactivos</option>
        </select>

        <select
          className="ctrl-field"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="todos">Tipo: Todos</option>
          {tiposDisponibles.filter(t=>t!=="todos").map((t) => (
            <option key={t} value={t}>
              {t[0].toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>

        <select
          className="ctrl-field"
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
        >
          <option value="recientes">Orden: Más recientes</option>
          <option value="precioAsc">Orden: Precio ↑</option>
          <option value="precioDesc">Orden: Precio ↓</option>
          <option value="cantidad">Orden: Cantidad</option>
        </select>
      </section>

      {/* LOADING / EMPTY */}
      {loading && (
        <div className="skeleton-grid">
          {Array.from({ length: 8 }).map((_,i)=> <div className="skeleton-card" key={i} />)}
        </div>
      )}
      {!loading && view.length === 0 && (
        <div className="empty fancy">
          <div className="empty-icon">💊</div>
          <h3>Sin resultados</h3>
          <p className="muted">Prueba cambiar los filtros o agrega un nuevo medicamento.</p>
          <NavLink to="/medicamentos/agregar" className="btn teal">Agregar medicamento</NavLink>
        </div>
      )}

      {/* GRID */}
      <div className="inv-grid">
        {view.map((m) => (
          <article className="card glass" key={m.id}>
            <div className="card-media">
              <img src={foto(m.fotoUrl)} alt={m.nombre} />
              <span className={`badge ${m.activo ? "ok" : "off"}`}>{m.activo ? "Activo" : "Inactivo"}</span>
              <span className="price">{money(m.precio)}</span>
            </div>

            <div className="card-body">
              <h3 className="title">{m.nombre}</h3>
              <div className="meta">
                <span className="pill">{m.tipo || "—"}</span>
                <span className="pill">Cant: {m.cantidad}</span>
                <span className="muted small">{new Date(m.fechaCreacion).toLocaleDateString()}</span>
              </div>

              {(m.descripcion || m.beneficios || m.instrucciones || m.advertencias) && (
                <details className="more">
                  <summary>Detalles</summary>
                  {m.descripcion && <p><strong>Descripción:</strong> {m.descripcion}</p>}
                  {m.beneficios && <p><strong>Beneficios:</strong> {m.beneficios}</p>}
                  {m.instrucciones && <p><strong>Instrucciones:</strong> {m.instrucciones}</p>}
                  {m.advertencias && <p><strong>Advertencias:</strong> {m.advertencias}</p>}
                </details>
              )}
            </div>

            <div className="card-actions">
              <button className="btn" onClick={() => openEdit(m)}>Editar</button>
              <button className="btn danger" onClick={() => openDelete(m)}>Eliminar</button>
              <button className="btn ghost" onClick={() => toggleActivo(m)}>
                {m.activo ? "Desactivar" : "Activar"}
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* MODAL EDITAR */}
      {editOpen && current && (
        <div className="modal">
          <div className="modal-card">
            <div className="modal-head">
              <h3>Editar medicamento</h3>
              <button className="icon" onClick={closeEdit}>✕</button>
            </div>

            <form className="form-grid" onSubmit={saveEdit}>
              <div className="form-row">
                <label>Nombre</label>
                <input
                  value={current.nombre}
                  onChange={(e) => setCurrent({ ...current, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="form-row-3">
                <div>
                  <label>Cantidad</label>
                  <input
                    type="number" min="0"
                    value={current.cantidad}
                    onChange={(e) => setCurrent({ ...current, cantidad: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label>Tipo</label>
                  <input
                    value={current.tipo || ""}
                    onChange={(e) => setCurrent({ ...current, tipo: e.target.value })}
                  />
                </div>
                <div>
                  <label>Precio</label>
                  <input
                    type="number" step="0.01" min="0"
                    value={current.precio}
                    onChange={(e) => setCurrent({ ...current, precio: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <label>Descripción</label>
                <textarea
                  rows={2}
                  value={current.descripcion}
                  onChange={(e) => setCurrent({ ...current, descripcion: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div>
                  <label>Beneficios</label>
                  <textarea
                    rows={3}
                    value={current.beneficios}
                    onChange={(e) => setCurrent({ ...current, beneficios: e.target.value })}
                  />
                </div>
                <div>
                  <label>Instrucciones</label>
                  <textarea
                    rows={3}
                    value={current.instrucciones}
                    onChange={(e) => setCurrent({ ...current, instrucciones: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <label>Advertencias</label>
                <textarea
                  rows={2}
                  value={current.advertencias}
                  onChange={(e) => setCurrent({ ...current, advertencias: e.target.value })}
                />
              </div>

              <div className="form-row">
                <label>Foto URL</label>
                <input
                  type="url"
                  value={current.fotoUrl || ""}
                  onChange={(e) => setCurrent({ ...current, fotoUrl: e.target.value })}
                  placeholder="https://dominio/imagen.jpg"
                />
                <div className="preview">
                  <img
                    src={current.fotoUrl?.trim() ? current.fotoUrl.trim() : "https://via.placeholder.com/120x90?text=Preview"}
                    onError={() => setImgOk(false)}
                    onLoad={() => setImgOk(true)}
                    alt="Preview"
                  />
                  <span className="muted">{imgOk ? "Vista previa OK" : "URL inválida o no accesible"}</span>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn ghost" onClick={closeEdit}>Cancelar</button>
                <button type="submit" className="btn teal">Guardar cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {delOpen && current && (
        <div className="modal">
          <div className="modal-card small">
            <div className="modal-head">
              <h3>Eliminar medicamento</h3>
              <button className="icon" onClick={closeDelete}>✕</button>
            </div>
            <p className="muted">
              ¿Seguro que deseas eliminar <strong>{current.nombre}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="modal-actions">
              <button className="btn ghost" onClick={closeDelete}>Cancelar</button>
              <button className="btn danger" onClick={confirmDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
