from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt, verify_jwt_in_request
from core.extensions import db
from models.personas import Usuario
from models.catalogos import Rol
import json

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('usuario') or not data.get('contrasena'):
        return jsonify({"error": "Usuario y contraseña son requeridos"}), 400
    
    if not data.get('rol_id'):
        return jsonify({"error": "rol_id es requerido"}), 400
    
    if Usuario.query.filter_by(usuario=data['usuario']).first():
        return jsonify({"error": f"El usuario '{data['usuario']}' ya existe"}), 409
    
    if data.get('correo'):
        if Usuario.query.filter_by(correo=data['correo']).first():
            return jsonify({"error": f"El correo '{data['correo']}' ya está registrado"}), 409
    
    rol = Rol.query.get(data['rol_id'])
    if not rol:
        return jsonify({"error": "El rol especificado no existe"}), 404
    
    usuario_count = Usuario.query.count()
    if usuario_count > 0:
        verify_jwt_in_request()
        claims = get_jwt()
        user_data = claims.get('user')
        if user_data and user_data.get('rol') != 'gerente':
            return jsonify({"error": "Solo los gerentes pueden registrar nuevos usuarios"}), 403
    
    nuevo_usuario = Usuario(
        usuario=data['usuario'],
        correo=data.get('correo'),
        rol_id=data['rol_id'],
        empleado_id=data.get('empleado_id')
    )
    nuevo_usuario.set_password(data['contrasena'])
    
    db.session.add(nuevo_usuario)
    db.session.commit()
    
    return jsonify({"mensaje": "Usuario creado exitosamente", "usuario": nuevo_usuario.to_dict()}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('usuario') or not data.get('contrasena'):
        return jsonify({"error": "Usuario y contraseña son requeridos"}), 400
    
    usuario = Usuario.query.filter_by(usuario=data['usuario']).first()
    
    if not usuario or not usuario.check_password(data['contrasena']):
        return jsonify({"error": "Credenciales inválidas"}), 401
    
    user_data = {
        'id': usuario.id,
        'usuario': usuario.usuario,
        'rol': usuario.rol.nombre if usuario.rol else None,
        'rol_id': usuario.rol_id
    }
    
    additional_claims = {"user": user_data}
    access_token = create_access_token(identity=str(usuario.id), additional_claims=additional_claims)
    
    return jsonify({
        "access_token": access_token,
        "user": user_data
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    claims = get_jwt()
    user_data = claims.get('user')
    
    if not user_data:
        return jsonify({"error": "No se pudo obtener la información del usuario"}), 401
    
    usuario = Usuario.query.get(user_data.get('id'))
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    return jsonify(usuario.to_dict()), 200


@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({"mensaje": "Sesión cerrada exitosamente"}), 200
