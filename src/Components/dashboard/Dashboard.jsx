import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";
import "../inicios/inicio.css";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "https://api-farmacia.ngrok.app";

export default function Dashboard() {
  const navigate = useNavigate();

  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarEstadisticas = async () => {
    try {
      const resp = await fetch(`${API_URL}/api/Pedidos/dashboard`);
      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data?.message || "No se pudieron obtener las estadísticas.");
      }

      setEstadisticas(data);
    } catch (e) {
      console.error("Error al cargar estadísticas:", e);
      setError(e.message || "Hubo un error al cargar las estadísticas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const money = (n) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(n ?? 0);
  };

  const chartData = {
    labels: [estadisticas?.medicamentoMasVendido?.nombre, estadisticas?.medicamentoMenosVendido?.nombre],
    datasets: [
      {
        label: "Cantidad Vendida",
        data: [
          estadisticas?.medicamentoMasVendido?.cantidad,
          estadisticas?.medicamentoMenosVendido?.cantidad
        ],
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      }
    ]
  };

  return (
    <div style={{ maxWidth: 1150, margin: "24px auto", padding: "0 16px" }}>
      <header style={{ marginBottom: 14 }}>
        <h2 style={{ margin: 0 }}>Dashboard - Estadísticas</h2>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="chip"
          style={{
            background: "linear-gradient(90deg, var(--primary), var(--primary-soft))",
            border: "none",
            color: "#fff",
            fontWeight: 700,
            padding: "7px 16px",
            borderRadius: 999,
            marginTop: 8,
            marginBottom: 10,
          }}
        >
          ← Regresar
        </button>
      </header>

      {loading && <p>Cargando estadísticas…</p>}

      {error && (
        <div
          style={{
            background: "#fff3f3",
            borderRadius: 12,
            border: "1px solid #fecaca",
            padding: "8px 10px",
            marginBottom: 10,
            color: "#b91c1c",
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      {!loading && estadisticas && (
        <section className="modules">
          <article className="module-card">
            <div className="module-icon">💊</div>
            <h3>Medicamento más vendido</h3>
            <p>{estadisticas.medicamentoMasVendido.nombre}</p>
            <p>{`Cantidad Vendida: ${estadisticas.medicamentoMasVendido.cantidad}`}</p>
          </article>

          <article className="module-card">
            <div className="module-icon">📉</div>
            <h3>Medicamento menos vendido</h3>
            <p>{estadisticas.medicamentoMenosVendido.nombre}</p>
            <p>{`Cantidad Vendida: ${estadisticas.medicamentoMenosVendido.cantidad}`}</p>
          </article>

          <article className="module-card">
            <div className="module-icon">🕒</div>
            <h3>Hora más vendida</h3>
            <p>{`Hora: ${estadisticas.horaMasVendida}:00`}</p>
          </article>

          <article className="module-card">
            <div className="module-icon">📊</div>
            <h3>Gráfica de Ventas</h3>
            <Bar data={chartData} options={{ responsive: true }} />
          </article>
        </section>
      )}
    </div>
  );
}
