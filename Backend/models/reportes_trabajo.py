#from datetime import datetime
#from core.extensions import db

#class ReporteTrabajo(db.Model):
 #   __tablename__ = 'reportes_trabajo'

 #   id = db.Column(db.Integer, primary_key=True)
 #   orden_id = db.Column(
 #       db.Integer,
 #       db.ForeignKey('ordenes_trabajo.id'),
 #       nullable=False
 #   )
  #  mecanico_id = db.Column(
 #       db.Integer,
  #      db.ForeignKey('empleados.id'),
 #       nullable=False
  #  )
 #   descripcion = db.Column(db.Text, nullable=False)
 #   creado_en = db.Column(db.DateTime, default=datetime.utcnow)

    # snapshot de contexto en el momento que se generó el reporte
 #   cliente_nombre = db.Column(db.String(200))        # NUEVO
 #   moto_placa = db.Column(db.String(50))             # NUEVO
 #   moto_vin = db.Column(db.String(100))              # NUEVO
  #  modelo_nombre = db.Column(db.String(100))         # NUEVO
 #   marca_nombre = db.Column(db.String(100))          # NUEVO
 #   mecanico_nombre = db.Column(db.String(200))       # NUEVO
#
    # relaciones
 #   orden = db.relationship(
 #       'OrdenTrabajo',
 #       backref='reportes',   # esto crea orden.reportes
  #      lazy=True
 #   )
 #   mecanico = db.relationship(
 #       'Empleado',
 #       lazy=True
 #   )

#    def to_dict(self):
#       return {
#            "id": self.id,
#            "orden_id": self.orden_id,
#            "mecanico_id": self.mecanico_id,
#            "mecanico_nombre": self.mecanico_nombre,
    #          "descripcion": self.descripcion,
#            "creado_en": self.creado_en.isoformat() if self.creado_en else None,
 #           "cliente_nombre": self.cliente_nombre,
 #           "moto_placa": self.moto_placa,
 #           "moto_vin": self.moto_vin,
 #           "modelo_nombre": self.modelo_nombre,
 #           "marca_nombre": self.marca_nombre,
 #       }
