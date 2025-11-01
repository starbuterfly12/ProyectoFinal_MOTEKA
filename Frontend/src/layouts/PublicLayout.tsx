import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #3b1e1eff 0%, #2a0f0fff 100%)'
    }}>
      <Outlet />
    </div>
  );
}
