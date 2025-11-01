from datetime import datetime
from core.extensions import db

class Motocicleta(db.Model):
    __tablename__ = 'motocicletas'
    
    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=False)
    modelo_id = db.Column(db.Integer, db.ForeignKey('modelos_moto.id'), nullable=True)
    placa = db.Column(db.String(50), unique=True, nullable=True)
    vin = db.Column(db.String(100), unique=True, nullable=True)
    anio = db.Column(db.Integer)
    cilindraje_cc = db.Column(db.Integer)
    color = db.Column(db.String(50))
    kilometraje_km = db.Column(db.Integer, default=0)
    ultima_revision = db.Column(db.Date, nullable=True)
    notas = db.Column(db.Text)
    creado_en = db.Column(db.DateTime, default=datetime.utcnow)
    actualizado_en = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    ordenes = db.relationship('OrdenTrabajo', backref='motocicleta', lazy=True)
    
    def to_dict(self, include_relations=True):
        data = {
            'id': self.id,
            'cliente_id': self.cliente_id,
            'modelo_id': self.modelo_id,
            'placa': self.placa,
            'vin': self.vin,
            'anio': self.anio,
            'cilindraje_cc': self.cilindraje_cc,
            'color': self.color,
            'kilometraje_km': self.kilometraje_km,
            'ultima_revision': self.ultima_revision.isoformat() if self.ultima_revision else None,
            'notas': self.notas,
            'creado_en': self.creado_en.isoformat() if self.creado_en else None,
            'actualizado_en': self.actualizado_en.isoformat() if self.actualizado_en else None
        }
        
        if include_relations:
            data['cliente'] = self.cliente.to_dict() if self.cliente else None
            data['modelo'] = self.modelo.to_dict() if self.modelo else None
            if self.modelo and self.modelo.marca:
                data['marca'] = self.modelo.marca.to_dict()
            else:
                data['marca'] = None
        
        return data
