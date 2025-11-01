from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from core.extensions import db
from core.auth import role_required

from models.inventario import Herramienta, EstadoHerramientaEnum

herramientas_bp = Blueprint('herramientas', __name__, url_prefix='/api/herramientas')


# LISTAR TODAS
@herramientas_bp.route('', methods=['GET'])
@jwt_required()
def listar_herramientas():
    """
    Todos los roles logueados pueden ver.
    Soporta filtros ?estado=OPERATIVA
    """
    estado = request.args.get('estado', '').strip()
    q = Herramienta.query

    if estado:
        try:
            estado_enum = EstadoHerramientaEnum[estado]
            q = q.filter(Herramienta.estado == estado_enum)
        except KeyError:
            pass  # si manda algo raro lo ignoramos

    q = q.order_by(Herramienta.nombre.asc())
    data = [h.to_dict() for h in q.all()]
    return jsonify(data), 200


# CREAR NUEVA
@herramientas_bp.route('', methods=['POST'])
@jwt_required()
@role_required('gerente', 'encargado')
def crear_herramienta():
    body = request.get_json() or {}

    nombre = (body.get('nombre') or '').strip()
    if not nombre:
        return jsonify({"error": "El nombre es requerido"}), 400

    cantidad = body.get('cantidad', 1)
    descripcion = body.get('descripcion', '')
    ubicacion = body.get('ubicacion', '')
    marca_modelo = body.get('marca_modelo', '')

    estado_str = body.get('estado', 'OPERATIVA')
    try:
        estado_enum = EstadoHerramientaEnum[estado_str]
    except KeyError:
        return jsonify({"error": "Estado inválido"}), 400

    nueva = Herramienta(
        nombre=nombre,
        descripcion=descripcion,
        cantidad=cantidad,
        estado=estado_enum,
        ubicacion=ubicacion,
        marca_modelo=marca_modelo,
    )

    db.session.add(nueva)
    db.session.commit()

    return jsonify(nueva.to_dict()), 201


# EDITAR
@herramientas_bp.route('/<int:herr_id>', methods=['PUT'])
@jwt_required()
@role_required('gerente', 'encargado')
def actualizar_herramienta(herr_id):
    h = Herramienta.query.get(herr_id)
    if not h:
        return jsonify({"error": "Herramienta no encontrada"}), 404

    body = request.get_json() or {}

    if 'nombre' in body:
        h.nombre = (body.get('nombre') or '').strip() or h.nombre

    if 'descripcion' in body:
        h.descripcion = body.get('descripcion')

    if 'cantidad' in body:
        h.cantidad = body.get('cantidad', h.cantidad)

    if 'ubicacion' in body:
        h.ubicacion = body.get('ubicacion')

    if 'marca_modelo' in body:
        h.marca_modelo = body.get('marca_modelo')

    if 'estado' in body:
        estado_str = body.get('estado')
        try:
            h.estado = EstadoHerramientaEnum[estado_str]
        except KeyError:
            return jsonify({"error": "Estado inválido"}), 400

    db.session.commit()
    return jsonify(h.to_dict()), 200


# ELIMINAR / DAR DE BAJA
@herramientas_bp.route('/<int:herr_id>', methods=['DELETE'])
@jwt_required()
@role_required('gerente', 'encargado')
def eliminar_herramienta(herr_id):
    h = Herramienta.query.get(herr_id)
    if not h:
        return jsonify({"error": "Herramienta no encontrada"}), 404

    db.session.delete(h)
    db.session.commit()
    return jsonify({"mensaje": "Herramienta eliminada"}), 200