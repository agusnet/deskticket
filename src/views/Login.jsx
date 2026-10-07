import React, { useState } from 'react';
import { Ticket, KeyRound, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import './Login.css';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (window.api && window.api.login) {
        const user = await window.api.login({ username, password });
        if (user) {
          onLoginSuccess(user);
        } else {
          setError('Credenciales incorrectas o usuario inactivo');
        }
      } else {
        // Fallback for standalone browser testing
        if (username === 'admin' && password === 'admin') {
          onLoginSuccess({
            id: 1,
            name: 'Administrador',
            lastname: 'General',
            username: 'admin',
            kind: 1
          });
        } else {
          setError('Credenciales incorrectas (demo: admin / admin)');
        }
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('Error al comunicarse con la base de datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-icon">
            <Ticket size={34} />
          </div>
          <h1>DeskTicket</h1>
          <p>Mesa de Ayuda y Control de Incidencias</p>
        </div>

        {error && (
          <div className="login-alert error" style={{ marginBottom: 16 }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Usuario o Correo</label>
            <div className="search-box" style={{ width: '100%' }}>
              <User size={18} color="#64748b" />
              <input
                type="text"
                placeholder="Ej. admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div className="search-box" style={{ width: '100%' }}>
              <KeyRound size={18} color="#64748b" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 8, padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Ingresar al Sistema'}
            <ArrowRight size={18} />
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setUsername('admin');
              setPassword('admin');
            }}
            style={{ marginTop: 4 }}
          >
            <ShieldCheck size={16} /> Rellenar credenciales demo (admin)
          </button>
        </form>

        <div className="login-footer">
          <span>DeskTicket • Soporte SQLite &copy; {new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
}
