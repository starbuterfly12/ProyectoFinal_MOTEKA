from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from core.extensions import db
from core.auth import role_required
from models.catalogos import Rol

roles_bp = Blueprint('roles', __name__, url_prefix='/api/roles')

@roles_bp.route('', methods=['GET'])
@jwt_required()
def get_roles():
    roles = Rol.query.order_by(Rol.nombre).all()
    return jsonify([r.to_dict() for r in roles]), 200


@roles_bp.route('', methods=['POST'])
@jwt_required()
@role_required('gerente')
def create_rol():
    data = request.get_json()
    
    if not data or not data.get('nombre'):
        return jsonify({"error": "El nombre es requerido"}), 400
    
    nombre = data['nombre'].strip()
    
    if Rol.query.filter_by(nombre=nombre).first():
        return jsonify({"error": f"Ya existe un rol con el nombre '{nombre}'"}), 409
    
    nuevo_rol = Rol(nombre=nombre)
    db.session.add(nuevo_rol)
    db.session.commit()
    
    return jsonify(nuevo_rol.to_dict()), 201


@roles_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@role_required('gerente')
def delete_rol(id):
    rol = Rol.query.get(id)
    if not rol:
        return jsonify({"error": "Rol no encontrado"}), 404
    
    if rol.usuarios:
        return jsonify({"error": "No puede eliminar el rol porque tiene usuarios asociados"}), 409
    
    db.session.delete(rol)
    db.session.commit()
    
    return jsonify({"mensaje": "Rol eliminado exitosamente"}), 200
