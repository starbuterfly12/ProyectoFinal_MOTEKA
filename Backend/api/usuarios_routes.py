from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from core.extensions import db
from core.auth import role_required
from models.personas import Usuario, Empleado
from models.catalogos import Rol
from sqlalchemy.exc import IntegrityError

usuarios_bp = Blueprint("usuarios", __name__, url_prefix="/api/usuarios")


def usuario_public_dict(u: Usuario):
    """Lo que vamos a mandar al front, sin contraseñas ni cosas raras."""
    return {
        "id": u.id,
        "usuario": u.usuario,
        "correo": u.correo,
        "rol": u.rol.nombre if u.rol else None,
        "empleado": u.empleado.to_dict() if u.empleado else None,
        "creado_en": u.creado_en.isoformat() if u.creado_en else None,
        "actualizado_en": u.actualizado_en.isoformat() if u.actualizado_en else None,
    }


@usuarios_bp.get("")
@jwt_required()
@role_required("gerente")
def listar_usuarios():
    """
    Lista usuarios existentes.
    Solo gerente puede ver esto por ahora.
    En el futuro si quieres, metemos paginación / búsqueda.
    """
    usuarios = (
        Usuario.query
        .outerjoin(Rol, Usuario.rol_id == Rol.id)
        .outerjoin(Empleado, Usuario.empleado_id == Empleado.id)
        .all()
    )

    return jsonify([usuario_public_dict(u) for u in usuarios]), 200


@usuarios_bp.post("")
@jwt_required()
@role_required("gerente")
def crear_usuario():
    """
    Crea un usuario nuevo.

    BODY JSON ESPERADO:
    {
        "usuario": "carlos",
        "correo": "carlos@moteka.com",          // opcional
        "contrasena": "123456",
        "rol": "mecanico" | "gerente" | "encargado",
        "nombre_empleado": "Carlos Pérez",      // requerido si rol = "mecanico"
        "empleado_id": 3                        // opcional. si ya existe el empleado
    }

    reglas:
    - usuario es obligatorio y único
    - contrasena es obligatoria
    - rol debe existir en tabla roles
    - si viene empleado_id, lo usamos.
    - sino, creamos Empleado automáticamente con nombre_empleado (activo=True)
    """
    data = request.get_json() or {}

    usuario_login = (data.get("usuario") or "").strip()
    contrasena    = (data.get("contrasena") or "").strip()
    rol_nombre    = (data.get("rol") or "").strip().lower()
    correo        = (data.get("correo") or "").strip() or None
    empleado_id   = data.get("empleado_id")
    nombre_emp    = (data.get("nombre_empleado") or "").strip()

    # Validaciones básicas
    if not usuario_login:
        return jsonify({"error": "El campo 'usuario' es requerido"}), 400
    if not contrasena:
        return jsonify({"error": "El campo 'contrasena' es requerido"}), 400
    if not rol_nombre:
        return jsonify({"error": "El campo 'rol' es requerido"}), 400

    # Buscar rol
    rol_obj = Rol.query.filter(Rol.nombre == rol_nombre).first()
    if not rol_obj:
        return jsonify({"error": f"El rol '{rol_nombre}' no existe"}), 400

    # Resolver empleado
    empleado_row = None
    if empleado_id:
        empleado_row = Empleado.query.get(empleado_id)
        if not empleado_row:
            return jsonify({"error": f"No existe empleado con id {empleado_id}"}), 404
        if empleado_row.activo is False:
            return jsonify({"error": "El empleado está inactivo"}), 400
    else:
        # si no mandaron empleado_id, creamos uno nuevo
        # pero necesitamos al menos un nombre_empleado
        if not nombre_emp:
            return jsonify({"error": "Debe proporcionar 'nombre_empleado' o 'empleado_id'"}), 400
        
        empleado_row = Empleado(
            nombre=nombre_emp,
            activo=True
        )
        db.session.add(empleado_row)
        db.session.flush()  # para obtener empleado_row.id

    # Crear el usuario
    nuevo = Usuario(
        usuario=usuario_login,
        correo=correo,
        rol_id=rol_obj.id,
        empleado_id=empleado_row.id if empleado_row else None
    )
    nuevo.set_password(contrasena)

    db.session.add(nuevo)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "El usuario o correo ya está en uso"}), 409

    return jsonify({
        "mensaje": "Usuario creado exitosamente",
        "usuario": usuario_public_dict(nuevo)
    }), 201
