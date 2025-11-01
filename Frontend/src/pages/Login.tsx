import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { setSession } from '@/lib/auth';
import '@/diseños CSS/login.css';
import logo from '@/imagenes/logo.png';

export default function Login() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const resp = await api.post('/api/auth/login', {
        usuario,
        contrasena,
      });

      const { access_token, user } = resp.data;
      setSession(access_token, user, remember);
      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Credenciales inválidas');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <img src={logo} alt="Moteka" className="login-logo" />
            <h2 className="login-title">Iniciar sesión</h2>
            <p className="login-subtitle">
              Sistema de Gestión — Taller de Motos
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label className="form-label">Usuario</label>
              <input
                className="form-input"
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                className="form-input"
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
            </div>

            <label className="form-remember-row">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Recordarme</span>
            </label>

            <button className="login-button" type="submit">
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}