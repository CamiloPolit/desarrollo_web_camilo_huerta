# Área Calidad de Vida DCC — Gestión de Actividades (Tarea 2)

Aplicación web para la gestión de actividades extracurriculares de la comunidad del
Departamento de Ciencias de la Computación (DCC), Universidad de Chile.

Construida sobre el frontend de Tarea 1 (HTML/CSS/JS sin modificaciones estructurales)
más un backend Flask que expone una API REST y persiste los datos en MySQL.

---

## Requisitos

- Python 3.9+
- MySQL 8.0+ corriendo en `localhost:3306`
- Usuario MySQL `cc5002` con contraseña `programacionweb` y acceso a la base `tarea2`

---

## Configuración de la base de datos

### 1. Crear el usuario y la base de datos (solo la primera vez)

```bash
mysql -u root -p
```

```sql
CREATE DATABASE IF NOT EXISTS tarea2 DEFAULT CHARACTER SET utf8;
CREATE USER IF NOT EXISTS 'cc5002'@'localhost' IDENTIFIED BY 'programacionweb';
GRANT ALL PRIVILEGES ON tarea2.* TO 'cc5002'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. Ejecutar los scripts en orden

**macOS / Linux** (desde la raíz del proyecto):

```bash
mysql -u cc5002 -pprogramacionweb tarea2 < backend/schema.sql
mysql -u cc5002 -pprogramacionweb tarea2 < backend/region-comuna.sql
mysql -u cc5002 -pprogramacionweb tarea2 < backend/datos_ejemplo.sql
```

**Windows (PowerShell o CMD)** (desde la raíz del proyecto):

```powershell
mysql -u cc5002 -pprogramacionweb tarea2 < backend\schema.sql
mysql -u cc5002 -pprogramacionweb tarea2 < backend\region-comuna.sql
mysql -u cc5002 -pprogramacionweb tarea2 < backend\datos_ejemplo.sql
```

Cada vez que se ejecuten estos tres comandos, la base de datos queda en un estado
limpio y conocido:

- `schema.sql` elimina y recrea el schema completo (`DROP SCHEMA IF EXISTS`).
- `region-comuna.sql` puebla las tablas `region` y `comuna` con los datos oficiales de Chile.
- `datos_ejemplo.sql` purga las tablas de datos (`TRUNCATE`) e inserta 6 miembros y
6 actividades de demostración equivalentes a los mockups del frontend.

---

## Ejecución del backend

**macOS / Linux**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
python3 app.py
```

**Windows (PowerShell)**

```powershell
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

El servidor queda disponible en `http://localhost:5000`.

> El entorno virtual (`venv/`) es opcional pero recomendado para no instalar
> las dependencias de forma global. Si se omite, ejecutar directamente
> `pip3 install -r requirements.txt` y `python3 app.py` en macOS,
> o `pip install -r requirements.txt` y `python app.py` en Windows.

---

## Ejecución del frontend

Abrir `index.html` directamente en el navegador (`file://`). No requiere servidor adicional.
El frontend se comunica con Flask vía `fetch()` con CORS habilitado para `file://`.

---

## Estructura del proyecto

```
├── index.html              — Inicio: accesos rápidos y últimos miembros registrados
├── registro.html           — Formulario de registro de miembros
├── actividades.html        — Formulario de registro de actividades
├── miembros.html           — Listado paginado con modal de detalle
├── metricas.html           — Gráficos e indicadores (Chart.js)
├── css/
│   ├── base.css            — Reset, tipografía, layout, navegación
│   ├── forms.css           — Estilos de formularios y validación
│   ├── lista.css           — Tabla, filtros, paginación y modal
│   └── graficos.css        — Contenedores de gráficos
├── js/
│   ├── store.js            — Bus de estado compartido (arrays vacíos, sin mockups)
│   ├── validacion.js       — Funciones de validación reutilizables (lado cliente)
│   ├── registro.js         — Lógica del formulario de registro de miembros
│   ├── actividades.js      — Lógica del formulario de registro de actividades
│   ├── miembros.js         — Listado, filtros, paginación y modal
│   ├── graficos.js         — Renderizado de gráficos con Chart.js
│   └── backend.js          — Conector con la API Flask (fetch, interceptores)
└── backend/
    ├── app.py              — Application Factory: crea la app y registra blueprints
    ├── config.py           — Configuración centralizada (DB URI, uploads, etc.)
    ├── extensions.py       — Instancia de SQLAlchemy (evita imports circulares)
    ├── requirements.txt    — Dependencias Python
    ├── schema.sql          — Definición del schema (recrea desde cero)
    ├── region-comuna.sql   — Datos geográficos oficiales de Chile
    ├── datos_ejemplo.sql   — Datos de demostración (purga + INSERT)
    ├── models/             — Modelos SQLAlchemy (uno por tabla)
    │   ├── region.py
    │   ├── comuna.py
    │   ├── miembro.py
    │   ├── actividad.py
    │   ├── horario.py
    │   └── foto.py
    ├── routes/             — Blueprints Flask (un archivo por dominio)
    │   ├── geo.py          — GET /regiones
    │   ├── miembros.py     — GET /miembros, /miembros/ultimos, /miembros/<id>
    │   └── registro.py     — POST /registro, POST /actividad
    ├── services/           — Lógica de negocio desacoplada del routing
    │   ├── validacion.py   — Validación servidor: RUT, email, campos por tipo, horarios
    │   └── archivos.py     — Guardado de archivos subidos con nombre UUID
    └── static/uploads/     — Archivos multimedia subidos por los usuarios
```

