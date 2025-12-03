import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "https://api-farmacia.ngrok.app";

const InicioUser = () => {
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [carrito, setCarrito] = useState([]);
  const [nombreCliente, setNombreCliente] = useState("");
  const [msg, setMsg] = useState("");
  const [comprando, setComprando] = useState(false);

  const nombreUsuario =
    localStorage.getItem("nombreUsuario") ||
    localStorage.getItem("userName") ||
    localStorage.getItem("userEmail") ||
    "Usuario";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    localStorage.removeItem("nombreUsuario");
    navigate("/login");
  };

  const goToMisCitas = () => navigate("/mis-citas");

  /* ============================ LOAD PRODUCTOS =========================== */
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setLoading(true);
        setError("");
        const resp = await fetch(`${API_URL}/api/Medicamentos`);
        const data = await resp.json().catch(() => []);

        if (!resp.ok) throw new Error(data?.message || "No se pudieron obtener productos.");

        const activos = data.filter(
          (m) => (m.activo ?? m.Activo ?? true) && (m.cantidad ?? m.Cantidad ?? 0) > 0
        );

        const normalizados = activos.map((m) => ({
          id: m.id ?? m.Id,
          nombre: m.nombre ?? m.Nombre,
          tipo: m.tipo ?? m.Tipo,
          precio: m.precio ?? m.Precio,
          stock: m.cantidad ?? m.Cantidad,
          descripcion: m.descripcion ?? m.Descripcion,
          fotoUrl:
            m.fotoUrl ??
            m.FotoUrl ??
            "https://via.placeholder.com/320x200?text=Medicamento",
        }));

        setProductos(normalizados);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, []);

  /* ============================ CARRITO =========================== */
  const addToCart = (prod) => {
    setMsg("");
    setCarrito((items) => {
      const existe = items.find((i) => i.id === prod.id);
      if (existe) {
        if (existe.cantidad + 1 > prod.stock) {
          setMsg("No hay más stock disponible");
          return items;
        }
        return items.map((i) =>
          i.id === prod.id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...items, { ...prod, cantidad: 1 }];
    });
  };

  const actualizarCantidad = (id, delta) => {
    setCarrito((items) =>
      items
        .map((i) => {
          if (i.id !== id) return i;
          const newQty = i.cantidad + delta;
          if (newQty <= 0) return null;
          if (newQty > i.stock) {
            setMsg("No hay mas stock disponible");
            return i;
          }
          return { ...i, cantidad: newQty };
        })
        .filter(Boolean)
    );
  };

  const quitarDelCarrito = (id) => {
    setCarrito((items) => items.filter((i) => i.id !== id));
  };

  const totalCarrito = carrito.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  /* ============================ ENVIAR PEDIDO =========================== */
  const confirmarCompra = async () => {
    if (carrito.length === 0) return setMsg("Tu carrito está vacío");

    const payload = {
      clienteNombre: nombreCliente || nombreUsuario,
      items: carrito.map((i) => ({
        medicamentoId: i.id,
        cantidad: i.cantidad,
      })),
    };

    try {
      setComprando(true);
      const resp = await fetch(`${API_URL}/api/Pedidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await resp.json().catch(() => null);

      if (!resp.ok) throw new Error(data?.message || "Error al registrar el pedido");

      setMsg("Pedido enviado. En espera de confirmación.");
      setCarrito([]);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setComprando(false);
    }
  };

  return (
    <>
      {/* ====================== TOPBAR PREMIUM AZUL ====================== */}
      <header className="admin-menu">
        <div className="admin-left">
          <div className="admin-logo">
            <span className="logo-badge">⚕</span>
            <div className="logo-text">
              <span className="logo-title">Farmacia · Usuario</span>
              <span className="logo-subtitle">Compras y citas</span>
            </div>
          </div>
        </div>

        <nav className="admin-nav">
          <button className="admin-link" onClick={() => navigate("/inicioUser")}>
            Inicio
          </button>
          <button className="admin-link" onClick={goToMisCitas}>
            Mis Citas
          </button>
        </nav>

        <div className="admin-right">
          <button className="btn-ghost logout-btn" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* ====================== HERO ====================== */}
      <section className="inicio-hero modern">
        <div className="inicio-texto">
          <h1 className="inicio-title">Bienvenido {nombreUsuario}</h1>
          <p className="inicio-lead">
            Aquí puedes ver los medicamentos disponibles, agregar al carrito y hacer tu pedido.
          </p>

          <div className="module-actions">
            <a
              className="chip"
              onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}
            >
              Ver catálogo
            </a>

            <a className="chip" onClick={goToMisCitas}>
              Revisar mis citas
            </a>
          </div>
        </div>

        <div className="inicio-card pretty">
          <img src="https://images.pexels.com/photos/208512/pexels-photo-208512.jpeg" />
        </div>
      </section>

      {/* ====================== CATÁLOGO + CARRITO ====================== */}
      <section className="modules modules-wide">
        <article className="module-card">
          <div className="module-header">
            <div className="module-icon">💊</div>
            <div>
              <span className="module-title">Catálogo de Medicamentos</span>
              <p className="module-description">
                Agrega medicamentos a tu carrito y confirma tu pedido.
              </p>
            </div>
          </div>

          <div className="user-grid">
            {/* ==================== LISTA DE PRODUCTOS ==================== */}
            <div>
              <h3 style={{ marginTop: 0 }}>Productos disponibles</h3>

              {loading && <p className="pill pill-soft">Cargando…</p>}
              {error && <p className="user-error">{error}</p>}

              <div className="shop-grid">
                {productos.map((p) => (
                  <article key={p.id} className="shop-item">
                    <img src={p.fotoUrl} alt={p.nombre} />

                    <div className="shop-body">
                      <div className="shop-header-row">
                        <h3>{p.nombre}</h3>
                        {p.tipo && <span className="shop-pill">{p.tipo}</span>}
                      </div>

                      <p className="shop-desc">
                        {p.descripcion?.substring(0, 100) || "Sin descripción"}…
                      </p>

                      <div className="shop-meta">
                        <span className="shop-price">${p.precio.toFixed(2)}</span>
                        <span className="shop-stock">Stock: {p.stock}</span>
                      </div>

                      <button
                        className="chip shop-btn"
                        onClick={() => addToCart(p)}
                        disabled={p.stock <= 0}
                      >
                        {p.stock <= 0 ? "Sin stock" : "Agregar al carrito"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* ==================== CARRITO ==================== */}
            <aside className="user-cart-column">
              <h3>Tu carrito</h3>

              <div className="user-input-group">
                <label>Nombre (opcional):</label>
                <input
                  className="user-input"
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                  placeholder="Tu nombre"
                />
              </div>

              {carrito.length === 0 && (
                <p className="user-muted">Aún no agregas productos.</p>
              )}

              {carrito.length > 0 && (
                <ul className="user-cart-list">
                  {carrito.map((item) => (
                    <li key={item.id} className="user-cart-item">
                      <div className="user-cart-row">
                        <span className="user-cart-name">{item.nombre}</span>
                        <button
                          className="cart-remove-btn"
                          onClick={() => quitarDelCarrito(item.id)}
                        >
                          ✕
                        </button>
                      </div>

                      <div className="user-cart-row user-cart-row-bottom">
                        <span>${item.precio.toFixed(2)} c/u</span>

                        <div className="user-cart-qty">
                          <button
                            className="cart-qty-btn"
                            onClick={() => actualizarCantidad(item.id, -1)}
                          >
                            -
                          </button>
                          <span>{item.cantidad}</span>
                          <button
                            className="cart-qty-btn"
                            onClick={() => actualizarCantidad(item.id, 1)}
                          >
                            +
                          </button>
                        </div>

                        <span className="user-cart-total">
                          ${(item.precio * item.cantidad).toFixed(2)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <hr className="user-divider" />

              <div className="user-cart-resumen">
                <span>Total:</span>
                <span>${totalCarrito.toFixed(2)}</span>
              </div>

              <button
                className="chip shop-confirm"
                onClick={confirmarCompra}
                disabled={carrito.length === 0 || comprando}
              >
                {comprando ? "Enviando..." : "Confirmar pedido"}
              </button>

              {msg && <p className="user-msg">{msg}</p>}
            </aside>
          </div>
        </article>
      </section>

      {/* ====================== CSS COMPLETO ====================== */}
      <style>{`
/* ====================== VARIABLES ======================= */
:root {
  --bg: #020617;
  --bg-soft: #0b1220;
  --card-bg: rgba(15, 23, 42, 0.85);
  --card-border: rgba(148, 163, 184, 0.35);
  --accent: #38bdf8;
  --accent-2: #4f46e5;
  --accent-3: #22c55e;
  --text: #e5e7eb;
  --muted: #94a3b8;
  --shadow-card: 0 18px 40px rgba(15, 23, 42, 0.75);
}

/* ====================== TOPBAR ======================= */
.admin-menu {
  max-width: 1180px;
  margin: 25px auto;
  padding: 14px 26px;
  border-radius: 999px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  background: linear-gradient(120deg, #0b3b8f, #1d4ed8, #38bdf8);
  box-shadow: 0 20px 55px rgba(0,0,0,0.7);
  border: 1px solid rgba(191,219,254,0.6);
  backdrop-filter: blur(18px);
}

.admin-left,
.admin-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-nav {
  display: flex;
  justify-content: center;
  gap: 18px;
}

.admin-link {
  padding: 8px 16px;
  border-radius: 999px;
  background: transparent;
  border: none;
  color: #e0f2fe;
  font-size: 13px;
  cursor: pointer;
  transition: .2s;
}

.admin-link:hover {
  background: rgba(255,255,255,0.1);
  transform: translateY(-2px);
}

.logo-badge {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: conic-gradient(from 220deg, #38bdf8, #4f46e5, #22c55e);
  color: white;
  font-size: 17px;
  box-shadow: 0 0 0 4px rgba(255,255,255,0.25);
}

.logo-title {
  color: white;
  font-weight: 600;
  font-size: 15px;
}

.logo-subtitle {
  color: #e0e7ff;
  font-size: 11px;
}

.admin-tag {
  padding: 4px 10px;
  background: rgba(255,255,255,0.15);
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid rgba(255,255,255,0.3);
}

.btn-ghost {
  padding: 6px 12px;
  background: transparent;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.5);
  color: white;
  cursor: pointer;
  transition: .2s;
}

.btn-ghost:hover {
  background: rgba(255,255,255,0.1);
  transform: translateY(-2px);
}

.logout-btn {
  border-color: rgba(255,120,120,0.7);
  color: #fee2e2;
}

/* ====================== HERO ======================= */
.inicio-hero.modern {
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.6fr 1.2fr;
  gap: 22px;
  padding: 10px 20px;
}

.inicio-texto {
  padding: 22px;
  background: rgba(15,23,42,0.92);
  border-radius: 22px;
  border: 1px solid rgba(148,163,184,0.55);
  box-shadow: var(--shadow-card);
}

.inicio-title {
  font-size: 32px;
  color: #eaf2ff;
}

.inicio-lead {
  font-size: 14px;
  color: var(--muted);
}

.inicio-card.pretty {
  overflow: hidden;
  border-radius: 22px;
  border: 1px solid rgba(148,163,184,0.35);
  box-shadow: var(--shadow-card);
}

.inicio-card.pretty img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ================= SHOP ================= */
.user-grid {
  margin-top: 22px;
  display: grid;
  grid-template-columns: 2fr 1.1fr;
  gap: 18px;
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px,1fr));
  gap: 14px;
}

.shop-item {
  background: rgba(15,23,42,0.95);
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(148,163,184,0.45);
  box-shadow: var(--shadow-card);
}

.shop-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.shop-body {
  padding: 10px 12px;
}

.shop-body h3 {
  margin: 0;
  color: #e0eaff;
  font-size: 15px;
}

.shop-desc {
  color: #9ca3af;
  font-size: 12px;
  min-height: 34px;
}

.shop-pill {
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(56,189,248,0.25);
  font-size: 11px;
  color: #cffafe;
}

.shop-meta {
  font-size: 13px;
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
}

.shop-price { color: #a5f3fc; font-weight: 600; }
.shop-stock { color: #94a3b8; }

.chip {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 8px 14px;
  border-radius: 999px;
  background: linear-gradient(135deg,#06b6d4,#0ea5e9,#3b82f6);
  color: white;
  border: none;
  cursor: pointer;
  margin-top: 8px;
  transition: .2s;
}

.chip:hover {
  transform: translateY(-2px);
  filter: brightness(1.05);
}

/* ================= CART ================= */
.user-cart-column {
  background: rgba(15,23,42,0.95);
  border-radius: 18px;
  padding: 16px;
  border: 1px solid rgba(148,163,184,0.4);
  box-shadow: var(--shadow-card);
}

.user-input {
  width: 100%;
  padding: 8px;
  border-radius: 12px;
  border: 1px solid rgba(148,163,184,0.7);
  background: rgba(15,23,42,0.8);
  color: #e5e7eb;
}

.user-cart-list {
  max-height: 250px;
  overflow-y: auto;
  list-style: none;
  padding: 0;
}

.user-cart-item {
  border-bottom: 1px solid rgba(31,41,55,0.6);
  padding: 8px 0;
}

.cart-qty-btn,
.cart-remove-btn {
  min-width: 28px;
  height: 26px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
}

.cart-remove-btn {
  background: radial-gradient(circle,#fecaca,#b91c1c);
  color: white;
}

.cart-qty-btn {
  background: rgba(56,189,248,0.25);
  color: white;
}

.user-cart-resumen {
  display: flex;
  justify-content: space-between;
  color: #e0eaff;
  font-weight: bold;
  margin: 10px 0;
}

.user-msg {
  color: #e5e7eb;
  margin-top: 8px;
  text-align: center;
}
      `}</style>
    </>
  );
};

export default InicioUser;
