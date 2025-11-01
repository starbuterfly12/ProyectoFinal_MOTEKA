import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { hasRole } from '@/lib/auth';
import '@/diseños CSS/home.css';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDash = async () => {
      try {
        const resp = await api.get('/api/dashboard/resumen');
        setData(resp.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Error cargando dashboard');
      } finally {
        setCargando(false);
      }
    };
    fetchDash();
  }, []);

  if (cargando) {
    return (
      <div className="pageWrapper">
        <div className="loadingText">Cargando dashboard…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pageWrapper">
        <div className="errorText">{error}</div>
      </div>
    );
  }

  const resumen = data?.resumen_hoy || {};
  const activas = data?.ordenes_activas_hoy || [];
  const actividad = data?.actividad_reciente || [];

  const mecDisp = data?.mecanicos_disponibles ?? 0;
  const mecTot = data?.mecanicos_total ?? 0;

  return (
    <div className="pageWrapper">
      {/* ===== CARDS RESUMEN ARRIBA ===== */}
      <section className="statsGrid">
        <StatCard label="Órdenes creadas hoy" value={resumen.total ?? 0} />
        <StatCard label="En espera" value={resumen.en_espera ?? 0} />
        <StatCard label="En reparación" value={resumen.en_reparacion ?? 0} />
        <StatCard label="Finalizadas" value={resumen.finalizadas ?? 0} />
        <StatCard label="Canceladas" value={resumen.canceladas ?? 0} />
        <StatCard label="Clientes activos" value={data?.clientes_activos ?? 0} />
        <StatCard
          label="Mecánicos disponibles"
          value={`${mecDisp}/${mecTot}`}
        />
      </section>

      {/* ===== BLOQUE PRINCIPAL: MÓDULOS / ACCIONES / ACTIVIDAD ===== */}
      <section className="mainGrid">
        {/* Columna izquierda */}
        <div className="leftCol">
          <Panel title="Módulos del sistema">
            <div className="modulesGrid">
              <ModuleCard
                title="Clientes"
                desc="Administrar información de clientes"
                to="/clientes"
              />
              <ModuleCard
                title="Órdenes de trabajo"
                desc="Ingreso, estado y cierre de órdenes"
                to="/ordenes"
              />
              <ModuleCard
                title="Reportes"
                desc="Exportar historial y reportes técnicos"
                to="/ordenes"
              />
            </div>
          </Panel>
        </div>

        {/* Columna derecha */}
        <div className="rightCol">
          <Panel title="Acciones rápidas">
            <div className="quickActionsRow">
              {hasRole('gerente', 'encargado') && (
                <QuickButton to="/ordenes" label="Nueva orden" />
              )}
              {hasRole('gerente', 'encargado') && (
                <QuickButton to="/clientes" label="Nuevo cliente" />
              )}
              <QuickButton to="/ordenes" label="Ver reportes" />
            </div>
          </Panel>

          <Panel title="Actividad reciente">
            <div className="activityListWrapper">
              {actividad.length === 0 && (
                <div className="activityEmpty">
                  Sin actividad reciente
                </div>
              )}

              {actividad.map((evt: any, idx: number) => (
                <div key={idx} className="activityItem">
                  <div className="activityTitle">{evt.titulo}</div>
                  <div className="activityDetail">{evt.detalle}</div>
                  <div className="activityTime">{evt.hace}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      {/* ===== TABLA ÓRDENES ACTIVAS HOY ===== */}
      <section className="ordersSection">
        <Panel title="Órdenes de hoy en curso">
          <div className="tableScroll">
            <table className="ordersTable">
              <thead>
                <tr className="ordersHeadRow">
                  <Th>ID</Th>
                  <Th>Estado</Th>
                  <Th>Cliente</Th>
                  <Th>Moto</Th>
                  <Th>Mecánico</Th>
                  <Th>Ingreso</Th>
                </tr>
              </thead>
              <tbody>
                {activas.length === 0 && (
                  <tr>
                    <Td colSpan={6} style={{ textAlign: 'center', color: '#777' }}>
                      No hay órdenes activas hoy.
                    </Td>
                  </tr>
                )}

                {activas.map((o: any) => (
                  <tr key={o.id} className="ordersBodyRow">
                    <Td>{o.id}</Td>
                    <Td>{o.estado}</Td>
                    <Td>{o.cliente || '—'}</Td>
                    <Td>{o.moto || '—'}</Td>
                    <Td>{o.mecanico || '—'}</Td>
                    <Td>
                      {o.fecha_ingreso
                        ? new Date(o.fecha_ingreso).toLocaleString()
                        : '—'}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>

      <div className="pageBottomSpacer" />
    </div>
  );
}

/* ================== COMPONENTES UI ================== */

function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="statCard">
      <div className="statValue">{value ?? 0}</div>
      <div className="statLabel">{label}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: any }) {
  return (
    <div className="panel">
      <h2 className="panelTitle">{title}</h2>
      {children}
    </div>
  );
}

function ModuleCard({
  title,
  desc,
  to
}: {
  title: string;
  desc: string;
  to: string;
}) {
  return (
    <Link to={to} className="moduleCard">
      <div className="moduleTitle">{title}</div>
      <div className="moduleDesc">{desc}</div>
    </Link>
  );
}

function QuickButton({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="quickButton">
      {label}
    </Link>
  );
}

function Th({ children }: { children: any }) {
  return (
    <th className="ordersTh">
      {children}
    </th>
  );
}

function Td({
  children,
  style
}: {
  children: any;
  style?: React.CSSProperties;
}) {
  return (
    <td className="ordersTd" style={style || {}}>
      {children}
    </td>
  );
}