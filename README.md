# Área Calidad de Vida DCC — Gestión de Actividades (Tarea 4)

Aplicación web para la gestión de actividades extracurriculares de la comunidad del
Departamento de Ciencias de la Computación (DCC), Universidad de Chile.

Construida sobre el frontend de Tarea 1 (HTML/CSS/JS), el backend Flask de Tarea 2
(estadísticas y comentarios en Tarea 3), y extendida en **Tarea 4** con un **segundo
backend en Java/Spring Boot** (`backend-java/`) que implementa un buscador de
actividades y un sistema de notas (1-7) por actividad. Ambos backends corren en
paralelo, en puertos distintos, contra la misma base de datos MySQL.

---

## Requisitos

- Python 3.9+
- Java 17+ y Maven (ver instalación más abajo)
- MySQL 8.0+ (ver cómo iniciarlo más abajo)
- Usuario MySQL `cc5002` con contraseña `programacionweb` y acceso a la base `tarea2`

---

## Iniciar el servidor MySQL

Antes de ejecutar cualquier script SQL o iniciar el backend, el servidor MySQL
debe estar corriendo en `localhost:3306`.

**macOS (con Homebrew):**
```bash
brew services start mysql
# Para detenerlo después:
brew services stop mysql
```

**macOS (instalación oficial .pkg o MySQL.app):**
Abrir _System Preferences → MySQL_ y hacer clic en "Start MySQL Server",
o usar la barra de menú del MySQL Notifier.

**Linux (systemd):**
```bash
sudo systemctl start mysql
# Verificar que esté activo:
sudo systemctl status mysql
```

**Windows:**
```powershell
# Como administrador:
net start MySQL80
# O abrir "Services" (services.msc) y arrancar el servicio "MySQL80"
```

---

## Instalación de Java 17 y Maven (macOS, Homebrew)

```bash
brew install openjdk@17
brew install maven

# Vincular el JDK para que las herramientas del sistema lo encuentren (requiere sudo)
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk \
  /Library/Java/JavaVirtualMachines/openjdk-17.jdk

# Agregar al PATH (zsh)
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
echo 'export JAVA_HOME="/opt/homebrew/opt/openjdk@17"' >> ~/.zshrc
source ~/.zshrc

java -version   # debe mostrar openjdk version "17.x.x"
mvn -version    # debe mostrar Java version: 17
```

> Si no se tiene acceso a `sudo`, el symlink puede omitirse: `java`/`mvn` igual
> funcionan correctamente siempre que `PATH` y `JAVA_HOME` apunten a `openjdk@17`.

No es necesario instalar Spring Boot por separado: Maven descarga las dependencias
(`spring-boot-starter-*`) automáticamente al compilar, según lo declarado en
`backend-java/pom.xml`.

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
mysql -u cc5002 -pprogramacionweb tarea2 < backend/sql/schema/01_schema.sql
mysql -u cc5002 -pprogramacionweb tarea2 < backend/sql/schema/02_tabla-comentario.sql
mysql -u cc5002 -pprogramacionweb tarea2 < backend/sql/schema/03_tabla-nota.sql
mysql -u cc5002 -pprogramacionweb tarea2 < backend/sql/data/region-comuna.sql
mysql -u cc5002 -pprogramacionweb tarea2 < backend/sql/data/datos_ejemplo.sql
```

**Windows (PowerShell o CMD)** (desde la raíz del proyecto):

```powershell
mysql -u cc5002 -pprogramacionweb tarea2 < backend\sql\schema\01_schema.sql
mysql -u cc5002 -pprogramacionweb tarea2 < backend\sql\schema\02_tabla-comentario.sql
mysql -u cc5002 -pprogramacionweb tarea2 < backend\sql\schema\03_tabla-nota.sql
mysql -u cc5002 -pprogramacionweb tarea2 < backend\sql\data\region-comuna.sql
mysql -u cc5002 -pprogramacionweb tarea2 < backend\sql\data\datos_ejemplo.sql
```

Descripción de cada script:

- `sql/schema/01_schema.sql` — elimina y recrea el schema completo (`DROP SCHEMA IF EXISTS`).
- `sql/schema/02_tabla-comentario.sql` — crea la tabla `comentario` (Tarea 3). `CREATE TABLE IF NOT EXISTS`, seguro de re-ejecutar.
- `sql/schema/03_tabla-nota.sql` — crea la tabla `nota` (Tarea 4, script oficial del enunciado: `id`, `actividad_id`, `nota`). También segura de re-ejecutar.
- `sql/data/region-comuna.sql` — puebla `region` y `comuna` con los datos oficiales de Chile.
- `sql/data/datos_ejemplo.sql` — purga las tablas de datos (`TRUNCATE`) e inserta miembros y actividades de demostración.

> **Nota:** Si la base de datos ya estaba configurada desde una tarea anterior, solo es
> necesario ejecutar el script nuevo correspondiente (`03_tabla-nota.sql` para Tarea 4).

---

## Ejecución del backend Flask (Tareas 2-3)

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

## Ejecución del backend Java/Spring Boot (Tarea 4)

```bash
cd backend-java
mvn spring-boot:run
```

El servidor queda disponible en `http://localhost:8080`. Maven descarga las dependencias
la primera vez que se ejecuta (puede tardar unos minutos). Para compilar sin ejecutar:
`mvn clean package`.

