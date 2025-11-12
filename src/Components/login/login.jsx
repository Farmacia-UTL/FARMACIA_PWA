import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://api-farmacia.ngrok.app';

const Login = () => {
  const [user, setUser] = useState('');          // antes: email
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const resp = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user,                // 👈 coincide con LoginRequest.User
          contrasena: password // 👈 coincide con LoginRequest.Contrasena
        }),
      });

      const data = await resp.json().catch(() => null);

      if (resp.ok) {
        setMessage(data?.message || 'Login exitoso');

        // Redirección por rol (mejor que por nombre)
        if ((data?.rol || '').toLowerCase() === 'admin') {
          navigate('/inicioAdmin');
        } else {
          navigate('/inicioUser');
        }
      } else {
        // Intenta leer mensaje del backend; si no, genérico
        setMessage(data?.message || data || 'Credenciales inválidas');
      }
    } catch (err) {
      console.error(err);
      setMessage('No se pudo conectar con el servidor.');
    }
  };

  return (
    <div className="login-page">
      <div className="overlay"></div>

      <div className="login-card">
        <h2 className="login-title">Bienvenido a <span>Farmacia</span></h2>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Usuario</label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Ingresa tu usuario"
              required
              autoComplete="username"
            />
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-login">Iniciar sesión</button>
        </form>

        {message && <p className="login-message">{message}</p>}
      </div>
    </div>
  );
};

export default Login;
