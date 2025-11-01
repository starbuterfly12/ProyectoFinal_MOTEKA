import { Outlet, Link, useNavigate } from 'react-router-dom';
import { clearSession, getUser, hasRole } from '@/lib/auth';
import logo from '@/imagenes/logo.png'; // <- usa el mismo logo del login

export default function AuthLayout() {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* HEADER / NAV */}
      <header
        style={{
          backgroundColor: '#d30303fe',
          color: 'white',
          padding: '1rem 2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            rowGap: '1rem',
            width: '100%',
          }}
        >
          {/* Marca / logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src={logo}
              alt="Moteka"
              style={{
                width: '100px',
                height: '50px',
                borderRadius: '8px',
                boxShadow: '0 0 10px rgba(0,0,0,0.6)',
                backgroundColor: '#000', // por si tu PNG tiene fondo transparente
                objectFit: 'cover',
              }}
            />

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                lineHeight: 1.2,
                color: '#fff',
              }}
            >
              <span
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#fff',
                }}
              >
                MOTEKA
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 400,
                  color: '#eee',
                }}
              >
                Taller de Motos
              </span>
            </div>
          </div>

          {/* NAV */}
          <nav
            style={{
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'center',
              flexWrap: 'wrap',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            {/* Siempre visible */}
            <NavItem to="/home" label="Inicio" />

            {/* Órdenes: gerente / encargado / mecánico */}
            {hasRole('gerente', 'encargado', 'mecanico') && (
              <NavItem to="/ordenes" label="Órdenes" />
            )}

            {/* Herramientas: gerente / encargado / mecánico */}
            {hasRole('gerente', 'encargado', 'mecanico') && (
              <NavItem to="/herramientas" label="Herramientas" />
            )}

            {/* Solo gerente / encargado */}
            {hasRole('gerente', 'encargado') && (
              <>
                <NavItem to="/marcas" label="Marcas" />
                <NavItem to="/modelos" label="Modelos" />
                <NavItem to="/clientes" label="Clientes" />
                <NavItem to="/motos" label="Motocicletas" />
                <NavItem to="/usuarios" label="Usuarios" />
              </>
            )}

            {/* Separador visual */}
            <div
              style={{
                width: '1px',
                alignSelf: 'stretch',
                backgroundColor: '#694747',
                margin: '0 0.5rem',
              }}
            />

            {/* Usuario + salir */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: '#fff',
              }}
            >
              <span style={{ fontSize: '0.9rem', color: '#fff' }}>
                {user?.usuario}{' '}
                <span style={{ opacity: 0.7 }}>({user?.rol})</span>
              </span>

              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: '#710707ff',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                Salir
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* CONTENIDO */}
      <main
        style={{
          flex: 1,
          padding: '2rem',
          backgroundColor: '#2e2e2eff',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

/* --- Link limpio del navbar --- */
function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      style={{
        color: 'white',
        textDecoration: 'none',
        padding: '0.25rem 0.5rem',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.color = '#ffb3b3';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.color = 'white';
      }}
    >
      {label}
    </Link>
  );
}