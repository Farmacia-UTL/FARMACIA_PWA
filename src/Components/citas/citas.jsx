import React, { useEffect, useState } from "react";
import { cancelarCita, getMisCitas, actualizarCita } from "./services/citasApi";
import { useNavigate } from "react-router-dom";

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
  useEffect(()=>{ cargar(); }, []);

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
      await actualizarCita(id, { tipoConsulta: "General", notas: "", estatus: "A" });
      setMsg("Cita marcada como activa.");
      cargar();
    } catch (e) {
      setMsg(e.message || "No se pudo actualizar.");
    }
  };

  return (
    <div className="modules" style={{ paddingTop:24 }}>
      <article className="module-card" style={{ gridColumn:"1 / -1" }}>
        <div className="module-icon">📒</div>
        <h3>Mis citas</h3>

        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          <button className="chip" onClick={()=>nav("/citas/agendar")}>🗓️ Agendar</button>
          <button className="chip" onClick={cargar} disabled={loading}>{loading ? "Cargando..." : "Actualizar"}</button>
        </div>

        {msg && <p style={{ background:"#f7fffe", border:"1px solid #d6e7e6", padding:10, borderRadius:12 }}>{msg}</p>}

        <div style={{ display:"grid", gap:8 }}>
          {!loading && citas.length === 0 && <p style={{ color:"var(--muted)" }}>No tienes citas.</p>}
          {citas.map(c => {
            const f = new Date(c.fechaHora);
            const dia = f.toLocaleDateString();
            const hora = f.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
            return (
              <div key={c.idCita} className="module-card" style={{ margin:0 }}>
                <div className="module-icon">🗓️</div>
                <strong>{dia} · {hora}</strong>
                <div style={{ color:"var(--muted)" }}>
                  {c.tipoConsulta} · Estatus: <b>{c.estatus === "C" ? "Cancelada" : "Activa"}</b>
                </div>
                <div style={{ display:"flex", gap:8, marginTop:8 }}>
                  <button className="chip" onClick={()=>handleCancelar(c.idCita)} disabled={c.estatus==="C"}>❌ Cancelar</button>
                  <button className="chip" onClick={()=>handleActivar(c.idCita)} disabled={c.estatus==="A"}>✅ Activar</button>
                </div>
              </div>
            );
          })}
        </div>
      </article>
    </div>
  );
}
