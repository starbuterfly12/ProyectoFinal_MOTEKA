import { useState, useEffect } from "react";
import api from "@/lib/api";
import "@/diseños CSS/marcas.css";

export default function Marcas() {
  const [marcas, setMarcas] = useState<any[]>([]);
  const [nombre, setNombre] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const fetchMarcas = async () => {
    try {
      const response = await api.get(`/api/marcas?q=${search}`);
      setMarcas(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMarcas();
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/marcas/${editingId}`, { nombre });
      } else {
        await api.post("/api/marcas", { nombre });
      }

      setNombre("");
      setEditingId(null);
      fetchMarcas();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar marca?")) return;
    try {
      await api.delete(`/api/marcas/${id}`);
      fetchMarcas();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error");
    }
  };

  return (
    <div className="marcasPageWrapper">
      <h1 className="marcasTitulo">Marcas de Motocicletas</h1>

      <section className="marcasPanel">
        {/* === Form crear / editar === */}
        <form className="marcasForm" onSubmit={handleSubmit}>
          <div className="marcasFieldGroup">
            <label className="marcasLabel">Nombre de marca *</label>
            <input
              type="text"
              className="marcasInput"
              placeholder="Ej: Honda"
              value={nombre}
              required
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="marcasButtonsRow">
            <button type="submit" className="btnRojo">
              {editingId ? "Actualizar" : "Crear"}
            </button>

            {editingId && (
              <button
                type="button"
                className="btnGris"
                onClick={() => {
                  setEditingId(null);
                  setNombre("");
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* === Buscador === */}
        <div className="marcasSearchBlock">
          <label className="marcasLabel">Buscar marca</label>
          <input
            type="text"
            className="marcasInput"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* === Tabla === */}
        <div className="marcasTablaScroll">
          <table className="marcasTabla">
            <thead>
              <tr className="marcasHeadRow">
                <th className="marcasTh">ID</th>
                <th className="marcasTh">Nombre</th>
                <th className="marcasTh">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {marcas.length === 0 && (
                <tr className="marcasBodyRow">
                  <td
                    className="marcasTd"
                    colSpan={3}
                    style={{ textAlign: "center", color: "#aaa" }}
                  >
                    Sin resultados
                  </td>
                </tr>
              )}

              {marcas.map((marca) => (
                <tr className="marcasBodyRow" key={marca.id}>
                  <td className="marcasTd">{marca.id}</td>
                  <td className="marcasTd">{marca.nombre}</td>
                  <td className="marcasTd accionesCell">
                    <button
                      className="btnNegroChico"
                      onClick={() => {
                        setEditingId(marca.id);
                        setNombre(marca.nombre);
                      }}
                    >
                      Editar
                    </button>

                    <button
                      className="btnRojoChico"
                      onClick={() => handleDelete(marca.id)}
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