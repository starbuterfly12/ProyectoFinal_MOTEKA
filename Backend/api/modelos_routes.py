from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from core.extensions import db
from core.auth import role_required
from models.catalogos import ModeloMoto, MarcaMoto

modelos_bp = Blueprint('modelos', __name__, url_prefix='/api/modelos')

@modelos_bp.route('', methods=['GET'])
@jwt_required()
def get_modelos():
    marca_id = request.args.get('marca_id', type=int)
    q = request.args.get('q', '').strip()
    
    query = ModeloMoto.query
    
    if marca_id:
        query = query.filter_by(marca_id=marca_id)
    
    if q:
        query = query.filter(ModeloMoto.nombre.ilike(f'%{q}%'))
    
    modelos = query.order_by(ModeloMoto.nombre).all()
    return jsonify([m.to_dict() for m in modelos]), 200


@modelos_bp.route('', methods=['POST'])
@jwt_required()
@role_required('gerente', 'encargado')
def create_modelo():
    data = request.get_json()
    
    if not data or not data.get('nombre') or not data.get('marca_id'):
        return jsonify({"error": "nombre y marca_id son requeridos"}), 400
    
    nombre = data['nombre'].strip()
    marca_id = data['marca_id']
    
    marca = MarcaMoto.query.get(marca_id)
    if not marca:
        return jsonify({"error": "La marca especificada no existe"}), 404
    
    modelo_existente = ModeloMoto.query.filter_by(marca_id=marca_id, nombre=nombre).first()
    if modelo_existente:
        return jsonify({"error": f"Ya existe un modelo '{nombre}' para la marca '{marca.nombre}'"}), 409
    
    nuevo_modelo = ModeloMoto(nombre=nombre, marca_id=marca_id)
    db.session.add(nuevo_modelo)
    db.session.commit()
    
    return jsonify(nuevo_modelo.to_dict()), 201


@modelos_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
@role_required('gerente', 'encargado')
def update_modelo(id):
    modelo = ModeloMoto.query.get(id)
    if not modelo:
        return jsonify({"error": "Modelo no encontrado"}), 404
    
    data = request.get_json()
    if not data or not data.get('nombre') or not data.get('marca_id'):
        return jsonify({"error": "nombre y marca_id son requeridos"}), 400
    
    nombre = data['nombre'].strip()
    marca_id = data['marca_id']
    
    marca = MarcaMoto.query.get(marca_id)
    if not marca:
        return jsonify({"error": "La marca especificada no existe"}), 404
    
    modelo_existente = ModeloMoto.query.filter_by(marca_id=marca_id, nombre=nombre).first()
    if modelo_existente and modelo_existente.id != id:
        return jsonify({"error": f"Ya existe un modelo '{nombre}' para la marca '{marca.nombre}'"}), 409
    
    modelo.nombre = nombre
    modelo.marca_id = marca_id
    db.session.commit()
    
    return jsonify(modelo.to_dict()), 200


@modelos_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@role_required('gerente', 'encargado')
def delete_modelo(id):
    modelo = ModeloMoto.query.get(id)
    if not modelo:
        return jsonify({"error": "Modelo no encontrado"}), 404
    
    if modelo.motocicletas:
        return jsonify({"error": "No puede eliminar el modelo porque tiene motocicletas asociadas"}), 409
    
    db.session.delete(modelo)
    db.session.commit()
    
    return jsonify({"mensaje": "Modelo eliminado exitosamente"}), 200
