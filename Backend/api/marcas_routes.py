from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from core.extensions import db
from core.auth import role_required
from models.catalogos import MarcaMoto

marcas_bp = Blueprint('marcas', __name__, url_prefix='/api/marcas')

@marcas_bp.route('', methods=['GET'])
@jwt_required()
def get_marcas():
    q = request.args.get('q', '').strip()
    
    query = MarcaMoto.query
    
    if q:
        query = query.filter(MarcaMoto.nombre.ilike(f'%{q}%'))
    
    marcas = query.order_by(MarcaMoto.nombre).all()
    return jsonify([m.to_dict() for m in marcas]), 200


@marcas_bp.route('', methods=['POST'])
@jwt_required()
@role_required('gerente', 'encargado')
def create_marca():
    data = request.get_json()
    
    if not data or not data.get('nombre'):
        return jsonify({"error": "El nombre es requerido"}), 400
    
    nombre = data['nombre'].strip()
    
    if MarcaMoto.query.filter_by(nombre=nombre).first():
        return jsonify({"error": f"Ya existe una marca con el nombre '{nombre}'"}), 409
    
    nueva_marca = MarcaMoto(nombre=nombre)
    db.session.add(nueva_marca)
    db.session.commit()
    
    return jsonify(nueva_marca.to_dict()), 201


@marcas_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
@role_required('gerente', 'encargado')
def update_marca(id):
    marca = MarcaMoto.query.get(id)
    if not marca:
        return jsonify({"error": "Marca no encontrada"}), 404
    
    data = request.get_json()
    if not data or not data.get('nombre'):
        return jsonify({"error": "El nombre es requerido"}), 400
    
    nombre = data['nombre'].strip()
    
    marca_existente = MarcaMoto.query.filter_by(nombre=nombre).first()
    if marca_existente and marca_existente.id != id:
        return jsonify({"error": f"Ya existe una marca con el nombre '{nombre}'"}), 409
    
    marca.nombre = nombre
    db.session.commit()
    
    return jsonify(marca.to_dict()), 200


@marcas_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@role_required('gerente', 'encargado')
def delete_marca(id):
    marca = MarcaMoto.query.get(id)
    if not marca:
        return jsonify({"error": "Marca no encontrada"}), 404
    
    if marca.modelos:
        return jsonify({"error": "No puede eliminar la marca porque tiene modelos asociados"}), 409
    
    db.session.delete(marca)
    db.session.commit()
    
    return jsonify({"mensaje": "Marca eliminada exitosamente"}), 200
