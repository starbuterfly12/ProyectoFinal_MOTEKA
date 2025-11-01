from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy import func
from datetime import datetime, date

from core.extensions import db
from core.auth import role_required
from models.ordenes import OrdenTrabajo, EstadoOrdenEnum, Pago
from models.personas import Cliente, Empleado
from models.vehiculos import Motocicleta

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

def hoy_rango():
    """Devuelve (inicio_hoy, fin_hoy) en UTC naive para filtrar por fecha de hoy."""
    inicio = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    fin = datetime.utcnow().replace(hour=23, minute=59, second=59, microsecond=999999)
    return inicio, fin

@dashboard_bp.route('/resumen', methods=['GET'])
@jwt_required()
def get_resumen_dashboard():
    """
    Devuelve el resumen que el frontend necesita para el home.
    Nada fancy, puro taller.
    """

    inicio_hoy, fin_hoy = hoy_rango()

    # === 1) resumen de estados de hoy ===
    # Órdenes creadas hoy
    q_hoy = (
        OrdenTrabajo.query
        .filter(OrdenTrabajo.fecha_ingreso >= inicio_hoy)
        .filter(OrdenTrabajo.fecha_ingreso <= fin_hoy)
    )

    total_hoy = q_hoy.count()
    en_espera_hoy = q_hoy.filter(OrdenTrabajo.estado == EstadoOrdenEnum.EN_ESPERA).count()
    en_reparacion_hoy = q_hoy.filter(OrdenTrabajo.estado == EstadoOrdenEnum.EN_REPARACION).count()
    finalizadas_hoy = q_hoy.filter(OrdenTrabajo.estado == EstadoOrdenEnum.FINALIZADA).count()
    canceladas_hoy = q_hoy.filter(OrdenTrabajo.estado == EstadoOrdenEnum.CANCELADA).count()

    resumen_hoy = {
        "total": total_hoy,
        "en_espera": en_espera_hoy,
        "en_reparacion": en_reparacion_hoy,
        "finalizadas": finalizadas_hoy,
        "canceladas": canceladas_hoy
    }

    # === 2) clientes activos ===
    # clientes que tienen al menos 1 motocicleta registrada
    clientes_activos = (
        db.session.query(func.count(func.distinct(Cliente.id)))
        .join(Motocicleta, Motocicleta.cliente_id == Cliente.id)
        .scalar()
    ) or 0

    # === 3) ingresos de HOY (pagos registrados hoy) ===
    ingresos_hoy_q = (
        db.session.query(func.coalesce(func.sum(Pago.monto), 0))
        .filter(Pago.pagado_en >= inicio_hoy)
        .filter(Pago.pagado_en <= fin_hoy)
        .scalar()
    )
    # ingresos_hoy_q sale como Decimal -> pasarlo a float
    if ingresos_hoy_q is None:
        ingresos_hoy_q = 0.0
    else:
        ingresos_hoy_q = float(ingresos_hoy_q)

    # === 4) mecánicos disponibles ===
    # total mecánicos
    # criterio simple: Empleado.cargo o rol_nombre ~ 'mecanico'
    # ajusta esto si tu modelo tiene otro campo
    mecanicos_total = (
        Empleado.query.filter(
            func.lower(Empleado.puesto).like('%mecan%')  # si tu tabla tiene 'puesto'
        ).count()
        if hasattr(Empleado, 'puesto') else
        Empleado.query.count()  # fallback bruto si no tenemos 'puesto'
    )

    # mecánicos ocupados = los que están asignados a una orden EN_REPARACION
    sub_ocupados = (
        db.session.query(OrdenTrabajo.mecanico_asignado_id)
        .filter(OrdenTrabajo.estado == EstadoOrdenEnum.EN_REPARACION)
        .filter(OrdenTrabajo.mecanico_asignado_id.isnot(None))
        .distinct()
        .all()
    )
    mecanicos_ocupados_ids = {row[0] for row in sub_ocupados}

    mecanicos_disponibles = 0
    if mecanicos_total > 0:
        # contamos empleados que NO estén en mecanicos_ocupados_ids
        if hasattr(Empleado, 'puesto'):
            disponibles_q = (
                Empleado.query
                .filter(func.lower(Empleado.puesto).like('%mecan%'))
                .filter(~Empleado.id.in_(mecanicos_ocupados_ids))  # NOT IN
            )
        else:
            disponibles_q = (
                Empleado.query
                .filter(~Empleado.id.in_(mecanicos_ocupados_ids))
            )
        mecanicos_disponibles = disponibles_q.count()

    # === 5) órdenes activas hoy (EN_ESPERA o EN_REPARACION HOY) ===
    ordenes_activas_q = (
        OrdenTrabajo.query
        .filter(OrdenTrabajo.fecha_ingreso >= inicio_hoy)
        .filter(OrdenTrabajo.fecha_ingreso <= fin_hoy)
        .filter(OrdenTrabajo.estado.in_([
            EstadoOrdenEnum.EN_ESPERA,
            EstadoOrdenEnum.EN_REPARACION
        ]))
        .order_by(OrdenTrabajo.fecha_ingreso.desc())
        .all()
    )

    ordenes_activas_hoy = []
    for o in ordenes_activas_q:
        cliente_nombre = getattr(o.cliente, 'nombre', None)
        moto_txt = None
        if getattr(o, "motocicleta", None):
            moto_txt = o.motocicleta.placa or o.motocicleta.vin
        mecanico_nombre = None
        if getattr(o, "mecanico_asignado", None):
            mecanico_nombre = o.mecanico_asignado.nombre
        ordenes_activas_hoy.append({
            "id": o.id,
            "estado": o.estado.value if o.estado else None,
            "cliente": cliente_nombre,
            "moto": moto_txt,
            "mecanico": mecanico_nombre,
            "fecha_ingreso": o.fecha_ingreso.isoformat() if o.fecha_ingreso else None
        })

    # === 6) actividad reciente (placeholder simple) ===
    actividad_reciente = []
    # Ejemplo: últimas 5 órdenes creadas (esto es meramente visual)
    ultimas_ordenes = (
        OrdenTrabajo.query
        .order_by(OrdenTrabajo.fecha_ingreso.desc())
        .limit(5)
        .all()
    )
    for o in ultimas_ordenes:
        actividad_reciente.append({
            "tipo": "nueva_orden" if o.estado == EstadoOrdenEnum.EN_ESPERA else "orden_update",
            "titulo": f"Orden #{o.id}",
            "detalle": f"{getattr(o.cliente,'nombre','(sin cliente)')} - {o.estado.value if o.estado else ''}",
            "hace": o.fecha_ingreso.strftime("%d/%m %H:%M") if o.fecha_ingreso else ""
        })

    resp = {
        "resumen_hoy": resumen_hoy,
        "clientes_activos": clientes_activos,
        "ingresos_hoy_q": ingresos_hoy_q,
        "mecanicos_disponibles": mecanicos_disponibles,
        "mecanicos_total": mecanicos_total,
        "ordenes_activas_hoy": ordenes_activas_hoy,
        "actividad_reciente": actividad_reciente
    }

    return jsonify(resp), 200