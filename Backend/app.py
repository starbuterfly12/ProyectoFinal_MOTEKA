from flask import Flask, jsonify
from core.config import Config
from core.extensions import db, migrate, jwt, cors
from api.auth_routes import auth_bp
from api.roles_routes import roles_bp
from api.marcas_routes import marcas_bp
from api.modelos_routes import modelos_bp
from api.clientes_routes import clientes_bp
from api.motos_routes import motos_bp
from api.ordenes_routes import ordenes_bp
from api.reportes_routes import reportes_bp
from api.usuarios_routes import usuarios_bp
from api.reportes_trabajo_routes import reportes_trabajo_bp
from api.mecanicos_routes import mecanicos_bp
from api.dashboard_routes import dashboard_bp
from api.herramientas_routes import herramientas_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, 
                origins=app.config['CORS_ORIGINS'],
                supports_credentials=True,
                allow_headers=["Content-Type", "Authorization"],
                methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(roles_bp)
    app.register_blueprint(marcas_bp)
    app.register_blueprint(modelos_bp)
    app.register_blueprint(clientes_bp)
    app.register_blueprint(motos_bp)
    app.register_blueprint(ordenes_bp)
    app.register_blueprint(reportes_bp)
    app.register_blueprint(usuarios_bp)
    app.register_blueprint(reportes_trabajo_bp)
    app.register_blueprint(mecanicos_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(herramientas_bp)
    
    @app.route('/')
    def index():
        return jsonify({
            "mensaje": "API MOTEKA - Sistema de Gestión de Taller de Motocicletas",
            "version": "1.0.0",
            "endpoints": {
                "auth": "/api/auth",
                "roles": "/api/roles",
                "marcas": "/api/marcas",
                "modelos": "/api/modelos",
                "clientes": "/api/clientes",
                "motocicletas": "/api/motocicletas",
                "ordenes": "/api/ordenes",
                "reportes": "/api/reportes",
                "usuarios": "/api/usuarios",
                "reportes_trabajo": "/api/reportes_trabajo"
            }
        }), 200
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Recurso no encontrado"}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Error interno del servidor"}), 500
    
    with app.app_context():
        db.create_all()
        seed_initial_data()
    
    return app


def seed_initial_data():
    """Crea roles iniciales y usuario admin si no existen"""
    from models.catalogos import Rol
    from models.personas import Usuario
    
    roles_nombres = ['gerente', 'encargado', 'mecanico']
    
    for rol_nombre in roles_nombres:
        if not Rol.query.filter_by(nombre=rol_nombre).first():
            rol = Rol(nombre=rol_nombre)
            db.session.add(rol)
            print(f"✓ Rol '{rol_nombre}' creado")
    
    db.session.commit()
    
    if Usuario.query.count() == 0:
        from core.config import Config
        rol_gerente = Rol.query.filter_by(nombre='gerente').first()
        if rol_gerente:
            admin = Usuario(
                usuario='admin',
                correo='admin@moteka.com',
                rol_id=rol_gerente.id
            )
            admin.set_password(Config.SEED_ADMIN_PASS)
            db.session.add(admin)
            db.session.commit()
            print(f"✓ Usuario admin creado (contraseña: {Config.SEED_ADMIN_PASS})")


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