---

## API REST


| Método | URL                 | Descripción                                        |
| ------ | ------------------- | -------------------------------------------------- |
| GET    | `/regiones`         | Lista de regiones con sus comunas                  |
| POST   | `/registro`         | Registra un miembro nuevo                          |
| POST   | `/actividad`        | Registra una actividad para un miembro existente   |
| GET    | `/miembros`         | Lista paginada (`?pagina=&busqueda=`)              |
| GET    | `/miembros/ultimos` | Últimos 5 miembros registrados                     |
| GET    | `/miembros/<id>`    | Detalle completo con actividades, horarios y fotos |


---

## Decisiones de diseño e implementación

### 1. Frontend de Tarea 1 sin modificaciones estructurales

Se reutilizó íntegramente el frontend de Tarea 1 (formularios, validaciones JS,
estilos). El único archivo nuevo del lado cliente es `backend.js`, que actúa como
capa de integración sin alterar la lógica existente.

### 2. Flask como API REST pura

Flask no sirve plantillas HTML (sin Jinja2). Todos los endpoints devuelven JSON.
El frontend consume la API con `fetch()` desde `file://`, por lo que Flask habilita
CORS en todas las respuestas vía `@app.after_request`.

### 3. Interceptación de `store.push` como señal de validación exitosa

`registro.js` y `actividades.js` llaman a `store.members.push()` y
`store.activities.push()` únicamente cuando la validación del lado cliente pasó
correctamente. `backend.js` parchea esos métodos para interceptar ese momento
exacto, construir el `FormData` con los datos ya validados y enviarlos al backend.
Esto evita modificar los archivos originales de Tarea 1.

### 4. Separación de responsabilidades en el backend (Blueprints + Services)

El backend sigue el patrón Application Factory con Blueprints:

- `routes/` contiene solo orquestación (recibir request → llamar service → devolver JSON).
- `services/validacion.py` concentra toda la lógica de negocio (validar RUT chileno,
email, campos por tipo de miembro, horarios) sin depender de Flask, lo que permite
testearla de forma independiente.
- `extensions.py` instancia SQLAlchemy separado de `app.py` para evitar imports circulares.

### 5. Schema adaptado al modelo de Tarea 1

Los archivos SQL base entregados en Tarea 2 (`tarea2.sql`) se modificaron para
alinearse con el modelo de datos que ya existía en el proyecto, evitando tener
que reescribir el frontend:

- `miembro` se extendió con `rut`, `tipo` y columnas opcionales por tipo
(`plan_estudio`, `programa`, `cargo`, `jerarquia`, etc.).
- `actividad` reemplaza los campos `nombre` y `tipo` del original por `titulo`,
`categoria`, `lugar` y `enlace`, que coinciden con los campos del formulario.
- Se agregó la tabla `horario` con `dia`, `hora_inicio` y `hora_fin` en vez de
`duracion`, para mantener consistencia con la validación de traslapes del frontend.

### 6. Validación en doble capa

Toda validación ocurre dos veces:

- **Cliente:** `validacion.js` valida en `blur` y en `submit` antes de enviar al backend.
- **Servidor:** `services/validacion.py` replica las mismas reglas (RUT con dígito
verificador, email, campos obligatorios por tipo, horarios) e incluye además
verificaciones que solo son posibles en servidor (unicidad de RUT en BD,
existencia de la comuna, límite de 10 actividades por miembro).

### 7. Redirección al inicio tras registro exitoso

Al confirmar que el backend persistió el registro, el navegador redirige a
`index.html?mensaje=...`. La página de inicio lee el parámetro de la URL, muestra
el mensaje de éxito y lo limpia con `history.replaceState` para que no reaparezca
al recargar.

### 8. Archivos multimedia

Las fotos y videos de actividades se guardan en `backend/static/uploads/` con nombre
UUID para evitar colisiones. La ruta relativa se almacena en la tabla `foto` y se
sirve directamente por Flask como archivo estático.