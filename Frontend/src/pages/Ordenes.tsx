import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { hasRole, getUser } from '@/lib/auth';
import '@/diseños CSS/ordenes.css';

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [motos, setMotos] = useState<any[]>([]);
  const [mecanicos, setMecanicos] = useState<any[]>([]);

  const [clienteId, setClienteId] = useState('');
  const [motoId, setMotoId] = useState('');
  const [mecanicoId, setMecanicoId] = useState('');

  const [observaciones, setObservaciones] = useState('');
  const [search, setSearch] = useState('');

  const [historialOrden, setHistorialOrden] = useState<any[]>([]);
  const [showHistorial, setShowHistorial] = useState(false);

  // Reporte técnico (crear)
  const [showReporteModal, setShowReporteModal] = useState(false);
  const [ordenParaReporte, setOrdenParaReporte] = useState<number | null>(null);
  const [textoReporte, setTextoReporte] = useState('');
  const [errorReporte, setErrorReporte] = useState('');
  const [guardandoReporte, setGuardandoReporte] = useState(false);

  // Ver reportes técnicos
  const [showVerReportes, setShowVerReportes] = useState(false);
  const [ordenParaVerReportes, setOrdenParaVerReportes] = useState<number | null>(null);
  const [listaReportes, setListaReportes] = useState<any[]>([]);
  const [cargandoReportes, setCargandoReportes] = useState(false);

  // Reasignar mecánico (todavía sin UI completa)
  const [reasignandoOrdenId, setReasignandoOrdenId] = useState<number | null>(null);
  const [nuevoMecanicoId, setNuevoMecanicoId] = useState<string>('');
  const [errorReasignar, setErrorReasignar] = useState<string>('');

  // Exportar historial por cliente
  const [clienteExportId, setClienteExportId] = useState('');

  const currentUser = getUser(); // por si lo ocupamos luego

  const fetchOrdenes = async () => {
    const response = await api.get(`/api/ordenes?cliente_nombre=${search}`);
    setOrdenes(response.data);
  };

  const fetchClientes = async () => {
    const response = await api.get('/api/clientes');
    setClientes(response.data);
  };

  const fetchMotos = async (cId: string) => {
    if (!cId) {
      setMotos([]);
      return;
    }
    const response = await api.get(`/api/motocicletas?cliente_id=${cId}`);
    setMotos(response.data);
  };

  const fetchMecanicos = async () => {
    if (!hasRole('gerente', 'encargado', 'mecanico')) return;
    const response = await api.get('/api/mecanicos');
    setMecanicos(response.data || []);
  };

  useEffect(() => {
    fetchClientes();
    fetchOrdenes();
    fetchMecanicos();
  }, []);

  useEffect(() => {
    fetchOrdenes();
  }, [search]);

  useEffect(() => {
    fetchMotos(clienteId);
    setMotoId('');
  }, [clienteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/ordenes', {
        cliente_id: parseInt(clienteId),
        motocicleta_id: parseInt(motoId),
        observaciones,
        mecanico_id: mecanicoId ? parseInt(mecanicoId) : null,
      });

      setClienteId('');
      setMotoId('');
      setMecanicoId('');
      setObservaciones('');

      fetchOrdenes();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  const handleCambiarEstado = async (ordenId: number, nuevoEstado: string) => {
    try {
      await api.patch(`/api/ordenes/${ordenId}/estado`, { estado: nuevoEstado });
      // correo al cliente se dispara en backend
      fetchOrdenes();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  const handleVerHistorial = async (ordenId: number) => {
    try {
      const response = await api.get(`/api/ordenes/${ordenId}/historial`);
      setHistorialOrden(response.data);
      setShowHistorial(true);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  // EXPORTAR (xlsx/pdf) global o por cliente
  const handleExportar = async (formato: string, onlyCliente?: boolean) => {
    try {
      const params: any = { formato };
      if (onlyCliente && clienteExportId) {
        params.cliente_id = parseInt(clienteExportId);
      }

      const response = await api.get('/api/reportes/ordenes', {
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');

      const baseName = onlyCliente
        ? `historial_cliente_${clienteExportId || 'sin_id'}`
        : 'ordenes_taller';

      link.href = url;
      link.setAttribute(
        'download',
        `${baseName}.${formato === 'xlsx' ? 'xlsx' : 'pdf'}`
      );

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al exportar');
    }
  };

  // modal crear reporte técnico
  const abrirModalReporte = (ordenId: number) => {
    setOrdenParaReporte(ordenId);
    setTextoReporte('');
    setErrorReporte('');
    setShowReporteModal(true);
  };

  const guardarReporte = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ordenParaReporte) return;
    if (!textoReporte.trim()) {
      setErrorReporte('El reporte no puede ir vacío');
      return;
    }

    try {
      setGuardandoReporte(true);
      setErrorReporte('');
      await api.post('/api/reportes_trabajo', {
        orden_id: ordenParaReporte,
        descripcion: textoReporte.trim()
      });

      setShowReporteModal(false);
      setOrdenParaReporte(null);
      setTextoReporte('');
    } catch (err: any) {
      setErrorReporte(err.response?.data?.error || 'No se pudo guardar');
    } finally {
      setGuardandoReporte(false);
    }
  };

  // modal ver reportes técnicos
  const abrirVerReportes = async (ordenId: number) => {
    setOrdenParaVerReportes(ordenId);
    setShowVerReportes(true);
    setCargandoReportes(true);

    try {
      const resp = await api.get('/api/reportes_trabajo', {
        params: { orden_id: ordenId }
      });
      setListaReportes(resp.data || []);
    } catch {
      setListaReportes([]);
    } finally {
      setCargandoReportes(false);
    }
  };

  // permisos de edición de estado
  const puedeEditarEstado = (orden: any) => {
    if (hasRole('gerente', 'encargado')) return true;
    if (hasRole('mecanico')) return true;
    return false;
  };

  return (
    <div className="ordenesPageWrapper">
      <h1 className="ordenesTitulo">Órdenes de Trabajo</h1>

      <div className="ordenesPanel">
        {/* FORM CREAR ORDEN (solo gerente/encargado) */}
        {hasRole('gerente', 'encargado') && (
          <form className="ordenForm" onSubmit={handleSubmit}>
            <select
              className="ordenInput"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              required
            >
              <option value="">Seleccione cliente*</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>

            <select
              className="ordenInput"
              value={motoId}
              onChange={(e) => setMotoId(e.target.value)}
              required
              disabled={!clienteId}
            >
              <option value="">Seleccione motocicleta*</option>
              {motos.map((m) => (
                <option key={m.id} value={m.id}>
                  {(m.placa || m.vin || `Moto ${m.id}`) +
                    ' - ' +
                    (m.marca?.nombre || '¿?') +
                    ' ' +
                    (m.modelo?.nombre || '')}
                </option>
              ))}
            </select>

            <select
              className="ordenInput"
              value={mecanicoId}
              onChange={(e) => setMecanicoId(e.target.value)}
            >
              <option value="">Asignar mecánico (opcional)</option>
              {mecanicos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>

            <input
              className="ordenInput"
              type="text"
              placeholder="Observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />

            <button className="btnRojo" type="submit">
              Crear Orden
            </button>
          </form>
        )}

        {/* FILTROS / EXPORTS */}
        <div className="filtrosWrapper">
          {/* Buscar en tabla */}
          <div className="filtroBloque">
            <label className="filtroLabel">Buscar en pantalla (por nombre de cliente)</label>
            <input
              className="ordenInput"
              type="text"
              placeholder="Ej: Juan Pérez"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Exportes por cliente */}
          {hasRole('gerente', 'encargado') && (
            <div className="filtroBloque">
              <label className="filtroLabel">Historial de este cliente</label>

              <select
                className="ordenInput"
                value={clienteExportId}
                onChange={(e) => setClienteExportId(e.target.value)}
              >
                <option value="">-- Seleccione cliente --</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>

              <div className="exportButtonsRow">
                <button
                  className="btnNegro"
                  onClick={() => handleExportar('xlsx', true)}
                  disabled={!clienteExportId}
                >
                  XLSX cliente
                </button>

                <button
                  className="btnRojo"
                  onClick={() => handleExportar('pdf', true)}
                  disabled={!clienteExportId}
                >
                  PDF cliente
                </button>
              </div>
            </div>
          )}

          {/* Export global */}
          {hasRole('gerente', 'encargado') && (
            <div className="filtroBloque">
              <label className="filtroLabel">Reporte global del taller</label>

              <div className="exportButtonsRow">
                <button
                  className="btnNegro"
                  onClick={() => handleExportar('xlsx', false)}
                >
                  XLSX global
                </button>

                <button
                  className="btnRojo"
                  onClick={() => handleExportar('pdf', false)}
                >
                  PDF global
                </button>
              </div>
            </div>
          )}
        </div>

        {/* TABLA ORDENES */}
        <div className="tablaScroll">
          <table className="ordenesTabla">
            <thead>
              <tr className="ordenesHeadRow">
                <th className="ordenesTh">ID</th>
                <th className="ordenesTh">Cliente</th>
                <th className="ordenesTh">Placa</th>
                <th className="ordenesTh">Estado</th>
                <th className="ordenesTh">Fecha Ingreso</th>
                <th className="ordenesTh">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((orden) => (
                <tr key={orden.id} className="ordenesBodyRow">
                  <td className="ordenesTd">{orden.id}</td>
                  <td className="ordenesTd">{orden.cliente?.nombre}</td>
                  <td className="ordenesTd">{orden.motocicleta?.placa || 'N/A'}</td>

                  <td className="ordenesTd">
                    {puedeEditarEstado(orden) ? (
                      <select
                        className="ordenEstadoSelect"
                        value={orden.estado}
                        onChange={(e) => handleCambiarEstado(orden.id, e.target.value)}
                      >
                        <option value="EN_ESPERA">EN_ESPERA</option>
                        <option value="EN_REPARACION">EN_REPARACION</option>
                        <option value="FINALIZADA">FINALIZADA</option>
                        <option value="CANCELADA">CANCELADA</option>
                      </select>
                    ) : (
                      <span>{orden.estado}</span>
                    )}
                  </td>

                  <td className="ordenesTd">
                    {orden.fecha_ingreso
                      ? new Date(orden.fecha_ingreso).toLocaleString()
                      : '—'}
                  </td>

                  <td className="ordenesTd ordenAccionesCell">
                    <button
                      className="btnChicoClaro"
                      onClick={() => handleVerHistorial(orden.id)}
                    >
                      Historial
                    </button>

                    {hasRole('mecanico', 'gerente', 'encargado') && (
                      <button
                        className="btnNegroChico"
                        onClick={() => abrirModalReporte(orden.id)}
                      >
                        Reporte
                      </button>
                    )}

                    {hasRole('mecanico', 'gerente', 'encargado') && (
                      <button
                        className="btnGrisChico"
                        onClick={() => abrirVerReportes(orden.id)}
                      >
                        Ver reportes
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL HISTORIAL */}
      {showHistorial && (
        <div className="modalOverlay" onClick={() => setShowHistorial(false)}>
          <div
            className="modalCard"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modalTitle">Historial de Estados</h2>

            <table className="histTabla">
              <thead>
                <tr className="histHeadRow">
                  <th className="histTh">Estado</th>
                  <th className="histTh">Fecha</th>
                  <th className="histTh">Notas</th>
                </tr>
              </thead>
              <tbody>
                {historialOrden.map((h) => (
                  <tr key={h.id} className="histBodyRow">
                    <td className="histTd">{h.estado}</td>
                    <td className="histTd">
                      {new Date(h.creado_en).toLocaleString()}
                    </td>
                    <td className="histTd">{h.notas}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              className="btnRojo modalCloseBtn"
              onClick={() => setShowHistorial(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL CREAR REPORTE */}
      {showReporteModal && (
        <div className="modalOverlay">
          <div
            className="modalCard"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modalTitle">
              Reporte técnico (Orden #{ordenParaReporte})
            </h2>

            <form onSubmit={guardarReporte}>
              <div className="modalField">
                <label className="modalLabel">Descripción del trabajo realizado</label>
                <textarea
                  className="modalTextarea"
                  value={textoReporte}
                  onChange={(e) => setTextoReporte(e.target.value)}
                />
              </div>

              {errorReporte && (
                <div className="modalError">{errorReporte}</div>
              )}

              <div className="modalActions">
                <button
                  type="button"
                  className="btnChicoClaro"
                  onClick={() => {
                    setShowReporteModal(false);
                    setOrdenParaReporte(null);
                  }}
                  disabled={guardandoReporte}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btnNegro"
                  disabled={guardandoReporte}
                >
                  {guardandoReporte ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VER REPORTES */}
      {showVerReportes && (
        <div
          className="modalOverlay"
          onClick={() => setShowVerReportes(false)}
        >
          <div
            className="modalCard modalCardScroll"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modalTitle">
              Reportes técnicos (Orden #{ordenParaVerReportes})
            </h2>

            {cargandoReportes ? (
              <div className="modalLoading">Cargando…</div>
            ) : (
              <div className="reportesLista">
                {listaReportes.length === 0 && (
                  <div className="reportesEmpty">No hay reportes</div>
                )}

                {listaReportes.map((r: any) => (
                  <div key={r.id} className="reporteItem">
                    <div className="reporteMeta">
                      <b>{r.mecanico_nombre || '—'}</b> |{' '}
                      {new Date(r.creado_en).toLocaleString()}
                    </div>

                    <div className="reporteDescripcion">
                      {r.descripcion}
                    </div>

                    <div className="reporteInfoExtra">
                      Cliente: {r.cliente_nombre || '—'}
                      <br />
                      Moto: {r.moto_placa || r.moto_vin || '—'}
                      <br />
                      Modelo/Marca: {r.modelo_nombre || '—'} / {r.marca_nombre || '—'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="modalActionsRight">
              <button
                className="btnRojo"
                onClick={() => setShowVerReportes(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}