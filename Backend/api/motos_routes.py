from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from core.extensions import db
from core.auth import role_required
from models.vehiculos import Motocicleta
from models.personas import Cliente
from models.catalogos import ModeloMoto, MarcaMoto
from datetime import datetime

motos_bp = Blueprint('motos', __name__, url_prefix='/api/motocicletas')

@motos_bp.route('', methods=['GET'])
@jwt_required()
def get_motocicletas():
    cliente_id = request.args.get('cliente_id', type=int)
    cliente_nombre = request.args.get('cliente_nombre', '').strip()
    modelo_id = request.args.get('modelo_id', type=int)
    marca_id = request.args.get('marca_id', type=int)
    placa = request.args.get('placa', '').strip()
    vin = request.args.get('vin', '').strip()
    q = request.args.get('q', '').strip()
    
    query = Motocicleta.query.join(Cliente).outerjoin(ModeloMoto).outerjoin(MarcaMoto)
    
    if cliente_id:
        query = query.filter(Motocicleta.cliente_id == cliente_id)
    
    if cliente_nombre:
        query = query.filter(Cliente.nombre.ilike(f'%{cliente_nombre}%'))
    
    if modelo_id:
        query = query.filter(Motocicleta.modelo_id == modelo_id)
    
    if marca_id:
        query = query.filter(ModeloMoto.marca_id == marca_id)
    
    if placa:
        query = query.filter(Motocicleta.placa.ilike(f'%{placa}%'))
    
    if vin:
        query = query.filter(Motocicleta.vin.ilike(f'%{vin}%'))
    
    if q:
        query = query.filter(
            db.or_(
                Motocicleta.placa.ilike(f'%{q}%'),
                Motocicleta.vin.ilike(f'%{q}%'),
                Motocicleta.color.ilike(f'%{q}%')
            )
        )
    
    motocicletas = query.order_by(Motocicleta.creado_en.desc()).all()
    return jsonify([m.to_dict(include_relations=True) for m in motocicletas]), 200


@motos_bp.route('', methods=['POST'])
@jwt_required()
@role_required('gerente', 'encargado')
def create_motocicleta():
    data = request.get_json()
    
    if not data or not data.get('cliente_id'):
        return jsonify({"error": "cliente_id es requerido"}), 400
    
    cliente = Cliente.query.get(data['cliente_id'])
    if not cliente:
        return jsonify({"error": "El cliente especificado no existe"}), 404
    
    if data.get('modelo_id'):
        modelo = ModeloMoto.query.get(data['modelo_id'])
        if not modelo:
            return jsonify({"error": "El modelo especificado no existe"}), 404
    
    if data.get('placa'):
        if Motocicleta.query.filter_by(placa=data['placa']).first():
            return jsonify({"error": f"Ya existe una motocicleta con la placa '{data['placa']}'"}), 409
    
    if data.get('vin'):
        if Motocicleta.query.filter_by(vin=data['vin']).first():
            return jsonify({"error": f"Ya existe una motocicleta con el VIN '{data['vin']}'"}), 409
    
    nueva_moto = Motocicleta(
        cliente_id=data['cliente_id'],
        modelo_id=data.get('modelo_id'),
        placa=data.get('placa'),
        vin=data.get('vin'),
        anio=data.get('anio'),
        cilindraje_cc=data.get('cilindraje_cc'),
        color=data.get('color'),
        kilometraje_km=data.get('kilometraje_km', 0),
        notas=data.get('notas')
    )
    
    if data.get('ultima_revision'):
        try:
            nueva_moto.ultima_revision = datetime.fromisoformat(data['ultima_revision'].replace('Z', '+00:00')).date()
        except:
            pass
    
    db.session.add(nueva_moto)
    db.session.commit()
    
    return jsonify(nueva_moto.to_dict(include_relations=True)), 201


@motos_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
@role_required('gerente', 'encargado')
def update_motocicleta(id):
    moto = Motocicleta.query.get(id)
    if not moto:
        return jsonify({"error": "Motocicleta no encontrada"}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "Datos inválidos"}), 400
    
    if data.get('cliente_id') and data['cliente_id'] != moto.cliente_id:
        return jsonify({"error": "No puede cambiar el cliente de una motocicleta"}), 400
    
    if data.get('modelo_id'):
        modelo = ModeloMoto.query.get(data['modelo_id'])
        if not modelo:
            return jsonify({"error": "El modelo especificado no existe"}), 404
        moto.modelo_id = data['modelo_id']
    
    if data.get('placa'):
        moto_existente = Motocicleta.query.filter_by(placa=data['placa']).first()
        if moto_existente and moto_existente.id != id:
            return jsonify({"error": f"Ya existe una motocicleta con la placa '{data['placa']}'"}), 409
        moto.placa = data['placa']
    
    if data.get('vin'):
        moto_existente = Motocicleta.query.filter_by(vin=data['vin']).first()
        if moto_existente and moto_existente.id != id:
            return jsonify({"error": f"Ya existe una motocicleta con el VIN '{data['vin']}'"}), 409
        moto.vin = data['vin']
    
    if 'anio' in data:
        moto.anio = data['anio']
    if 'cilindraje_cc' in data:
        moto.cilindraje_cc = data['cilindraje_cc']
    if 'color' in data:
        moto.color = data['color']
    if 'kilometraje_km' in data:
        moto.kilometraje_km = data['kilometraje_km']
    if 'notas' in data:
        moto.notas = data['notas']
    
    if 'ultima_revision' in data and data['ultima_revision']:
        try:
            moto.ultima_revision = datetime.fromisoformat(data['ultima_revision'].replace('Z', '+00:00')).date()
        except:
            pass
    
    db.session.commit()
    
    return jsonify(moto.to_dict(include_relations=True)), 200


@motos_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@role_required('gerente', 'encargado')
def delete_motocicleta(id):
    moto = Motocicleta.query.get(id)
    if not moto:
        return jsonify({"error": "Motocicleta no encontrada"}), 404
    
    if moto.ordenes:
        return jsonify({"error": "No puede eliminar la motocicleta porque tiene órdenes de trabajo asociadas"}), 409
    
    db.session.delete(moto)
    db.session.commit()
    
    return jsonify({"mensaje": "Motocicleta eliminada exitosamente"}), 200
