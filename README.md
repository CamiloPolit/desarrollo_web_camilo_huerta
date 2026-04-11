# Área Calidad de Vida DCC — Gestión de Actividades

Prototipo web para la gestión de actividades extracurriculares de la comunidad del Departamento de Ciencias de la Computación (DCC), Universidad de Chile.

## Cómo ejecutar

Abrir `index.html` directamente en el navegador. No requiere servidor ni instalación de dependencias. La única dependencia externa es **Chart.js 4.4.4**, cargada desde CDN únicamente en `metricas.html`.

## Decisiones de diseño e implementación

### 1. Módulo central de datos (`store.js`)

Se implementó un módulo `window.dccStore` que centraliza el acceso a los datos (`members[]`, `activities[]`). Todas las páginas cargan este script primero, lo que permite compartir el mismo estado en memoria durante la sesión. Al asignarlo a `window`, los demás módulos pueden accederlo sin imports.

El sistema incluye 6 miembros y 6 actividades de ejemplo precargados en memoria para que el listado y las métricas funcionen desde el primer momento, sin necesidad de registrar nada.

### 2. Validación 100% en JavaScript

El atributo `required` de HTML **no se usa en ningún formulario**. Todos los formularios tienen `novalidate`. La validación se realiza íntegramente en `validacion.js`, que expone funciones puras que retornan `{ valid: bool, message: string }`. Esto permite validar tanto en el evento `blur` (campo a campo) como en el `submit` (formulario completo).

### 3. Límite de 10 actividades por miembro

Se definió un máximo de 10 actividades por miembro (`validacion.LIMITE_ACTIVIDADES = 10`). Este límite busca reflejar una cantidad razonable de actividades extracurriculares reales; un número mayor podría indicar datos poco confiables o uso indebido del sistema.

### 4. Validación de traslape de horarios

Al registrar una actividad, se verifica que los bloques horarios del mismo día no se superpongan, usando intersección de intervalos: dos bloques `[a.inicio, a.fin)` y `[b.inicio, b.fin)` se solapan si `a.inicio < b.fin && b.inicio < a.fin`.

### 5. Gráficos con Chart.js

Los gráficos en `metricas.html` se implementaron con **Chart.js 4.4.4** (CDN). Cada gráfico usa `maintainAspectRatio: false` con un contenedor de altura fija (`280px`) para control preciso del tamaño. Las instancias se destruyen antes de redibujar para evitar superposición de canvas.

## Estructura de archivos

```
├── index.html          — Página de inicio con accesos rápidos
├── registro.html       — Formulario de registro de miembros
├── actividades.html    — Formulario de registro de actividades
├── miembros.html       — Listado paginado y filtrable de miembros
├── metricas.html       — Métricas y gráficos del sistema
├── css/
│   ├── base.css        — Reset, tipografía, layout y navegación
│   ├── forms.css       — Estilos de formularios y validación
│   ├── lista.css       — Tabla, filtros, paginación y modal
│   └── graficos.css    — Contenedores de gráficos
└── js/
    ├── store.js        — Almacén central de datos en memoria con ejemplos precargados
    ├── validacion.js   — Funciones de validación reutilizables
    ├── registro.js     — Lógica del formulario de registro
    ├── actividades.js  — Lógica del formulario de actividades
    ├── miembros.js     — Listado, filtros, paginación y modal
    └── graficos.js     — Renderizado de gráficos con Chart.js
```
