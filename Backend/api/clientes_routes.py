from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from core.extensions import db
from core.auth import role_required
from models.personas import Cliente

clientes_bp = Blueprint('clientes', __name__, url_prefix='/api/clientes')

@clientes_bp.route('', methods=['GET'])
@jwt_required()
def get_clientes():
    q = request.args.get('q', '').strip()
    
    query = Cliente.query
    
    if q:
        query = query.filter(
            db.or_(
                Cliente.nombre.ilike(f'%{q}%'),
                Cliente.telefono.ilike(f'%{q}%'),
                Cliente.correo.ilike(f'%{q}%')
            )
        )
    
    clientes = query.order_by(Cliente.nombre).all()
    return jsonify([c.to_dict() for c in clientes]), 200


@clientes_bp.route('', methods=['POST'])
@jwt_required()
@role_required('gerente', 'encargado')
def create_cliente():
    data = request.get_json()
    
    if not data or not data.get('nombre'):
        return jsonify({"error": "El nombre es requerido"}), 400
    
    if data.get('correo'):
        if Cliente.query.filter_by(correo=data['correo']).first():
            return jsonify({"error": f"Ya existe un cliente con el correo '{data['correo']}'"}), 409
    
    nuevo_cliente = Cliente(
        nombre=data['nombre'],
        telefono=data.get('telefono'),
        correo=data.get('correo'),
        direccion=data.get('direccion')
    )
    
    db.session.add(nuevo_cliente)
    db.session.commit()
    
    return jsonify(nuevo_cliente.to_dict()), 201


@clientes_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
@role_required('gerente', 'encargado')
def update_cliente(id):
    cliente = Cliente.query.get(id)
    if not cliente:
        return jsonify({"error": "Cliente no encontrado"}), 404
    
    data = request.get_json()
    if not data or not data.get('nombre'):
        return jsonify({"error": "El nombre es requerido"}), 400
    
    if data.get('correo'):
        cliente_existente = Cliente.query.filter_by(correo=data['correo']).first()
        if cliente_existente and cliente_existente.id != id:
            return jsonify({"error": f"Ya existe un cliente con el correo '{data['correo']}'"}), 409
    
    cliente.nombre = data['nombre']
    cliente.telefono = data.get('telefono')
    cliente.correo = data.get('correo')
    cliente.direccion = data.get('direccion')
    
    db.session.commit()
    
    return jsonify(cliente.to_dict()), 200


@clientes_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@role_required('gerente', 'encargado')
def delete_cliente(id):
    cliente = Cliente.query.get(id)
    if not cliente:
        return jsonify({"error": "Cliente no encontrado"}), 404
    
    if cliente.motocicletas:
        return jsonify({"error": "No puede eliminar el cliente porque tiene motocicletas registradas"}), 409
    
    db.session.delete(cliente)
    db.session.commit()
    
    return jsonify({"mensaje": "Cliente eliminado exitosamente"}), 200
