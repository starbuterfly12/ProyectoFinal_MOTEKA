import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { hasRole } from '@/lib/auth';
import '../diseños CSS/usuarios.css';

type UsuarioRow = {
    id: number;
    usuario: string;
    correo: string | null;
    rol: string | null;
    empleado?: {
        id: number;
        nombre: string;
        activo: boolean;
    } | null;
    creado_en?: string | null;
    };

    export default function Usuarios() {
    // Solo gerente puede ver/crear
    const autorizado = hasRole('gerente');

    // listado / estado de carga
    const [usuarios, setUsuarios] = useState<UsuarioRow[]>([]);
    const [cargandoLista, setCargandoLista] = useState(false);
    const [errorLista, setErrorLista] = useState<string | null>(null);

    // formulario de creación
    const [usuario, setUsuario] = useState('');
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [rol, setRol] = useState('mecanico'); // default
    const [nombreEmpleado, setNombreEmpleado] = useState('');

    const [creando, setCreando] = useState(false);
    const [errorCrear, setErrorCrear] = useState<string | null>(null);
    const [okCrear, setOkCrear] = useState<string | null>(null);

    async function cargarUsuarios() {
        setCargandoLista(true);
        setErrorLista(null);
        try {
        const { data } = await api.get('/api/usuarios');
        setUsuarios(data);
        } catch (err: any) {
        const msg =
            err?.response?.data?.error || 'No se pudo cargar usuarios';
        setErrorLista(msg);
        } finally {
        setCargandoLista(false);
        }
    }

    async function crearUsuario(e: React.FormEvent) {
        e.preventDefault();
        setCreando(true);
        setErrorCrear(null);
        setOkCrear(null);

        try {
        const payload: any = {
            usuario,
            correo: correo || null,
            contrasena,
            rol, // 'gerente' | 'encargado' | 'mecanico'
        };

        // si NO estás pasando empleado_id, mandamos nombre_empleado
        if (nombreEmpleado.trim() !== '') {
            payload.nombre_empleado = nombreEmpleado.trim();
        }

        const { data } = await api.post('/api/usuarios', payload);

        setOkCrear(
            `Usuario '${data.usuario?.usuario ?? usuario}' creado exitosamente`
        );

        // limpiar form
        setUsuario('');
        setCorreo('');
        setContrasena('');
        setRol('mecanico');
        setNombreEmpleado('');

        // refrescar listado
        cargarUsuarios();
        } catch (err: any) {
        const msg =
            err?.response?.data?.error || 'Error creando usuario';
        setErrorCrear(msg);
        } finally {
        setCreando(false);
        }
    }

    useEffect(() => {
        if (autorizado) {
        cargarUsuarios();
        }
    }, [autorizado]);

    // Si no tiene permiso, mostramos card oscura con mensaje
    if (!autorizado) {
        return (
        <div className="usuarios-wrapper">
            <div className="usuarios-card">
            <h2 className="usuarios-titulo">Gestión de Usuarios</h2>
            <div className="usuarios-error">
                No estás autorizado para ver esta sección.
            </div>
            </div>
        </div>
        );
    }

    // Render normal
    return (
        <div className="usuarios-wrapper">
        {/* ====== FORM NUEVO USUARIO ====== */}
        <div className="usuarios-card">
            <h2 className="usuarios-titulo">Crear nuevo usuario</h2>
            <p className="usuarios-desc">
            Solo el gerente puede registrar personal nuevo del taller y
            asignarles rol.
            </p>

            {errorCrear && <div className="usuarios-error">{errorCrear}</div>}
            {okCrear && <div className="usuarios-ok">{okCrear}</div>}

            <form className="usuarios-form" onSubmit={crearUsuario}>
            <div className="usuarios-field">
                <label className="usuarios-label">Usuario (login)</label>
                <input
                className="usuarios-input"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                />
            </div>

            <div className="usuarios-field">
                <label className="usuarios-label">Correo (opcional)</label>
                <input
                className="usuarios-input"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                type="email"
                />
            </div>

            <div className="usuarios-field">
                <label className="usuarios-label">Contraseña</label>
                <input
                className="usuarios-input"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                type="password"
                required
                />
            </div>

            <div className="usuarios-field">
                <label className="usuarios-label">Rol</label>
                <select
                className="usuarios-input"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                >
                <option value="mecanico">Mecánico</option>
                <option value="encargado">Encargado</option>
                <option value="gerente">Gerente</option>
                </select>
            </div>

            <div className="usuarios-field usuarios-field-span2">
                <label className="usuarios-label">
                Nombre del empleado
                <br />
                <span className="usuarios-hint">
                    Obligatorio si es mecánico o personal nuevo
                </span>
                </label>
                <input
                className="usuarios-input"
                value={nombreEmpleado}
                onChange={(e) => setNombreEmpleado(e.target.value)}
                placeholder="Ej. Carlos Pérez"
                />
            </div>

            <div className="usuarios-buttons-row usuarios-field-span2">
                <button
                className="usuarios-boton"
                type="submit"
                disabled={creando}
                >
                {creando ? 'Guardando...' : 'Crear usuario'}
                </button>
            </div>
            </form>
        </div>

        {/* ====== TABLA USUARIOS ====== */}
        <div className="usuarios-card">
            <h2 className="usuarios-titulo">Usuarios registrados</h2>

            {cargandoLista && (
            <div className="usuarios-info">Cargando usuarios…</div>
            )}

            {errorLista && (
            <div className="usuarios-error">{errorLista}</div>
            )}

            {!cargandoLista && !errorLista && (
            <div className="usuarios-tabla-wrapper">
                <table className="usuarios-tabla">
                <thead>
                    <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Empleado asignado</th>
                    <th>Correo</th>
                    <th>Creado en</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="usuarios-vacio">
                        No hay usuarios
                        </td>
                    </tr>
                    ) : (
                    usuarios.map((u) => (
                        <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.usuario}</td>
                        <td>{u.rol}</td>
                        <td>{u.empleado?.nombre ?? '-'}</td>
                        <td>{u.correo ?? '-'}</td>
                        <td>{u.creado_en ?? '-'}</td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
            </div>
            )}
        </div>
        </div>
    );
    }