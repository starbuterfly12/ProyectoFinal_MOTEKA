# MOTEKA - Sistema de Gestión de Taller de Motocicletas

Sistema full-stack completo para la gestión de un taller de motocicletas, desarrollado con Flask (Backend) y React + TypeScript (Frontend).

## Características Principales

- ✅ **Autenticación y Autorización**: Sistema JWT con roles (gerente, encargado, mecánico)
- ✅ **Gestión de Catálogos**: Marcas y modelos de motocicletas
- ✅ **Gestión de Clientes**: CRUD completo con búsqueda avanzada
- ✅ **Registro de Motocicletas**: Información detallada de vehículos vinculados a clientes
- ✅ **Órdenes de Trabajo**: Sistema completo de gestión con estados, historial y pagos
- ✅ **Reportes Exportables**: CSV, XLSX y PDF de órdenes de trabajo
- ✅ **Interfaz Moderna**: UI oscura y responsiva con React

## Stack Tecnológico

### Backend
- Python 3.11+
- Flask 3.x
- SQLAlchemy 2.x + Flask-SQLAlchemy 3.x
- Flask-Migrate (Alembic) para migraciones
- Flask-JWT-Extended 4.7.x para autenticación
- PostgreSQL 14+ con psycopg 3.x
- openpyxl (exportación XLSX)
- reportlab (exportación PDF)

### Frontend
- React 18
- TypeScript
- Vite 5.x
- React Router 6.x
- Axios para peticiones HTTP

## Requisitos Previos

- Python 3.11 o superior
- Node.js 18 o superior
- PostgreSQL 14 o superior
- npm o yarn

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd Gestion_MOTEKA
```

### 2. Configurar Backend

```bash
cd Backend

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de base de datos
```

**Variables de Entorno Backend (.env)**:
```env
DATABASE_URL=postgresql+psycopg://postgres:admin@localhost:5432/moteka_db
JWT_SECRET_KEY=admin
FLASK_ENV=development
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
SEED_ADMIN_PASS=admin123
```

### 3. Crear Base de Datos

```bash
# Desde psql o tu cliente PostgreSQL
createdb moteka_db
```

### 4. Ejecutar Backend

```bash
cd Backend
python app.py
```

El backend iniciará en `http://localhost:5000`

**Nota**: El sistema creará automáticamente:
- Los roles: gerente, encargado, mecanico
- Un usuario admin inicial (usuario: `admin`, contraseña: `admin123`)

### 5. Configurar Frontend

```bash
cd Frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

**Variables de Entorno Frontend (.env)**:
```env
VITE_API_URL=http://localhost:5000
```

### 6. Ejecutar Frontend

```bash
cd Frontend
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## Credenciales Iniciales

- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Rol**: gerente

## Estructura del Proyecto

```
gestion_moteka/
├── backend/
│   ├── app.py                  # Punto de entrada Flask
│   ├── requirements.txt        # Dependencias Python
│   ├── .env                    # Variables de entorno (local)
│   ├── core/
│   │   ├── config.py           # Configuración global
│   │   ├── extensions.py       # DB, JWT, CORS, etc.
│   │   └── auth.py             # Decoradores de autorización / require_role
│   ├── models/
│   │   ├── catalogos.py        # Marcas, Modelos, Roles
│   │   ├── personas.py         # Clientes, Empleados, Usuarios
│   │   ├── vehiculos.py        # Motocicletas
│   │   └── ordenes.py          # Órdenes, Historial de estado, Pagos
│   └── api/
│       ├── auth_routes.py      # Login / perfil / creación inicial
│       ├── roles_routes.py     # CRUD de roles (solo gerente)
│       ├── marcas_routes.py    # CRUD de marcas
│       ├── modelos_routes.py   # CRUD de modelos
│       ├── clientes_routes.py  # CRUD de clientes
│       ├── motos_routes.py     # CRUD de motocicletas
│       ├── ordenes_routes.py   # Gestión de órdenes, cambios de estado
│       └── reportes_routes.py  # Generación XLSX / PDF
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    └── src/
        ├── main.tsx            # Punto de arranque React
        ├── router.tsx          # Rutas protegidas / públicas
        ├── index.css           # Estilos globales
        ├── lib/
        │   ├── api.ts          # Axios base (usa VITE_API_URL)
        │   └── auth.ts         # Manejo de token y roles en el cliente
        ├── components/
        │   ├── AppIcon.tsx
        │   └── RequireAuth.tsx # Wrapper de protección por rol
        ├── layouts/
        │   ├── PublicLayout.tsx
        │   └── AuthLayout.tsx  # Navbar rojo + contenido privado
        ├── diseños CSS/
        │   ├── login.css
        │   ├── usuarios.css
        │   ├── clientes.css
        │   ├── herramientas.css
        │   ├── home.css
        │   ├── marcas.css
        │   ├── modelos.css
        │   ├── motos.css
        │   └── ordenes.css
        └── pages/
            ├── Login.tsx
            ├── Home.tsx
            ├── Ordenes.tsx
            ├── Herramientas.tsx
            ├── Marcas.tsx
            ├── Modelos.tsx
            ├── Clientes.tsx
            ├── Motos.tsx
            └── Usuarios.tsx
            
```

