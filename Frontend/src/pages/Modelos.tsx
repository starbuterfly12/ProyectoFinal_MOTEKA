import { useState, useEffect } from "react";
import api from "@/lib/api";
import "@/diseños CSS/modelos.css";

export default function Modelos() {
  const [modelos, setModelos] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<any[]>([]);

  // form crear / editar
  const [nombre, setNombre] = useState("");
  const [marcaId, setMarcaId] = useState("");

  // control edición
  const [editingId, setEditingId] = useState<number | null>(null);

  // filtro tabla
  const [filterMarca, setFilterMarca] = useState("");

  // ===== fetch helpers =====
  const fetchMarcas = async () => {
    const response = await api.get("/api/marcas");
    setMarcas(response.data);
  };

  const fetchModelos = async () => {
    const response = await api.get(`/api/modelos?marca_id=${filterMarca}`);
    setModelos(response.data);
  };

  useEffect(() => {
    fetchMarcas();
  }, []);

  useEffect(() => {
    fetchModelos();
  }, [filterMarca]);

  // ===== crear / actualizar =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/modelos/${editingId}`, {
          nombre,
          marca_id: parseInt(marcaId),
        });
      } else {
        await api.post("/api/modelos", {
          nombre,
          marca_id: parseInt(marcaId),
        });
      }

      // limpiar
      setNombre("");
      setMarcaId("");
      setEditingId(null);

      fetchModelos();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error");
    }
  };

  // ===== eliminar =====
  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar modelo?")) return;
    try {
      await api.delete(`/api/modelos/${id}`);
      fetchModelos();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error");
    }
  };

  // ===== preparar edición =====
  const startEdit = (m: any) => {
    setEditingId(m.id);
    setNombre(m.nombre);
    setMarcaId(String(m.marca_id));
  };

  // ===== cancelar edición =====
  const cancelEdit = () => {
    setEditingId(null);
    setNombre("");
    setMarcaId("");
  };

  return (
    <div className="modelosPageWrapper">
      <h1 className="modelosTitulo">Modelos de Motocicletas</h1>

      <section className="modelosPanel">
        {/* ===== Form crear / editar ===== */}
        <form className="modelosForm" onSubmit={handleSubmit}>
          <div className="modelosFieldGroup">
            <label className="modelosLabel">Marca *</label>
            <select
              className="modelosInput"
              value={marcaId}
              required
              onChange={(e) => setMarcaId(e.target.value)}
            >
              <option value="">Seleccione marca</option>
              {marcas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="modelosFieldGroup">
            <label className="modelosLabel">Nombre del modelo *</label>
            <input
              className="modelosInput"
              type="text"
              placeholder="Ej: CBR 600RR"
              value={nombre}
              required
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="modelosButtonsRow">
            <button type="submit" className="btnRojo">
              {editingId ? "Actualizar" : "Crear"}
            </button>

            {editingId && (
              <button
                type="button"
                className="btnGris"
                onClick={cancelEdit}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* ===== Filtro por marca ===== */}
        <div className="modelosSearchBlock">
          <label className="modelosLabel">Filtrar por marca</label>
          <select
            className="modelosInput"
            value={filterMarca}
            onChange={(e) => setFilterMarca(e.target.value)}
          >
            <option value="">Todas las marcas</option>
            {marcas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* ===== Tabla ===== */}
        <div className="modelosTablaScroll">
          <table className="modelosTabla">
            <thead>
              <tr className="modelosHeadRow">
                <th className="modelosTh">ID</th>
                <th className="modelosTh">Modelo</th>
                <th className="modelosTh">Marca</th>
                <th className="modelosTh">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {modelos.length === 0 && (
                <tr className="modelosBodyRow">
                  <td
                    className="modelosTd"
                    colSpan={4}
                    style={{ textAlign: "center", color: "#aaa" }}
                  >
                    Sin resultados
                  </td>
                </tr>
              )}

              {modelos.map((modelo) => (
                <tr key={modelo.id} className="modelosBodyRow">
                  <td className="modelosTd">{modelo.id}</td>
                  <td className="modelosTd">{modelo.nombre}</td>
                  <td className="modelosTd">
                    {modelo.marca?.nombre || "—"}
                  </td>
                  <td className="modelosTd accionesCell">
                    <button
                      className="btnNegroChico"
                      onClick={() => startEdit(modelo)}
                    >
                      Editar
                    </button>

                    <button
                      className="btnRojoChico"
                      onClick={() => handleDelete(modelo.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}