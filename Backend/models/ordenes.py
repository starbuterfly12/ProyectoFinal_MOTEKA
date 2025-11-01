from datetime import datetime
from core.extensions import db
import enum

class EstadoOrdenEnum(enum.Enum):
    EN_ESPERA = "EN_ESPERA"
    EN_REPARACION = "EN_REPARACION"
    FINALIZADA = "FINALIZADA"
    CANCELADA = "CANCELADA"

class TipoPagoEnum(enum.Enum):
    EFECTIVO = "EFECTIVO"
    TARJETA = "TARJETA"
    TRANSFERENCIA = "TRANSFERENCIA"


class OrdenTrabajo(db.Model):
    __tablename__ = 'ordenes_trabajo'
    
    id = db.Column(db.Integer, primary_key=True)

    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=False)
    motocicleta_id = db.Column(db.Integer, db.ForeignKey('motocicletas.id'), nullable=False)

    # empleado asignado como mecánico responsable
    mecanico_asignado_id = db.Column(db.Integer, db.ForeignKey('empleados.id'), nullable=True)

    estado = db.Column(db.Enum(EstadoOrdenEnum), nullable=False, default=EstadoOrdenEnum.EN_ESPERA)
    fecha_ingreso = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_salida = db.Column(db.DateTime, nullable=True)
    observaciones = db.Column(db.Text)
    creado_en = db.Column(db.DateTime, default=datetime.utcnow)
    actualizado_en = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    historial = db.relationship(
        'EstadoOrden',
        backref='orden',
        lazy=True,
        cascade='all, delete-orphan',
        order_by='EstadoOrden.creado_en'
    )

    pagos = db.relationship(
        'Pago',
        backref='orden',
        lazy=True,
        cascade='all, delete-orphan'
    )

    def to_dict(self, include_relations=True):
        data = {
            'id': self.id,
            'cliente_id': self.cliente_id,
            'motocicleta_id': self.motocicleta_id,
            'mecanico_asignado_id': self.mecanico_asignado_id,
            'estado': self.estado.value if self.estado else None,
            'fecha_ingreso': self.fecha_ingreso.isoformat() if self.fecha_ingreso else None,
            'fecha_salida': self.fecha_salida.isoformat() if self.fecha_salida else None,
            'observaciones': self.observaciones,
            'creado_en': self.creado_en.isoformat() if self.creado_en else None,
            'actualizado_en': self.actualizado_en.isoformat() if self.actualizado_en else None,

            # calidad de vida para UI
            'mecanico_asignado_nombre': (
                self.mecanico_asignado.nombre if getattr(self, "mecanico_asignado", None) else None
            )
        }

        if include_relations:
            data['cliente'] = self.cliente.to_dict() if getattr(self, "cliente", None) else None
            data['motocicleta'] = (
                self.motocicleta.to_dict(include_relations=True)
                if getattr(self, "motocicleta", None) else None
            )

        return data


class EstadoOrden(db.Model):
    __tablename__ = 'estados_orden'
    
    id = db.Column(db.Integer, primary_key=True)
    orden_id = db.Column(db.Integer, db.ForeignKey('ordenes_trabajo.id'), nullable=False)
    estado = db.Column(db.Enum(EstadoOrdenEnum), nullable=False)
    notas = db.Column(db.Text)
    creado_en = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'orden_id': self.orden_id,
            'estado': self.estado.value if self.estado else None,
            'notas': self.notas,
            'creado_en': self.creado_en.isoformat() if self.creado_en else None
        }


class Pago(db.Model):
    __tablename__ = 'pagos'
    
    id = db.Column(db.Integer, primary_key=True)
    orden_id = db.Column(db.Integer, db.ForeignKey('ordenes_trabajo.id'), nullable=False)
    tipo = db.Column(db.Enum(TipoPagoEnum), nullable=False)
    monto = db.Column(db.Numeric(12, 2), nullable=False)
    pagado_en = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'orden_id': self.orden_id,
            'tipo': self.tipo.value if self.tipo else None,
            'monto': float(self.monto) if self.monto else 0,
            'pagado_en': self.pagado_en.isoformat() if self.pagado_en else None
        }