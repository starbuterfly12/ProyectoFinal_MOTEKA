from datetime import datetime
from core.extensions import db

class ReporteTrabajo(db.Model):
    __tablename__ = 'reportes_trabajo'

    id = db.Column(db.Integer, primary_key=True)

    # a qué orden pertenece este reporte
    orden_id = db.Column(db.Integer, db.ForeignKey('ordenes_trabajo.id'), nullable=False)

    # quién (empleado) hizo el trabajo técnico
    mecanico_id = db.Column(db.Integer, db.ForeignKey('empleados.id'), nullable=False)

    # descripción técnica del trabajo realizado
    descripcion = db.Column(db.Text, nullable=False)

    # snapshots (guardamos texto plano en el momento)
    cliente_nombre = db.Column(db.String(200))
    moto_placa = db.Column(db.String(100))
    moto_vin = db.Column(db.String(100))
    marca_nombre = db.Column(db.String(150))
    modelo_nombre = db.Column(db.String(150))
    mecanico_nombre = db.Column(db.String(200))

    creado_en = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "orden_id": self.orden_id,
            "mecanico_id": self.mecanico_id,
            "mecanico_nombre": self.mecanico_nombre,
            "descripcion": self.descripcion,
            "cliente_nombre": self.cliente_nombre,
            "moto_placa": self.moto_placa,
            "moto_vin": self.moto_vin,
            "marca_nombre": self.marca_nombre,
            "modelo_nombre": self.modelo_nombre,
            "creado_en": self.creado_en.isoformat() if self.creado_en else None,
        }