import { useEffect, useState } from "react";
import api from "@/lib/api";
import { hasRole } from "@/lib/auth";
import "@/diseños CSS/herramientas.css";

type Herramienta = {
    id: number;
    nombre: string;
    descripcion: string;
    cantidad: number;
    estado: string;
    ubicacion: string;
    marca_modelo: string;
    creado_en: string;
    actualizado_en: string;
    };

    export default function Herramientas() {
    const [lista, setLista] = useState<Herramienta[]>([]);
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(true);

    // formulario crear (solo gerente/encargado)
    const [form, setForm] = useState({
        nombre: "",
        descripcion: "",
        cantidad: 1,
        estado: "OPERATIVA",
        ubicacion: "",
        marca_modelo: "",
    });

    const puedeEditar = hasRole("gerente", "encargado");

    async function cargar() {
        try {
        const resp = await api.get("/api/herramientas");
        setLista(resp.data || []);
        } catch (err: any) {
        setError(err.response?.data?.error || "Error cargando inventario");
        } finally {
        setCargando(false);
        }
    }

    async function crearHerramienta(e: React.FormEvent) {
        e.preventDefault();
        try {
        await api.post("/api/herramientas", form);

        // limpiar form
        setForm({
            nombre: "",
            descripcion: "",
            cantidad: 1,
            estado: "OPERATIVA",
            ubicacion: "",
            marca_modelo: "",
        });

        cargar();
        } catch (err: any) {
        alert(err.response?.data?.error || "No se pudo guardar");
        }
    }

    async function eliminarHerramienta(id: number) {
        if (!confirm("¿Eliminar esta herramienta?")) return;
        try {
        await api.delete(`/api/herramientas/${id}`);
        cargar();
        } catch (err: any) {
        alert(err.response?.data?.error || "No se pudo eliminar");
        }
    }

    useEffect(() => {
        cargar();
    }, []);

    // estados de carga / error con nuestro theme
    if (cargando) {
        return (
        <div className="herrPageWrapper">
            <div className="herrStatusText">Cargando inventario...</div>
        </div>
        );
    }

    if (error) {
        return (
        <div className="herrPageWrapper">
            <div className="herrStatusError">{error}</div>
        </div>
        );
    }

    return (
        <div className="herrPageWrapper">
        <h1 className="herrTitulo">Inventario de Herramientas</h1>

        {/* FORM (solo gerente / encargado) */}
        {puedeEditar && (
            <section className="herrPanel">
            <h2 className="herrPanelTitle">Agregar herramienta</h2>

            <form className="herrForm" onSubmit={crearHerramienta}>
                {/* Nombre */}
                <div className="herrFieldGroup">
                <label className="herrLabel">Nombre *</label>
                <input
                    required
                    className="herrInput"
                    value={form.nombre}
                    placeholder="Gato hidráulico 2T"
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
                </div>

                {/* Marca / Modelo */}
                <div className="herrFieldGroup">
                <label className="herrLabel">Marca / Modelo</label>
                <input
                    className="herrInput"
                    value={form.marca_modelo}
                    placeholder="Truper / Makita..."
                    onChange={(e) =>
                    setForm({ ...form, marca_modelo: e.target.value })
                    }
                />
                </div>

                {/* Cantidad */}
                <div className="herrFieldGroup">
                <label className="herrLabel">Cantidad</label>
                <input
                    className="herrInput"
                    type="number"
                    min={1}
                    value={form.cantidad}
                    onChange={(e) =>
                    setForm({
                        ...form,
                        cantidad: Number(e.target.value),
                    })
                    }
                />
                </div>

                {/* Ubicación */}
                <div className="herrFieldGroup">
                <label className="herrLabel">Ubicación</label>
                <input
                    className="herrInput"
                    value={form.ubicacion}
                    placeholder="Bahía 2 / Estante rojo / etc."
                    onChange={(e) =>
                    setForm({ ...form, ubicacion: e.target.value })
                    }
                />
                </div>

                {/* Estado */}
                <div className="herrFieldGroup">
                <label className="herrLabel">Estado</label>
                <select
                    className="herrInput"
                    value={form.estado}
                    onChange={(e) =>
                    setForm({ ...form, estado: e.target.value })
                    }
                >
                    <option value="OPERATIVA">OPERATIVA</option>
                    <option value="EN_REPARACION">EN_REPARACION</option>
                    <option value="FUERA_DE_SERVICIO">FUERA_DE_SERVICIO</option>
                </select>
                </div>

                {/* Descripción */}
                <div className="herrFieldGroup herrFieldWide">
                <label className="herrLabel">Descripción</label>
                <textarea
                    className="herrTextarea"
                    value={form.descripcion}
                    placeholder="Notas, daños, etc."
                    onChange={(e) =>
                    setForm({ ...form, descripcion: e.target.value })
                    }
                />
                </div>

                {/* Botón guardar */}
                <div className="herrFieldWide">
                <button type="submit" className="btnRojo">
                    Guardar herramienta
                </button>
                </div>
            </form>
            </section>
        )}

        {/* LISTA */}
        <section className="herrPanel">
            <h2 className="herrPanelTitle">Herramientas registradas</h2>

            <div className="herrTablaScroll">
            <table className="herrTabla">
                <thead>
                <tr className="herrHeadRow">
                    <th className="herrTh">ID</th>
                    <th className="herrTh">Nombre</th>
                    <th className="herrTh">Marca/Modelo</th>
                    <th className="herrTh">Cant.</th>
                    <th className="herrTh">Estado</th>
                    <th className="herrTh">Ubicación</th>
                    <th className="herrTh">Notas</th>
                    {puedeEditar && <th className="herrTh">Acciones</th>}
                </tr>
                </thead>

                <tbody>
                {lista.length === 0 && (
                    <tr className="herrBodyRow">
                    <td
                        className="herrTd"
                        colSpan={puedeEditar ? 8 : 7}
                        style={{ textAlign: "center", color: "#999" }}
                    >
                        Sin herramientas registradas
                    </td>
                    </tr>
                )}

                {lista.map((h) => (
                    <tr key={h.id} className="herrBodyRow">
                    <td className="herrTd">{h.id}</td>
                    <td className="herrTd">{h.nombre}</td>
                    <td className="herrTd">{h.marca_modelo || "—"}</td>
                    <td className="herrTd">{h.cantidad}</td>
                    <td className="herrTd">{h.estado}</td>
                    <td className="herrTd">{h.ubicacion || "—"}</td>
                    <td className="herrTd">{h.descripcion || "—"}</td>

                    {puedeEditar && (
                        <td className="herrTd">
                        <button
                            className="btnRojoChico"
                            onClick={() => eliminarHerramienta(h.id)}
                        >
                            Eliminar
                        </button>
                        </td>
                    )}
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </section>
        </div>
    );
    }