Este backend es **independiente** del backend Flask: corre en otro puerto (8080 vs 5000),
vive en una carpeta separada (`backend-java/` vs `backend/`) y ambos pueden estar activos
al mismo tiempo, apuntando a la misma base de datos `tarea2`.

---

## Ejecución del frontend

Abrir `index.html` directamente en el navegador (`file://`). No requiere servidor adicional.
El frontend se comunica con Flask (puerto 5000) y con Spring Boot (puerto 8080) vía
`fetch()`, ambos con CORS habilitado para `file://`.

---

## Estructura del proyecto

```
├── index.html              — Inicio: accesos rápidos y últimos miembros registrados
├── registro.html           — Formulario de registro de miembros
├── actividades.html        — Formulario de registro de actividades
├── buscador.html           — Buscador de actividades + notas (Tarea 4)
├── miembros.html           — Listado paginado con modal de detalle y comentarios
├── metricas.html           — 3 gráficos con datos reales + enlace volver portada
├── css/
│   ├── base.css            — Reset, tipografía, layout, navegación
│   ├── forms.css           — Estilos de formularios y validación
│   ├── lista.css           — Tabla, filtros, paginación, modal, comentarios y buscador
│   └── graficos.css        — Contenedores de gráficos
├── js/
│   ├── store.js            — Bus de estado compartido
│   ├── validacion.js       — Funciones de validación reutilizables (lado cliente)
│   ├── registro.js         — Lógica del formulario de registro de miembros
│   ├── actividades.js      — Lógica del formulario de registro de actividades
│   ├── miembros.js         — Listado, filtros, paginación y modal
│   ├── graficos.js         — Fetch a /estadisticas y renderizado de 3 gráficos
│   ├── backend.js          — Conector Flask: fetch para miembros, comentarios, etc.
│   └── buscador.js         — Conector Spring Boot: búsqueda + notas (Tarea 4)
├── backend/                 — Backend Python/Flask (Tareas 2-3)
│   ├── app.py              — Application Factory: crea la app y registra blueprints
│   ├── config.py           — Configuración centralizada (DB URI, uploads, etc.)
│   ├── extensions.py       — Instancia de SQLAlchemy (evita imports circulares)
│   ├── requirements.txt    — Dependencias Python
│   ├── sql/
│   │   ├── schema/
│   │   │   ├── 01_schema.sql            — Definición del schema (recrea desde cero)
│   │   │   ├── 02_tabla-comentario.sql  — Crea la tabla comentario (Tarea 3)
│   │   │   └── 03_tabla-nota.sql        — Crea la tabla nota (Tarea 4)
│   │   └── data/
│   │       ├── region-comuna.sql        — Datos geográficos oficiales de Chile
│   │       └── datos_ejemplo.sql        — Datos de demostración (purga + INSERT)
│   ├── models/             — Modelos SQLAlchemy (uno por tabla)
│   │   ├── region.py
│   │   ├── comuna.py
│   │   ├── miembro.py
│   │   ├── actividad.py
│   │   ├── horario.py
│   │   ├── foto.py
│   │   └── comentario.py   — Nuevo en Tarea 3
│   ├── routes/             — Blueprints Flask (un archivo por dominio)
│   │   ├── geo.py          — GET /regiones
│   │   ├── miembros.py     — GET /miembros, /miembros/ultimos, /miembros/<id>
│   │   ├── registro.py     — POST /registro, POST /actividad
│   │   ├── estadisticas.py — GET /estadisticas (nuevo en Tarea 3)
│   │   └── comentarios.py  — GET y POST /actividades/<id>/comentarios (nuevo en T3)
│   ├── services/           — Lógica de negocio desacoplada del routing
│   │   ├── validacion.py   — Validación servidor: RUT, email, campos por tipo, horarios
│   │   └── archivos.py     — Guardado de archivos subidos con nombre UUID
│   └── static/uploads/     — Archivos multimedia subidos por los usuarios
└── backend-java/            — Backend Java/Spring Boot (Tarea 4), independiente de Flask
    ├── pom.xml              — Dependencias Maven (web, data-jpa, validation, mysql-connector)
    └── src/main/
        ├── resources/application.properties  — Puerto 8080, conexión a MySQL `tarea2`
        └── java/tarea4/
            ├── Tarea4Application.java
            ├── config/CorsConfig.java          — CORS para fetch desde file://
            ├── entity/                         — Region, Comuna, Miembro, Actividad,
            │                                      Horario (solo lectura) y Nota (lectura/escritura)
            ├── repository/
            │   ├── ActividadRepository.java    — Query JPQL de búsqueda (título/descripción/comuna)
            │   └── NotaRepository.java         — Proyección AVG + COUNT por actividad
            ├── dto/                            — ActividadBusquedaDTO, NotaRequestDTO, NotaResponseDTO
            ├── service/ActividadService.java   — Orquesta búsqueda + cálculo de nota
            ├── controller/
            │   ├── BusquedaController.java     — GET /api/actividades/buscar
            │   └── NotaController.java         — POST /api/actividades/{id}/notas
            └── exception/GlobalExceptionHandler.java  — Errores de validación → 422
```

