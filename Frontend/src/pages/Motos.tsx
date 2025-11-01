import { useState, useEffect } from "react";
import api from "@/lib/api";
import "@/diseños CSS/motos.css";

export default function Motos() {
  const [motos, setMotos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [modelos, setModelos] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    cliente_id: "",
    modelo_id: "",
    placa: "",
    vin: "",
    anio: "",
    cilindraje_cc: "",
    color: "",
    kilometraje_km: "",
    ultima_revision: "",
    notas: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  // ======================
  // Fetch helpers
  // ======================

  const fetchMotos = async () => {
    const response = await api.get(`/api/motocicletas?q=${search}`);
    setMotos(response.data);
  };

  const fetchClientes = async () => {
    const response = await api.get("/api/clientes");
    setClientes(response.data);
  };

  const fetchModelos = async () => {
    const response = await api.get("/api/modelos");
    setModelos(response.data);
  };

  useEffect(() => {
    fetchClientes();
    fetchModelos();
  }, []);

  useEffect(() => {
    fetchMotos();
  }, [search]);

  // ======================
  // Crear / actualizar moto
  // ======================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        cliente_id: parseInt(formData.cliente_id),
        modelo_id: formData.modelo_id
          ? parseInt(formData.modelo_id)
          : null,
        anio: formData.anio ? parseInt(formData.anio) : null,
        cilindraje_cc: formData.cilindraje_cc
          ? parseInt(formData.cilindraje_cc)
          : null,
        kilometraje_km: formData.kilometraje_km
          ? parseInt(formData.kilometraje_km)
          : 0,
      };

      if (editingId) {
        await api.put(`/api/motocicletas/${editingId}`, data);
      } else {
        await api.post("/api/motocicletas", data);
      }

      resetForm();
      fetchMotos();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error");
    }
  };

  // ======================
  // Editar moto
  // ======================

  const startEdit = (moto: any) => {
    setEditingId(moto.id);
    setFormData({
      cliente_id: moto.cliente_id?.toString() || "",
      modelo_id: moto.modelo_id?.toString() || "",
      placa: moto.placa || "",
      vin: moto.vin || "",
      anio: moto.anio?.toString() || "",
      cilindraje_cc: moto.cilindraje_cc?.toString() || "",
      color: moto.color || "",
      kilometraje_km: moto.kilometraje_km?.toString() || "",
      ultima_revision: moto.ultima_revision || "",
      notas: moto.notas || "",
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      cliente_id: "",
      modelo_id: "",
      placa: "",
      vin: "",
      anio: "",
      cilindraje_cc: "",
      color: "",
      kilometraje_km: "",
      ultima_revision: "",
      notas: "",
    });
  };

  return (
    <div className="motosPageWrapper">
      <h1 className="motosTitulo">Motocicletas</h1>

      <section className="motosPanel">
        {/* ================= FORM ================= */}
        <form className="motosForm" onSubmit={handleSubmit}>
          {/* Cliente */}
          <div className="motosFieldGroup">
            <label className="motosLabel">Cliente *</label>
            <select
              className="motosInput"
              value={formData.cliente_id}
              required
              onChange={(e) =>
                setFormData({ ...formData, cliente_id: e.target.value })
              }
            >
              <option value="">Seleccione cliente</option>
              {clientes.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Modelo */}
          <div className="motosFieldGroup">
            <label className="motosLabel">Modelo (opcional)</label>
            <select
              className="motosInput"
              value={formData.modelo_id}
              onChange={(e) =>
                setFormData({ ...formData, modelo_id: e.target.value })
              }
            >
              <option value="">Seleccione modelo</option>
              {modelos.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.marca?.nombre} - {m.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Placa */}
          <div className="motosFieldGroup">
            <label className="motosLabel">Placa</label>
            <input
              className="motosInput"
              type="text"
              placeholder="P-123ABC"
              value={formData.placa}
              onChange={(e) =>
                setFormData({ ...formData, placa: e.target.value })
              }
            />
          </div>

          {/* VIN */}
          <div className="motosFieldGroup">
            <label className="motosLabel">VIN</label>
            <input
              className="motosInput"
              type="text"
              placeholder="Número de chasis"
              value={formData.vin}
              onChange={(e) =>
                setFormData({ ...formData, vin: e.target.value })
              }
            />
          </div>

          {/* Año */}
          <div className="motosFieldGroup">
            <label className="motosLabel">Año</label>
            <input
              className="motosInput"
              type="number"
              placeholder="2022"
              value={formData.anio}
              onChange={(e) =>
                setFormData({ ...formData, anio: e.target.value })
              }
            />
          </div>

          {/* Cilindraje */}
          <div className="motosFieldGroup">
            <label className="motosLabel">Cilindraje (cc)</label>
            <input
              className="motosInput"
              type="number"
              placeholder="150"
              value={formData.cilindraje_cc}
              onChange={(e) =>
                setFormData({ ...formData, cilindraje_cc: e.target.value })
              }
            />
          </div>

          {/* Color */}
          <div className="motosFieldGroup">
            <label className="motosLabel">Color</label>
            <input
              className="motosInput"
              type="text"
              placeholder="Rojo / Negro mate"
              value={formData.color}
              onChange={(e) =>
                setFormData({ ...formData, color: e.target.value })
              }
            />
          </div>

          {/* Kilometraje */}
          <div className="motosFieldGroup">
            <label className="motosLabel">Kilometraje (km)</label>
            <input
              className="motosInput"
              type="number"
              placeholder="34000"
              value={formData.kilometraje_km}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  kilometraje_km: e.target.value,
                })
              }
            />
          </div>

          {/* Última revisión */}
          <div className="motosFieldGroup">
            <label className="motosLabel">Última revisión</label>
            <input
              className="motosInput"
              type="date"
              value={formData.ultima_revision}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  ultima_revision: e.target.value,
                })
              }
            />
          </div>

          {/* Notas */}
          <div className="motosFieldGroup motosFieldSpan3">
            <label className="motosLabel">Notas</label>
            <textarea
              className="motosTextArea"
              placeholder="Observaciones generales de la moto..."
              value={formData.notas}
              onChange={(e) =>
                setFormData({ ...formData, notas: e.target.value })
              }
            />
          </div>

          {/* Botones */}
          <div className="motosButtonsRow motosFieldSpan3">
            <button type="submit" className="btnRojo">
              {editingId ? "Actualizar" : "Crear"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="btnGris"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* ================= BÚSQUEDA ================= */}
        <div className="motosSearchBlock">
          <label className="motosLabel">Buscar motocicleta</label>
          <input
            className="motosInput"
            type="text"
            placeholder="Placa / Cliente / Marca / Modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* ================= TABLA ================= */}
        <div className="motosTablaScroll">
          <table className="motosTabla">
            <thead>
              <tr className="motosHeadRow">
                <th className="motosTh">Placa</th>
                <th className="motosTh">Cliente</th>
                <th className="motosTh">Marca</th>
                <th className="motosTh">Modelo</th>
                <th className="motosTh">Año</th>
                <th className="motosTh">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {motos.length === 0 && (
                <tr className="motosBodyRow">
                  <td
                    className="motosTd"
                    colSpan={6}
                    style={{ textAlign: "center", color: "#aaa" }}
                  >
                    Sin resultados
                  </td>
                </tr>
              )}

              {motos.map((moto: any) => (
                <tr key={moto.id} className="motosBodyRow">
                  <td className="motosTd">{moto.placa || "N/A"}</td>
                  <td className="motosTd">
                    {moto.cliente?.nombre || "—"}
                  </td>
                  <td className="motosTd">
                    {moto.marca?.nombre || "N/A"}
                  </td>
                  <td className="motosTd">
                    {moto.modelo?.nombre || "N/A"}
                  </td>
                  <td className="motosTd">{moto.anio || "—"}</td>
                  <td className="motosTd accionesCell">
                    <button
                      className="btnNegroChico"
                      onClick={() => startEdit(moto)}
                    >
                      Editar
                    </button>
                    {/* Si luego querés borrar la moto, acá mismo va el botón rojo */}
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