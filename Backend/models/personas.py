from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from core.extensions import db

class Cliente(db.Model):
    __tablename__ = 'clientes'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(200), nullable=False)
    telefono = db.Column(db.String(50))
    correo = db.Column(db.String(150), unique=True, nullable=True)
    direccion = db.Column(db.Text)
    creado_en = db.Column(db.DateTime, default=datetime.utcnow)
    actualizado_en = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    motocicletas = db.relationship('Motocicleta', backref='cliente', lazy=True)
    ordenes = db.relationship('OrdenTrabajo', backref='cliente', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'telefono': self.telefono,
            'correo': self.correo,
            'direccion': self.direccion,
            'creado_en': self.creado_en.isoformat() if self.creado_en else None,
            'actualizado_en': self.actualizado_en.isoformat() if self.actualizado_en else None
        }


class Empleado(db.Model):
    __tablename__ = 'empleados'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(200), nullable=False)
    activo = db.Column(db.Boolean, default=True)
    creado_en = db.Column(db.DateTime, default=datetime.utcnow)
    actualizado_en = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    usuarios = db.relationship('Usuario', backref='empleado', lazy=True)
    ordenes_asignadas = db.relationship('OrdenTrabajo', backref='mecanico_asignado', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'activo': self.activo,
            'creado_en': self.creado_en.isoformat() if self.creado_en else None,
            'actualizado_en': self.actualizado_en.isoformat() if self.actualizado_en else None
        }


class Usuario(db.Model):
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    usuario = db.Column(db.String(100), unique=True, nullable=False)
    correo = db.Column(db.String(150), unique=True, nullable=True)
    contrasena_hash = db.Column(db.String(255), nullable=False)
    rol_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    empleado_id = db.Column(db.Integer, db.ForeignKey('empleados.id'), nullable=True)
    creado_en = db.Column(db.DateTime, default=datetime.utcnow)
    actualizado_en = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def set_password(self, password):
        self.contrasena_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.contrasena_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'usuario': self.usuario,
            'correo': self.correo,
            'rol': self.rol.to_dict() if self.rol else None,
            'empleado': self.empleado.to_dict() if self.empleado else None,
            'creado_en': self.creado_en.isoformat() if self.creado_en else None,
            'actualizado_en': self.actualizado_en.isoformat() if self.actualizado_en else None
        }
