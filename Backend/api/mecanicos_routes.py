from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from core.auth import role_required
from models.personas import Empleado, Usuario
from models.catalogos import Rol  # necesitamos Rol para filtrar nombre de rol

mecanicos_bp = Blueprint('mecanicos', __name__, url_prefix='/api/mecanicos')


@mecanicos_bp.route('', methods=['GET'])
@jwt_required()
@role_required("gerente", "encargado", "mecanico")
def listar_mecanicos():
    """
    Devuelve la lista de empleados que tienen rol = 'mecanico'.
    Sirve para asignarlos a una orden.
    """

    data = (
        Empleado.query
        .join(Usuario, Usuario.empleado_id == Empleado.id)
        .join(Rol, Rol.id == Usuario.rol_id)
        .filter(Rol.nombre == "mecanico")
        .filter(Empleado.activo.is_(True))
        .all()
    )

    resp = [
        {
            "id": e.id,
            "nombre": e.nombre,
        }
        for e in data
    ]

    return jsonify(resp), 200