---

## API REST

### Backend Flask — `http://localhost:5000`

| Método | URL                                     | Descripción                                                  |
| ------ | --------------------------------------- | ------------------------------------------------------------ |
| GET    | `/regiones`                             | Lista de regiones con sus comunas                            |
| POST   | `/registro`                             | Registra un miembro nuevo                                    |
| POST   | `/actividad`                            | Registra una actividad para un miembro existente             |
| GET    | `/miembros`                             | Lista paginada (`?pagina=&busqueda=`)                        |
| GET    | `/miembros/ultimos`                     | Últimos 5 miembros registrados                               |
| GET    | `/miembros/<id>`                        | Detalle completo con actividades, horarios y fotos           |
| GET    | `/estadisticas`                         | Datos para los 3 gráficos (miembros/día, categoría, comuna)  |
| GET    | `/actividades/<id>/comentarios`         | Lista de comentarios de una actividad (orden: más reciente)  |
| POST   | `/actividades/<id>/comentarios`         | Agrega un comentario (JSON: `{nombre, texto}`)               |

### Backend Spring Boot — `http://localhost:8080` (Tarea 4)

| Método | URL                                     | Descripción                                                          |
| ------ | --------------------------------------- | --------------------------------------------------------------------- |
| GET    | `/api/actividades/buscar?q=texto`       | Busca en título, descripción y comuna (mínimo 3 caracteres; `[]` si no hay match o `q` es muy corto) |
| POST   | `/api/actividades/{id}/notas`           | Agrega una nota 1-7 (JSON: `{nota}`); responde con promedio y conteo recalculados |


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

### 9. Estadísticas con datos reales desde la BD (Tarea 3)

`metricas.html` ya no usa datos mockup. Al cargar la página, `graficos.js` hace
un `fetch` a `GET /estadisticas`, que ejecuta tres queries SQL agregados:

- **Miembros por día:** `GROUP BY DATE(fecha_registro)` → gráfico de líneas.
- **Actividades por categoría:** `GROUP BY categoria` → gráfico de torta (pie).
- **Actividades por comuna:** JOIN entre `actividad`, `miembro` y `comuna`,
  agrupado por comuna → gráfico de barras. Solo aparecen comunas que tienen
  al menos un miembro con actividades registradas.

Se usa una sola llamada fetch (un endpoint que devuelve los tres datasets en
un objeto JSON) para minimizar la latencia en la carga de la página.
La biblioteca de gráficos usada es **Chart.js 4.4.4** (cargada vía CDN).

### 10. Comentarios asincrónicos (Tarea 3)

Los comentarios se muestran y agregan sin recargar la página, usando `fetch`:

- Al abrir el modal de un miembro, por cada actividad se llama
  `GET /actividades/<id>/comentarios` para listar los comentarios existentes.
