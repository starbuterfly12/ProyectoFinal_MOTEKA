# models/inventario.py
from datetime import datetime
from core.extensions import db
import enum

class EstadoHerramientaEnum(enum.Enum):
    OPERATIVA = "OPERATIVA"          # está bien
    EN_REPARACION = "EN_REPARACION"  # dañada / se está arreglando
    FUERA_DE_SERVICIO = "FUERA_DE_SERVICIO"  # rota / no se usa

class Herramienta(db.Model):
    __tablename__ = 'herramientas'

    id = db.Column(db.Integer, primary_key=True)

    nombre = db.Column(db.String(150), nullable=False)      # "Gato hidráulico 2T"
    descripcion = db.Column(db.Text)                        # notas largas
    cantidad = db.Column(db.Integer, nullable=False, default=1)

    estado = db.Column(db.Enum(EstadoHerramientaEnum), nullable=False,
                        default=EstadoHerramientaEnum.OPERATIVA)

    ubicacion = db.Column(db.String(150))   # "Bahía 2", "Caja roja pared norte"
    marca_modelo = db.Column(db.String(150))  # opcional: "Truper 1/2”", "Makita XYZ"

    creado_en = db.Column(db.DateTime, default=datetime.utcnow)
    actualizado_en = db.Column(db.DateTime,
                                default=datetime.utcnow,
                                onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "cantidad": self.cantidad,
            "estado": self.estado.value if self.estado else None,
            "ubicacion": self.ubicacion,
            "marca_modelo": self.marca_modelo,
            "creado_en": self.creado_en.isoformat() if self.creado_en else None,
            "actualizado_en": self.actualizado_en.isoformat() if self.actualizado_en else None,
        }