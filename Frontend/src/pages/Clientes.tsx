import { useState, useEffect } from "react";
import api from "@/lib/api";
import "@/diseños CSS/clientes.css";

export default function Clientes() {
  const [clientes, setClientes] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    correo: "",
    direccion: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  // ======================
  // Fetch helpers
  // ======================
  const fetchClientes = async () => {
    const response = await api.get(`/api/clientes?q=${search}`);
    setClientes(response.data);
  };

  useEffect(() => {
    fetchClientes();
  }, [search]);

  // ======================
  // Crear / actualizar
  // ======================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/clientes/${editingId}`, formData);
      } else {
        await api.post("/api/clientes", formData);
      }

      // limpiar form
      setFormData({
        nombre: "",
        telefono: "",
        correo: "",
        direccion: "",
      });
      setEditingId(null);

      fetchClientes();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error");
    }
  };

  // ======================
  // Eliminar
  // ======================
  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar cliente?")) return;
    try {
      await api.delete(`/api/clientes/${id}`);
      fetchClientes();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error");
    }
  };

  // ======================
  // Editar
  // ======================
  const startEdit = (cliente: any) => {
    setEditingId(cliente.id);
    setFormData({
      nombre: cliente.nombre || "",
      telefono: cliente.telefono || "",
      correo: cliente.correo || "",
      direccion: cliente.direccion || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      nombre: "",
      telefono: "",
      correo: "",
      direccion: "",
    });
  };

  return (
    <div className="clientesPageWrapper">
      <h1 className="clientesTitulo">Clientes</h1>

      <section className="clientesPanel">
        {/* ===== Formulario crear / editar ===== */}
        <form className="clientesForm" onSubmit={handleSubmit}>
          <div className="clientesFieldGroup clientesFieldSpan2">
            <label className="clientesLabel">Nombre *</label>
            <input
              className="clientesInput"
              type="text"
              placeholder="Nombre del cliente"
              value={formData.nombre}
              required
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
            />
          </div>

          <div className="clientesFieldGroup">
            <label className="clientesLabel">Teléfono</label>
            <input
              className="clientesInput"
              type="text"
              placeholder="Ej: 5555-5555"
              value={formData.telefono}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
            />
          </div>

          <div className="clientesFieldGroup">
            <label className="clientesLabel">Correo</label>
            <input
              className="clientesInput"
              type="email"
              placeholder="cliente@ejemplo.com"
              value={formData.correo}
              onChange={(e) =>
                setFormData({ ...formData, correo: e.target.value })
              }
            />
          </div>

          <div className="clientesFieldGroup clientesFieldSpan2">
            <label className="clientesLabel">Dirección</label>
            <input
              className="clientesInput"
              type="text"
              placeholder="Dirección / referencia"
              value={formData.direccion}
              onChange={(e) =>
                setFormData({ ...formData, direccion: e.target.value })
              }
            />
          </div>

          <div className="clientesButtonsRow clientesFieldSpan2">
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

        {/* ===== Búsqueda ===== */}
        <div className="clientesSearchBlock">
          <label className="clientesLabel">Buscar cliente</label>
          <input
            className="clientesInput"
            type="text"
            placeholder="Nombre / Tel / Correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* ===== Tabla ===== */}
        <div className="clientesTablaScroll">
          <table className="clientesTabla">
            <thead>
              <tr className="clientesHeadRow">
                <th className="clientesTh">ID</th>
                <th className="clientesTh">Nombre</th>
                <th className="clientesTh">Teléfono</th>
                <th className="clientesTh">Correo</th>
                <th className="clientesTh">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 && (
                <tr className="clientesBodyRow">
                  <td
                    className="clientesTd"
                    colSpan={5}
                    style={{ textAlign: "center", color: "#aaa" }}
                  >
                    Sin resultados
                  </td>
                </tr>
              )}

              {clientes.map((cliente) => (
                <tr key={cliente.id} className="clientesBodyRow">
                  <td className="clientesTd">{cliente.id}</td>
                  <td className="clientesTd">{cliente.nombre}</td>
                  <td className="clientesTd">
                    {cliente.telefono || "—"}
                  </td>
                  <td className="clientesTd">
                    {cliente.correo || "—"}
                  </td>
                  <td className="clientesTd accionesCell">
                    <button
                      className="btnNegroChico"
                      onClick={() => startEdit(cliente)}
                    >
                      Editar
                    </button>

                    <button
                      className="btnRojoChico"
                      onClick={() => handleDelete(cliente.id)}
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