- El formulario de nuevo comentario valida en el cliente (nombre ≥ 3 chars,
  texto ≥ 5 chars) antes de hacer el `POST`. El servidor repite la validación
  independientemente. Si hay errores de servidor (status 422), se muestran
  inline sin perder lo que el usuario escribió.
- Se usa `textContent` (nunca `innerHTML`) al insertar nombre y texto de
  comentarios en el DOM, para prevenir XSS con contenido malicioso.
- La tabla `comentario` existe como script separado (`tabla-comentario.sql`,
  adjunto al enunciado), con FK a `actividad.id`. El modelo SQLAlchemy
  `Comentario` mapea exactamente a esa estructura.

### 11. Dos backends corriendo al mismo tiempo (Tarea 4)

Para Tarea 4 se pedía usar Spring Boot, pero el backend Flask de las tareas anteriores
sigue funcionando igual. En vez de reescribirlo en Java, dejé los dos corriendo juntos:
Flask en el puerto 5000 (como siempre) y Spring Boot en el puerto 8080, ambos conectados
a la misma base de datos `tarea2`. El frontend solo tiene dos variables con la URL de
cada backend (`BACKEND_URL` en `backend.js` y `JAVA_BACKEND_URL` en `buscador.js`) y usa
una u otra según qué página sea.

**Por qué el código Java está en una carpeta separada (`backend-java/`) y no junto al de Python:**
son dos lenguajes y dos herramientas distintas (Python con pip, Java con Maven). Si los
mezclaba en la misma carpeta, las dos herramientas iban a confundirse entre sí (qué archivos
son de cada una, qué ignorar en git, etc.). Separarlos en carpetas distintas es más simple
de entender y de mantener.

**Por qué Java solo lee las tablas viejas (`miembro`, `actividad`, etc.) y no las modifica:**
esas tablas ya las maneja Flask, con sus propias validaciones. Si Java también pudiera
escribir en ellas, podrían chocar o saltarse esas validaciones. Por eso Java solo las lee
para mostrar información, y la única tabla nueva que sí puede escribir es `nota`, que es
exclusiva de esta funcionalidad.

**Por qué la configuración dice `ddl-auto=none`:** al principio probé con la opción
`validate`, que hace que Spring revise que las tablas de la base de datos coincidan con
lo que espera el código. Pero esa revisión falló por un detalle técnico de cómo MySQL
guarda los campos tipo `ENUM` (aunque en la práctica funcionan bien). Para evitar ese
error que no era real, usé `none`, que simplemente no hace esa revisión extra. De todas
formas Spring nunca crea ni modifica tablas por su cuenta — esas siguen viviendo en los
scripts `.sql` de la carpeta `backend/sql/schema/`.

### 12. Buscador de actividades con resaltado de coincidencias (Tarea 4)

- La búsqueda en `buscador.html` se dispara automáticamente con un debounce de 280ms
  (mismo patrón ya usado en `js/miembros.js`), solo si el texto tiene 3+ caracteres.
- El backend busca con `LIKE` case-insensitive sobre tres campos a la vez (`titulo`,
  `descripcion` de la actividad, y `nombre` de la comuna del miembro asociado) en una
  única query JPQL con `JOIN`.
- El resaltado (`<mark>`) del texto coincidente se hace en el cliente, construyendo
  nodos DOM con `textContent` (nunca `innerHTML` con concatenación cruda) para evitar
  que caracteres especiales en el término buscado generen HTML no deseado.
- Si no hay coincidencias, el backend responde `200 OK` con `[]` (una búsqueda sin
  resultados no es un error) y el frontend muestra un mensaje apropiado.

### 13. Notas (1-7) con recálculo en vivo (Tarea 4)

- Cada actividad puede recibir múltiples notas (tabla `nota`, sin restricción de
  unicidad por actividad), lo que permite mostrar un promedio en evolución más un
  contador de evaluaciones — igual a como funcionaría un sistema de rating real.
- Validación en dos capas: el cliente exige un entero 1-7 antes de hacer el `POST`
  (igual criterio que el resto del proyecto); el servidor repite la validación con
  Bean Validation (`@Min`/`@Max`) y devuelve `422` con el mismo formato de error
  (`{"errores": {...}}`) que ya usa Flask para comentarios, manteniendo consistencia
  entre ambos backends pese a estar en lenguajes distintos.
- Tras un `POST` exitoso, el backend devuelve el promedio y conteo ya recalculados
  en la misma respuesta (`201`), evitando una segunda llamada para refrescar la
  interfaz: el frontend actualiza el DOM directamente con esos valores.