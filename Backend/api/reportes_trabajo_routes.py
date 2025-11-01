from flask import Blueprint, request, jsonify, Response
from flask_jwt_extended import jwt_required, get_jwt
from core.extensions import db
from core.auth import role_required

from models.ordenes import OrdenTrabajo
from models.personas import Usuario, Empleado
from models.reportes import ReporteTrabajo

reportes_trabajo_bp = Blueprint('reportes_trabajo', __name__, url_prefix='/api/reportes_trabajo')


def _get_current_user_and_employee():
    """
    Lee el JWT y regresa:
    - usuario (row de Usuario)
    - empleado_id vinculado (si existe)
    - rol string ('mecanico', 'gerente', etc.)
    """
    claims = get_jwt()
    data_user = claims.get("user") or {}
    user_id = data_user.get("id")
    rol = data_user.get("rol")

    if not user_id:
        return None, None, None

    usuario = Usuario.query.get(user_id)
    if not usuario:
        return None, None, None

    return usuario, usuario.empleado_id, rol


@reportes_trabajo_bp.route('', methods=['POST'])
@jwt_required()
@role_required("mecanico", "gerente", "encargado")
def crear_reporte_trabajo():
    """
    Crea un reporte técnico de una orden.
    Body JSON:
    {
        "orden_id": 123,
        "descripcion": "Se cambió el kit de frenos..."
    }

    Reglas:
    - mecánico solo puede crear reporte si esa orden le pertenece (él es el mecanico_asignado).
    - gerente / encargado pueden crear, PERO se guarda igual con el mecánico asignado a la orden.
    """

    data = request.get_json() or {}
    orden_id = data.get("orden_id")
    descripcion = (data.get("descripcion") or "").strip()

    if not orden_id or not descripcion:
        return jsonify({"error": "orden_id y descripcion son requeridos"}), 400

    usuario, empleado_id, rol = _get_current_user_and_employee()
    if not usuario:
        return jsonify({"error": "No se pudo identificar al usuario actual"}), 401

    orden = OrdenTrabajo.query.get(orden_id)
    if not orden:
        return jsonify({"error": f"La orden {orden_id} no existe"}), 404

    # Determinar mecánico que se va a guardar en este reporte
    mecanico_final_id = None
    mecanico_final_nombre = None

    if rol == "mecanico":
        # El mecánico SOLO puede reportar su propia orden
        if not empleado_id or orden.mecanico_asignado_id != empleado_id:
            return jsonify({"error": "No puede reportar una orden que no le fue asignada"}), 403

        mecanico_final_id = empleado_id
        mec_row = Empleado.query.get(empleado_id)
        mecanico_final_nombre = mec_row.nombre if mec_row else None

    else:
        # gerente / encargado
        if not orden.mecanico_asignado_id:
            return jsonify({
                "error": "La orden no tiene un mecánico asignado aún, no se puede crear reporte técnico"
            }), 400

        mecanico_final_id = orden.mecanico_asignado_id
        mec_row = Empleado.query.get(orden.mecanico_asignado_id)
        mecanico_final_nombre = mec_row.nombre if mec_row else None

    # snapshot de datos importantes del momento
    cliente_nombre = orden.cliente.nombre if getattr(orden, "cliente", None) else None

    moto = getattr(orden, "motocicleta", None)
    moto_placa = moto.placa if moto else None
    moto_vin = moto.vin if moto else None

    modelo_nombre = None
    marca_nombre = None
    if moto and getattr(moto, "modelo", None):
        modelo_nombre = moto.modelo.nombre
        if getattr(moto.modelo, "marca", None):
            marca_nombre = moto.modelo.marca.nombre

    nuevo_rep = ReporteTrabajo(
        orden_id=orden.id,
        mecanico_id=mecanico_final_id,
        descripcion=descripcion,
        cliente_nombre=cliente_nombre,
        moto_placa=moto_placa,
        moto_vin=moto_vin,
        marca_nombre=marca_nombre,
        modelo_nombre=modelo_nombre,
        mecanico_nombre=mecanico_final_nombre,
    )

    try:
        db.session.add(nuevo_rep)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "No se pudo guardar el reporte", "detalle": str(e)}), 500

    return jsonify({"mensaje": "Reporte guardado", "reporte": nuevo_rep.to_dict()}), 201


@reportes_trabajo_bp.route('', methods=['GET'])
@jwt_required()
@role_required("mecanico", "gerente", "encargado")
def listar_reportes_trabajo():
    """
    Lista reportes técnicos de una orden específica.
    ?orden_id=123

    Reglas:
    - mecánico solo ve SUS reportes
    - gerente / encargado ven todos
    """

    orden_id = request.args.get("orden_id", type=int)
    if not orden_id:
        return jsonify({"error": "orden_id es requerido"}), 400

    usuario, empleado_id, rol = _get_current_user_and_employee()
    if not usuario:
        return jsonify({"error": "No se pudo identificar al usuario actual"}), 401

    q = ReporteTrabajo.query.filter(ReporteTrabajo.orden_id == orden_id)

    if rol == "mecanico":
        if not empleado_id:
            return jsonify({"error": "No tiene empleado vinculado"}), 403
        q = q.filter(ReporteTrabajo.mecanico_id == empleado_id)

    q = q.order_by(ReporteTrabajo.creado_en.asc())
    data = [r.to_dict() for r in q.all()]

    return jsonify(data), 200


@reportes_trabajo_bp.route('/export', methods=['GET'])
@jwt_required()
@role_required("mecanico", "gerente", "encargado")
def exportar_reportes_csv():
    """
    Descarga CSV de reportes técnicos.
    Opcional:
    ?mecanico_id=7   -> solo ese mecánico
    Si no se manda mecanico_id -> todos.

    Reglas:
    - mecánico: solo puede exportar SUS reportes (ignoramos mecanico_id si manda otro)
    - gerente/encargado: puede exportar cualquiera o todos
    """

    mecanico_id = request.args.get("mecanico_id", type=int)

    usuario, empleado_id, rol = _get_current_user_and_employee()
    if not usuario:
        return jsonify({"error": "No se pudo identificar al usuario actual"}), 401

    q = ReporteTrabajo.query

    if rol == "mecanico":
        # forza a su propio id, ignore lo que pida
        if not empleado_id:
            return jsonify({"error": "No tiene empleado vinculado"}), 403
        q = q.filter(ReporteTrabajo.mecanico_id == empleado_id)
    else:
        # gerente / encargado
        if mecanico_id:
            q = q.filter(ReporteTrabajo.mecanico_id == mecanico_id)

    q = q.order_by(ReporteTrabajo.creado_en.asc()).all()

    # armamos CSV manual
    rows = [
        "fecha_hora,mecanico,cliente,moto,descripcion,orden_id"
    ]
    for r in q:
        fecha_str = r.creado_en.isoformat() if r.creado_en else ""
        moto_txt = r.moto_placa or r.moto_vin or ""
        desc_txt = (r.descripcion or "").replace("\n", " ").replace("\r", " ").strip()

        line = f'"{fecha_str}","{r.mecanico_nombre or ""}","{r.cliente_nombre or ""}","{moto_txt}","{desc_txt}","{r.orden_id}"'
        rows.append(line)

    csv_data = "\n".join(rows)

    return Response(
        csv_data,
        mimetype='text/csv',
        headers={
            "Content-Disposition": "attachment; filename=reportes_trabajo.csv"
        }
    )