## API Endpoints

### Autenticación

#### POST /api/auth/register
Crea un nuevo usuario (solo gerentes después del primer usuario)

**Body**:
```json
{
  "usuario": "string",
  "correo": "string (opcional)",
  "contrasena": "string",
  "rol_id": number,
  "empleado_id": number (opcional)
}
```

#### POST /api/auth/login
Inicia sesión

**Body**:
```json
{
  "usuario": "admin",
  "contrasena": "admin123"
}
```

**Response**:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "usuario": "admin",
    "rol": "gerente",
    "rol_id": 1
  }
}
```

#### GET /api/auth/me
Obtiene información del usuario autenticado

**Headers**: `Authorization: Bearer <token>`

### Roles

#### GET /api/roles
Lista todos los roles

#### POST /api/roles [solo gerente]
Crea un nuevo rol

#### DELETE /api/roles/:id [solo gerente]
Elimina un rol

### Marcas

#### GET /api/marcas?q=honda
Lista marcas con búsqueda opcional

#### POST /api/marcas [gerente/encargado]
```json
{
  "nombre": "Honda"
}
```

#### PUT /api/marcas/:id [gerente/encargado]
Actualiza una marca

#### DELETE /api/marcas/:id [gerente/encargado]
Elimina una marca (solo si no tiene modelos)

### Modelos

#### GET /api/modelos?marca_id=1&q=cbr
Lista modelos con filtros

#### POST /api/modelos [gerente/encargado]
```json
{
  "nombre": "CBR 600",
  "marca_id": 1
}
```

### Clientes

#### GET /api/clientes?q=nombre
Busca clientes por nombre, teléfono o correo

#### POST /api/clientes [gerente/encargado]
```json
{
  "nombre": "Juan Pérez",
  "telefono": "555-1234",
  "correo": "juan@example.com",
  "direccion": "Calle Principal 123"
}
```

### Motocicletas

#### GET /api/motocicletas?cliente_id=1&marca_id=1&placa=ABC123
Lista motocicletas con múltiples filtros

#### POST /api/motocicletas [gerente/encargado]
```json
{
  "cliente_id": 1,
  "modelo_id": 1,
  "placa": "ABC-123",
  "vin": "1HGBH41JXMN109186",
  "anio": 2020,
  "cilindraje_cc": 600,
  "color": "Rojo",
  "kilometraje_km": 15000,
  "ultima_revision": "2024-01-15",
  "notas": "En buen estado"
}
```

### Órdenes de Trabajo

#### GET /api/ordenes?cliente_nombre=juan&estado=EN_ESPERA&desde=2024-01-01&hasta=2024-12-31
Lista órdenes con filtros avanzados

#### POST /api/ordenes [gerente/encargado/mecanico]
```json
{
  "cliente_id": 1,
  "motocicleta_id": 1,
  "mecanico_asignado_id": 2,
  "observaciones": "Cambio de aceite y revisión general"
}
```

#### PATCH /api/ordenes/:id/estado [gerente/encargado/mecanico]
Cambia el estado de una orden

```json
{
  "estado": "EN_REPARACION",
  "notas": "Iniciando reparación"
}
```

Estados disponibles:
- `EN_ESPERA`
- `EN_REPARACION`
- `FINALIZADA`
- `CANCELADA`

#### GET /api/ordenes/:id/historial
Obtiene el historial de cambios de estado

#### POST /api/ordenes/:id/pagos [gerente/encargado]
Registra un pago

```json
{


#### DELETE /api/ordenes/:id [gerente/encargado]
Elimina una orden (solo si no tiene pagos)

### Reportes

#### GET /api/reportes/ordenes?formato=csv&estado=FINALIZADA [gerente/encargado]
Exporta órdenes en el formato especificado

**Parámetros**:
- `formato`: `csv`, `xlsx`, `pdf`
- Todos los filtros de /api/ordenes también aplican

**Ejemplo**:
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:5000/api/reportes/ordenes?formato=xlsx&desde=2024-01-01" \
  --output ordenes.xlsx
```

## Validaciones y Reglas de Negocio

1. **Marcas**: Nombres únicos, no se pueden eliminar si tienen modelos
2. **Modelos**: Combinación única de marca + nombre, no se pueden eliminar si tienen motocicletas
3. **Clientes**: Correo único (si se proporciona), no se pueden eliminar si tienen motocicletas
4. **Motocicletas**: 
   - Placa única (si se proporciona)
   - VIN único (si se proporciona)
   - No se puede cambiar el cliente una vez creada
   - No se pueden eliminar si tienen órdenes
5. **Órdenes**:
   - La motocicleta debe pertenecer al cliente
   - Al finalizar o cancelar, se registra automáticamente la fecha de salida
   - No se pueden eliminar si tienen pagos registrados
6. **Pagos**: El monto debe ser mayor a 0

## Uso de la Aplicación

### 1. Login
1. Accede a `http://localhost:5173/login`
2. Ingresa credenciales: `admin` / `admin123`
3. Marca "Recordar sesión" si deseas permanecer conectado

### 2. Gestión de Catálogos
1. Ve a "Marcas" y crea algunas marcas (Honda, Yamaha, Kawasaki, etc.)
2. Ve a "Modelos" y crea modelos asociados a las marcas

### 3. Gestión de Clientes
1. Ve a "Clientes"
2. Crea clientes con su información de contacto
3. Usa el buscador para encontrar clientes por nombre, teléfono o correo

### 4. Registro de Motocicletas
1. Ve a "Motocicletas"
2. Selecciona un cliente
3. Opcionalmente selecciona marca/modelo
4. Ingresa datos del vehículo (placa, VIN, año, cilindraje, etc.)

### 5. Gestión de Órdenes
1. Ve a "Órdenes"
2. Selecciona un cliente (carga automáticamente sus motos)
3. Selecciona la motocicleta
4. Agrega observaciones y crea la orden
5. Cambia el estado según el progreso
6. Ver historial de cambios de estado
7. Exporta reportes en CSV/XLSX/PDF

## Roles y Permisos

### Gerente
- Acceso completo a todas las funcionalidades
- Puede crear usuarios
- Puede crear y eliminar roles
- Gestión completa de CRUD

### Encargado
- CRUD de marcas, modelos, clientes, motocicletas
- Gestión completa de órdenes
- Registro de pagos
- Exportación de reportes

### Mecánico
- Crear órdenes de trabajo
- Cambiar estado de órdenes
- Ver historial de órdenes

## Desarrollo

### Scripts Disponibles

**Backend**:
```bash
python app.py                 # Inicia servidor en modo desarrollo
```

**Frontend**:
```bash
npm run dev                   # Servidor de desarrollo
npm run build                 # Build para producción
npm run preview              # Preview del build
```

### Testing

```bash
# Ejemplo de pruebas con curl

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin","contrasena":"admin123"}'

# Crear marca (con token)
curl -X POST http://localhost:5000/api/marcas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <tu-token>" \
  -d '{"nombre":"Honda"}'

# Listar marcas
curl http://localhost:5000/api/marcas \
  -H "Authorization: Bearer <tu-token>"
```

## Solución de Problemas

### Error de conexión a base de datos
- Verifica que PostgreSQL esté ejecutándose
- Confirma que la base de datos `moteka_db` existe
- Revisa las credenciales en `.env`

### CORS errors
- Verifica que `CORS_ORIGINS` incluya la URL del frontend
- Asegúrate de que ambos servidores estén ejecutándose

### Token expirado
- El token JWT expira después de cierto tiempo
- Vuelve a iniciar sesión para obtener un nuevo token

## Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## Contacto

Para preguntas o soporte, contacta al equipo de desarrollo.

---

**MOTEKA** - Sistema de Gestión de Taller de Motocicletas © 2024
