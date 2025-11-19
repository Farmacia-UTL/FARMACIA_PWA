// src/Components/inicios/inicioUser.jsx
import React, { useEffect, useState } from "react";
import "./inicio.css";
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

  // 👉 nombre mostrado en la barra (ajusta a lo que guardes en localStorage)
  const nombreUsuario =
    localStorage.getItem("nombreUsuario") ||
    localStorage.getItem("userName") ||
    localStorage.getItem("userEmail") ||
    "Usuario";

  const handleLogout = () => {
    // limpia lo que uses para auth
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    localStorage.removeItem("nombreUsuario");
    navigate("/login");
  };

  // === Cargar medicamentos activos ===
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setLoading(true);
        setError("");
        const resp = await fetch(`${API_URL}/api/Medicamentos`);
        const data = await resp.json().catch(() => []);

        if (!resp.ok) {
          throw new Error(data?.message || "No se pudieron obtener los productos.");
        }

        const activos = (data || []).filter(
          (m) => (m.activo ?? m.Activo ?? true) && (m.cantidad ?? m.Cantidad ?? 0) > 0
        );

        const normalizados = activos.map((m) => ({
          id: m.id ?? m.Id,
          nombre: m.nombre ?? m.Nombre ?? "",
          tipo: m.tipo ?? m.Tipo ?? "",
          precio: m.precio ?? m.Precio ?? 0,
          stock: m.cantidad ?? m.Cantidad ?? 0,
          descripcion: m.descripcion ?? m.Descripcion ?? "",
          fotoUrl:
            m.fotoUrl ??
            m.FotoUrl ??
            "https://via.placeholder.com/320x200?text=Medicamento",
        }));

        setProductos(normalizados);
      } catch (e) {
        console.error(e);
        setError(e.message || "Error al cargar productos.");
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, []);

  // === Carrito ===
  const addToCart = (prod) => {
    setMsg("");
    setCarrito((items) => {
      const existe = items.find((i) => i.id === prod.id);
      const stock = prod.stock;

      if (existe) {
        if (existe.cantidad + 1 > stock) {
          setMsg("⚠️ No hay más stock disponible de este producto.");
          return items;
        }
        return items.map((i) =>
          i.id === prod.id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      } else {
        if (stock <= 0) {
          setMsg("⚠️ Producto sin stock.");
          return items;
        }
        return [...items, { ...prod, cantidad: 1 }];
      }
    });
  };

  const actualizarCantidad = (id, delta) => {
    setCarrito((items) =>
      items
        .map((i) => {
          if (i.id !== id) return i;
          const nueva = i.cantidad + delta;
          if (nueva <= 0) return null;
          if (nueva > i.stock) {
            setMsg("⚠️ No hay más stock disponible.");
            return i;
          }
          return { ...i, cantidad: nueva };
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

  // === Confirmar pedido → POST /api/Pedidos ===
  const confirmarCompra = async () => {
    setMsg("");

    if (carrito.length === 0) {
      setMsg("⚠️ Tu carrito está vacío.");
      return;
    }

    const payload = {
      clienteNombre: nombreCliente || nombreUsuario || null,
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

      if (!resp.ok) {
        throw new Error(
          data?.message || data?.title || "No se pudo registrar el pedido."
        );
      }

      setMsg("✅ Pedido enviado. En espera de confirmación del administrador.");
      setCarrito([]);
    } catch (e) {
      console.error(e);
      setMsg(e.message || "❌ Error al enviar el pedido.");
    } finally {
      setComprando(false);
    }
  };

  return (
    <>
      {/* 🔹 Barra superior de usuario */}
      <header className="user-topbar">
        <div className="user-topbar-left">
          <span className="user-logo-pill">⚕</span>
          <span className="user-topbar-title">Farmacia · Usuario</span>
        </div>
        <div className="user-topbar-right">
          <span className="user-welcome">
            Bienvenido, <strong>{nombreUsuario}</strong>
          </span>
          <button className="user-logout-btn" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="inicio-hero user-layout">
        {/* Texto */}
        <section className="inicio-texto">
          <h1 className="inicio-title">Bienvenido Usuario</h1>
        </section>

        {/* Catálogo + Carrito */}
        <section className="inicio-card user-shop">
          {/* Catálogo */}
          <div className="shop-list">
            <h2 style={{ marginTop: 0 }}>Productos disponibles</h2>
            {loading && <p>Cargando productos…</p>}
            {error && (
              <p style={{ color: "#b01515", fontWeight: 600 }}>{error}</p>
            )}
            {!loading && !error && productos.length === 0 && (
              <p style={{ color: "#64748b" }}>
                No hay productos disponibles en este momento.
              </p>
            )}

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
                      {p.descripcion
                        ? p.descripcion.substring(0, 90) + "…"
                        : "Sin descripción"}
                    </p>
                    <div className="shop-meta">
                      <span className="shop-price">
                        ${p.precio.toFixed(2)}
                      </span>
                      <span className="shop-stock">Stock: {p.stock}</span>
                    </div>
                    <button
                      className="btn-login shop-btn"
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

          {/* Carrito */}
          <aside className="shop-cart">
            <h2 style={{ marginTop: 0 }}>Tu carrito</h2>

            <div style={{ marginBottom: 10 }}>
              <label style={{ fontWeight: 600 }}>Nombre (opcional):</label>
              <input
                value={nombreCliente}
                onChange={(e) => setNombreCliente(e.target.value)}
                placeholder="Tu nombre"
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  marginTop: 4,
                }}
              />
            </div>

            {carrito.length === 0 && (
              <p style={{ color: "#64748b" }}>
                Aún no has agregado productos.
              </p>
            )}

            {carrito.length > 0 && (
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  maxHeight: 260,
                  overflowY: "auto",
                }}
              >
                {carrito.map((item) => (
                  <li
                    key={item.id}
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      padding: "8px 0",
                      display: "grid",
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{item.nombre}</span>
                      <button
                        className="chip"
                        onClick={() => quitarDelCarrito(item.id)}
                        style={{
                          background: "#fee2e2",
                          borderColor: "#fecaca",
                          color: "#b91c1c",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 13,
                      }}
                    >
                      <span>${item.precio.toFixed(2)} c/u</span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <button
                          className="chip"
                          onClick={() => actualizarCantidad(item.id, -1)}
                        >
                          -
                        </button>
                        <span>{item.cantidad}</span>
                        <button
                          className="chip"
                          onClick={() => actualizarCantidad(item.id, 1)}
                        >
                          +
                        </button>
                      </div>
                      <span style={{ fontWeight: 600 }}>
                        ${(item.precio * item.cantidad).toFixed(2)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <hr style={{ margin: "10px 0" }} />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
                fontWeight: 700,
              }}
            >
              <span>Total:</span>
              <span>${totalCarrito.toFixed(2)}</span>
            </div>

            <button
              className="btn-login"
              onClick={confirmarCompra}
              disabled={carrito.length === 0 || comprando}
            >
              {comprando ? "Enviando pedido..." : "Confirmar pedido"}
            </button>

            {msg && (
              <p className="login-message" style={{ marginTop: 8 }}>
                {msg}
              </p>
            )}
          </aside>
        </section>

        {/* estilos extra para layout de usuario */}
        <style>{`
          /* Barra superior usuario */
          .user-topbar {
            width: 100%;
            box-sizing: border-box;
            padding: 10px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(90deg, #07c39b, #16a3ff);
            color: #f9fafb;
            box-shadow: 0 4px 16px rgba(15,23,42,0.25);
            position: sticky;
            top: 0;
            z-index: 20;
          }
          .user-topbar-left {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 600;
            letter-spacing: 0.02em;
          }
          .user-logo-pill {
            width: 32px;
            height: 32px;
            border-radius: 999px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(6px);
          }
          .user-topbar-title {
            font-size: 15px;
          }
          .user-topbar-right {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 14px;
          }
          .user-welcome strong {
            font-weight: 700;
          }
          .user-logout-btn {
            border: none;
            padding: 6px 14px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 600;
            background: #f97373;
            color: #fff;
            cursor: pointer;
            box-shadow: 0 6px 14px rgba(248,113,113,0.35);
            transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
          }
          .user-logout-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 8px 20px rgba(248,113,113,0.45);
            opacity: .95;
          }

          .user-layout {
            align-items: flex-start;
            padding-top: 16px;
          }
          .user-shop {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 18px;
            background: transparent;
            box-shadow: none;
          }
          .shop-list {
            background: #ffffff;
            border-radius: 18px;
            padding: 16px;
            box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
          }
          .shop-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
            gap: 14px;
            margin-top: 10px;
          }

          /* 🔸 Cards del mismo tamaño */
          .shop-item {
            background: #f8fafc;
            border-radius: 16px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            height: 100%;
            box-shadow: 0 4px 14px rgba(15,23,42,0.06);
          }
          .shop-item img {
            width: 100%;
            height: 140px;
            object-fit: cover;
          }
          .shop-body {
            padding: 10px 12px 12px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            flex: 1;
          }
          .shop-header-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 6px;
          }
          .shop-body h3 {
            margin: 0;
            font-size: 14px;
            font-weight: 700;
          }
          .shop-pill {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 999px;
            background: #e0f2fe;
            color: #0369a1;
            font-size: 11px;
            font-weight: 600;
            white-space: nowrap;
          }
          .shop-desc {
            font-size: 12px;
            color: #64748b;
            min-height: 34px;
          }
          .shop-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 13px;
          }
          .shop-price {
            font-weight: 700;
            color: #047857;
          }
          .shop-stock {
            color: #64748b;
          }
          .shop-btn {
            margin-top: auto;
            width: 100%;
          }
          .shop-cart {
            background: #ffffff;
            border-radius: 18px;
            padding: 16px;
            box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
          }
          @media (max-width: 1000px) {
            .user-shop {
              grid-template-columns: 1fr;
            }
            .user-topbar {
              flex-direction: column;
              align-items: flex-start;
              gap: 6px;
            }
            .user-topbar-right {
              width: 100%;
              justify-content: space-between;
            }
          }
        `}</style>
      </main>
    </>
  );
};

export default InicioUser;
