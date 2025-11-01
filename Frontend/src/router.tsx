import { createBrowserRouter } from 'react-router-dom';
import PublicLayout from '@/layouts/PublicLayout';
import AuthLayout from '@/layouts/AuthLayout';
import RequireAuth from '@/components/RequireAuth';
import RequireRole from '@/components/RequiereRole';
import Login from '@/pages/Login';
import Home from '@/pages/Home';
import Marcas from '@/pages/Marcas';
import Modelos from '@/pages/Modelos';
import Clientes from '@/pages/Clientes';
import Motos from '@/pages/Motos';
import Ordenes from '@/pages/Ordenes';
import Usuarios from '@/pages/Usuarios';
import Herramientas from './pages/Herramientas';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/login',
        element: <Login />
      }
    ]
  },
  {
    element: (
      <RequireAuth>
        <AuthLayout />
      </RequireAuth>
    ),
    children: [
      // Home / dashboard -> todos los roles que pasen RequireAuth
      { path: '/', element: <Home /> },
      { path: '/home', element: <Home /> },
      { path: '/herramientas', element: <Herramientas/>},

      // Catálogos / administración
      {
        path: '/marcas',
        element: (
          <RequireRole allow={['gerente', 'encargado']}>
            <Marcas />
          </RequireRole>
        )
      },
      {
        path: '/modelos',
        element: (
          <RequireRole allow={['gerente', 'encargado']}>
            <Modelos />
          </RequireRole>
        )
      },
      {
        path: '/clientes',
        element: (
          <RequireRole allow={['gerente', 'encargado']}>
            <Clientes />
          </RequireRole>
        )
      },
      {
        path: '/motos',
        element: (
          <RequireRole allow={['gerente', 'encargado']}>
            <Motos />
          </RequireRole>
        )
      },

      // Órdenes -> gerente / encargado / mecánico
      {
        path: '/ordenes',
        element: (
          <RequireRole allow={['gerente', 'encargado', 'mecanico']}>
            <Ordenes />
          </RequireRole>
        )
      },

      // Usuarios -> solo jefe
      {
        path: '/usuarios',
        element: (
          <RequireRole allow={['gerente', 'encargado']}>
            <Usuarios />
          </RequireRole>
        )
      }
    ]
  }
]);