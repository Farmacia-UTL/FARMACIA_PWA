import React from "react";
import "./inicio.css";
import { NavLink, useNavigate } from "react-router-dom";

const InicioAdmin = () => {
  const navigate = useNavigate();

  const nombreAdmin =
    localStorage.getItem("nombreUsuario") ||
    localStorage.getItem("userName") ||
    localStorage.getItem("userEmail") ||
    "Administrador";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    localStorage.removeItem("nombreUsuario");
    navigate("/login");
  };

  return (
    <>
      {/* ======================= TOPBAR ADMIN ======================= */}
      <header className="admin-menu">
        {/* LADO IZQUIERDO: LOGO + TEXTO */}
        <div className="admin-left">
          <div className="admin-logo">
            <span className="logo-badge">⚕</span>
            <div className="logo-text">
              <span className="logo-title">Farmacia · Admin</span>
              <span className="logo-subtitle">
                Panel de control y gestión
              </span>
            </div>
          </div>
        </div>

        {/* MENÚ CENTRAL */}
        <nav className="admin-nav">
          <NavLink
            to="/inicioAdmin"
            className={({ isActive }) =>
              "admin-link" + (isActive ? " active" : "")
            }
          >
            Inicio
          </NavLink>

          {/* Dropdown Medicamentos */}
          <div className="admin-dropdown">
            <span className="admin-link">Medicamentos ▾</span>
            <div className="admin-dropdown-content">
              {/* COINCIDE CON: /medicamentos/agregar */}
              <NavLink to="/medicamentos/agregar" className="admin-sublink">
                Agregar medicamento
              </NavLink>
              {/* COINCIDE CON: /medicamentos/inventario */}
              <NavLink
                to="/medicamentos/inventario"
                className="admin-sublink"
              >
                Inventario
              </NavLink>
            </div>
          </div>

          {/* Dropdown Proveedores */}
          <div className="admin-dropdown">
            <span className="admin-link">Proveedores ▾</span>
            <div className="admin-dropdown-content">
              {/* /proveedores/crear */}
              <NavLink to="/proveedores/crear" className="admin-sublink">
                Registrar proveedor
              </NavLink>
              {/* /proveedores */}
              <NavLink to="/proveedores" className="admin-sublink">
                Lista de proveedores
              </NavLink>
              {/* /proveedores/pedidos */}
              <NavLink to="/proveedores/pedidos" className="admin-sublink">
                Pedir a proveedor
              </NavLink>
            </div>
          </div>

          {/* Dropdown Pedidos */}
          <div className="admin-dropdown">
            <span className="admin-link">Pedidos ▾</span>
            <div className="admin-dropdown-content">
              {/* /pedidos */}
              <NavLink to="/pedidos" className="admin-sublink">
                Pedidos de usuarios
              </NavLink>
              {/* /dashboard */}
              <NavLink to="/dashboard" className="admin-sublink">
                Dashboard / Reportes
              </NavLink>
            </div>
          </div>

          {/* Citas → /citas */}
          <NavLink
            to="/citas"
            className={({ isActive }) =>
              "admin-link" + (isActive ? " active" : "")
            }
          >
            Citas
          </NavLink>

          {/* Si aún no tienes ruta de usuarios, puedes dejar este fuera
          <NavLink
            to="/usuarios-admin"
            className={({ isActive }) =>
              "admin-link" + (isActive ? " active" : "")
            }
          >
            Usuarios
          </NavLink>
          */}
        </nav>

        {/* LADO DERECHO: INFO + LOGOUT */}
        <div className="admin-right">
          <span className="admin-tag">Rol: Admin · {nombreAdmin}</span>
          <button
            type="button"
            className="btn-ghost logout-btn"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* ======================= HERO ======================= */}
      <section className="inicio-hero modern">
        {/* Texto principal */}
        <div className="inicio-texto">
          <h1 className="inicio-title">Panel de administración</h1>
          <p className="inicio-lead">
            Desde aquí puedes gestionar medicamentos, proveedores, pedidos y
            citas de la farmacia. Usa los módulos de abajo para ir directo a cada
            sección.
          </p>

          <div className="module-actions">
            <button
              type="button"
              className="chip"
              onClick={() =>
                document
                  .getElementById("admin-modules")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Ver módulos principales
            </button>
            <button
              type="button"
              className="chip"
              onClick={() => navigate("/dashboard")}
            >
              Ir al Dashboard
            </button>
          </div>
        </div>

        {/* Imagen / tarjeta derecha */}
        <div className="inicio-card pretty">
          <img
            src="https://images.pexels.com/photos/6129044/pexels-photo-6129044.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Farmacia Panel Admin"
          />
        </div>
      </section>

      {/* ======================= MÓDULOS ======================= */}
      <section className="modules" id="admin-modules">
        {/* Módulo Medicamentos */}
        <article className="module-card module-medicamentos">
          <div className="module-header">
            <div className="module-icon" />
            <div>
              <h2 className="module-title">Medicamentos</h2>
              <p className="module-subtitle">
                Altas, bajas, ediciones y control de inventario.
              </p>
            </div>
          </div>
          <div className="module-body">
            <p>
              Administra el catálogo de medicamentos, precios, stock,
              descripciones y tipo de medicamento.
            </p>
            <div className="module-actions">
              <button
                type="button"
                className="chip"
                onClick={() => navigate("/medicamentos/agregar")}
              >
                Agregar medicamento
              </button>
              <button
                type="button"
                className="chip"
                onClick={() => navigate("/medicamentos/inventario")}
              >
                Ver inventario
              </button>
            </div>
          </div>
        </article>

        {/* Módulo Proveedores */}
        <article className="module-card module-proveedores">
          <div className="module-header">
            <div className="module-icon" />
            <div>
              <h2 className="module-title">Proveedores</h2>
              <p className="module-subtitle">
                Registra y gestiona a quienes surten la farmacia.
              </p>
            </div>
          </div>
          <div className="module-body">
            <p>
              Mantén control de contactos, teléfonos, correos y direcciones de
              tus proveedores, además de los pedidos asociados.
            </p>
            <div className="module-actions">
              <button
                type="button"
                className="chip"
                onClick={() => navigate("/proveedores/crear")}
              >
                Registrar proveedor
              </button>
              <button
                type="button"
                className="chip"
                onClick={() => navigate("/proveedores")}
              >
                Lista de proveedores
              </button>
              <button
                type="button"
                className="chip"
                onClick={() => navigate("/proveedores/pedidos")}
              >
                Pedir medicamentos
              </button>
            </div>
          </div>
        </article>

        {/* Módulo Pedidos */}
        <article className="module-card module-pedidos">
          <div className="module-header">
            <div className="module-icon" />
            <div>
              <h2 className="module-title">Pedidos de usuarios</h2>
              <p className="module-subtitle">
                Revisa y actualiza el estado de los pedidos online.
              </p>
            </div>
          </div>
          <div className="module-body">
            <p>
              Confirma, rechaza o marca como entregados los pedidos realizados
              desde el panel de usuario. Da seguimiento rápido a lo más reciente.
            </p>
            <div className="module-actions">
              <button
                type="button"
                className="chip"
                onClick={() => navigate("/pedidos")}
              >
                Ver pedidos
              </button>
            </div>
          </div>
        </article>

        {/* Módulo Citas */}
        <article className="module-card module-citas">
          <div className="module-header">
            <div className="module-icon" />
            <div>
              <h2 className="module-title">Citas</h2>
              <p className="module-subtitle">
                Control de las citas agendadas por los usuarios.
              </p>
            </div>
          </div>
          <div className="module-body">
            <p>
              Visualiza las citas por día, médico, horario y estado. Administra
              confirmaciones y cancelaciones.
            </p>
            <div className="module-actions">
              <button
                type="button"
                className="chip"
                onClick={() => navigate("/citas")}
              >
                Ver citas
              </button>
              <button
                type="button"
                className="chip"
                onClick={() => navigate("/citas/agendar")}
              >
                Agendar cita manual
              </button>
            </div>
          </div>
        </article>

        {/* Módulo Reportes / Dashboard */}
        <article className="module-card module-reportes">
          <div className="module-header">
            <div className="module-icon" />
            <div>
              <h2 className="module-title">Reportes y Dashboard</h2>
              <p className="module-subtitle">
                Medicamento más vendido, días con más ventas y más.
              </p>
            </div>
          </div>
          <div className="module-body">
            <p>
              Visualiza gráficos de ventas, medicamentos más solicitados, horas
              pico y comportamiento general de la farmacia.
            </p>
            <div className="module-actions">
              <button
                type="button"
                className="chip"
                onClick={() => navigate("/dashboard")}
              >
                Abrir Dashboard
              </button>
            </div>
          </div>
        </article>

        {/* Módulo Resumen rápido */}
        <article className="module-card module-ultimo">
          <div className="module-header">
            <div className="module-icon" />
            <div>
              <h2 className="module-title">Resumen rápido</h2>
              <p className="module-subtitle">
                Atajos a lo que más usas en el día a día.
              </p>
            </div>
          </div>
          <div className="module-body">
            <p>
              Accede rápidamente al inventario, pedidos recientes y reportes sin
              perder tiempo navegando por todo el sistema.
            </p>
            <div className="module-actions">
              <button
                type="button"
                className="chip"
                onClick={() => navigate("/medicamentos/inventario")}
              >
                Inventario
              </button>
              <button
                type="button"
                className="chip"
                onClick={() => navigate("/pedidos")}
              >
                Últimos pedidos
              </button>
              <button
                type="button"
                className="chip"
                onClick={() => navigate("/dashboard")}
              >
                Ver métricas
              </button>
            </div>
          </div>
        </article>
      </section>
    </>
  );
};

export default InicioAdmin;
  