from datetime import datetime
from core.extensions import db

class MarcaMoto(db.Model):
    __tablename__ = 'marcas_moto'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), unique=True, nullable=False)
    creado_en = db.Column(db.DateTime, default=datetime.utcnow)
    actualizado_en = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    modelos = db.relationship('ModeloMoto', backref='marca', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'creado_en': self.creado_en.isoformat() if self.creado_en else None,
            'actualizado_en': self.actualizado_en.isoformat() if self.actualizado_en else None
        }


class ModeloMoto(db.Model):
    __tablename__ = 'modelos_moto'
    __table_args__ = (db.UniqueConstraint('marca_id', 'nombre', name='_marca_modelo_uc'),)
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    marca_id = db.Column(db.Integer, db.ForeignKey('marcas_moto.id'), nullable=False)
    creado_en = db.Column(db.DateTime, default=datetime.utcnow)
    actualizado_en = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    motocicletas = db.relationship('Motocicleta', backref='modelo', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'marca_id': self.marca_id,
            'marca': self.marca.to_dict() if self.marca else None,
            'creado_en': self.creado_en.isoformat() if self.creado_en else None,
            'actualizado_en': self.actualizado_en.isoformat() if self.actualizado_en else None
        }


class Rol(db.Model):
    __tablename__ = 'roles'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), unique=True, nullable=False)
    
    usuarios = db.relationship('Usuario', backref='rol', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre
        }
