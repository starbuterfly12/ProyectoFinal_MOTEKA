from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from models.personas import Usuario

def role_required(*allowed_roles):
    """Decorador para verificar roles de usuario"""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_data = claims.get('user')
            
            if not user_data or 'rol' not in user_data:
                return jsonify({"error": "No se pudo verificar el rol del usuario"}), 403
            
            user_rol = user_data.get('rol')
            if user_rol not in allowed_roles:
                return jsonify({"error": "No tiene permisos para realizar esta acción"}), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator
