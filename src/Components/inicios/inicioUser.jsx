import React from "react";
import "./inicio.css";

const InicioUser = () => {
  return (
    <main className="inicio-hero">
      <section className="inicio-texto">
        <h1 className="inicio-title">Bienvenido Usuario</h1>
        <p className="inicio-lead">
          Consulta <strong>productos</strong>, revisa <strong>disponibilidad</strong> y
          realiza <strong>pedidos</strong> de forma sencilla y rápida dentro del sistema.
        </p>
      </section>

      <aside className="inicio-card">
        <img
          src="https://images.unsplash.com/photo-1588625142909-1ff3d9b30bfa?q=80&w=1600&auto=format&fit=crop"
          alt="Productos de farmacia"
        />
      </aside>
    </main>
  );
};

export default InicioUser;
