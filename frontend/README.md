# Taller de Motos - Frontend

Frontend moderno y responsivo para el sistema de gestión de orden de trabajo de un taller de motos. Desarrollado con React 19, React Router DOM y Axios.

## 📋 Tabla de Contenidos

- [Features](#-features)
- [Requirements](#-requirements)
- [Instalación](#-instalación)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Componentes Principales](#-componentes-principales)
- [Rutas de la Aplicación](#-rutas-de-la-aplicación)
- [Variables de Entorno](#-variables-de-entorno)
- [Scripts Disponibles](#-scripts-disponibles)
- [Guía de Uso](#-guía-de-uso)
- [Estilos y Temas](#-estilos-y-temas)
- [Integración API](#-integración-api)
- [Performance](#-performance)
- [Troubleshooting](#-troubleshooting)
- [Deployment](#-deployment)

## 🎯 Features

- **Gestión de Órdenes de Trabajo**: Ver, crear, editar y eliminar órdenes
- **Búsqueda Avanzada**: Filtrar órdenes por placa de moto y estado
- **Estados Dinámicos**: Transiciones de estado con validación en tiempo real
- **Interfaz Responsiva**: Diseño adaptable para desktop, tablet y móvil
- **Gestión de Items**: Agregar/eliminar repuestos y mano de obra a órdenes
- **Validación de Formularios**: Validación en cliente antes de enviar
- **Manejo de Errores**: Feedback visual inmediato al usuario
- **Loading States**: Indicadores visuales durante operaciones asincrónicas

## 📦 Requirements

- Node.js >= 16.0.0
- npm >= 8.0.0 o yarn >= 1.22.0
- Backend corriendo en http://localhost:3000 (ver backend/README.md)

## 🚀 Instalación

### 1. Clonar o descargar el proyecto

```bash
cd frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Verificar configuración del backend

Asegúrate de que el backend esté corriendo:

```bash
cd ../backend
npm run dev
```

### 4. Iniciar el servidor de desarrollo

```bash
cd ../frontend
npm start
```

La aplicación se abrirá en `http://localhost:3000` o en el puerto disponible siguiente.

## 📁 Estructura del Proyecto

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   └── Header.js           # Navegación principal
│   ├── pages/
│   │   ├── OrdersList.js       # Listado de órdenes con filtros
│   │   ├── CreateOrder.js      # Formulario para crear orden
│   │   ├── OrderDetail.js      # Detalle de orden y cambio de estado
│   │   └── NotFound.js         # Página 404
│   ├── services/
│   │   └── api.js              # Configuración de Axios y llamadas API
│   ├── App.js                  # Componente raíz con Router
│   ├── App.css                 # Estilos de la aplicación
│   ├── index.js                # Entry point
│   ├── index.css               # Estilos globales
│   └── README.md               # Este archivo
├── package.json
├── .gitignore
└── README.md
```

## 🧩 Componentes Principales

### Header.js

Componente de navegación que aparece en todas las páginas.

**Features:**
- Logo de la aplicación
- Navegación a páginas principales
- Indicadores visuales de página activa

```jsx
import Header from './components/Header';

// Usado en App.js como parte del layout
<Header />
```

### Pages - OrdersList.js

Página principal que muestra todas las órdenes de trabajo.

**Features:**
- Tabla con columnas: ID, Placa, Cliente, Estado, Acciones
- Búsqueda por placa de moto
- Filtrado por estado (Pendiente, En Progreso, Completada, Cancelada)
- Botón "Limpiar Filtros" para resetear búsqueda
- Botones de acción: Ver Detalle, Editar, Eliminar
- Loading state durante carga de datos
- Manejo de errores con mensajes descriptivos

**Props y State:**
```javascript
const [orders, setOrders] = useState([]);
const [searchPlate, setSearchPlate] = useState("");
const [statusFilter, setStatusFilter] = useState("");
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

**Métodos Principales:**

```javascript
// Buscar órdenes con filtros
const handleSearch = () => {
  const params = new URLSearchParams();
  if (searchPlate) params.append("plate", searchPlate);
  if (statusFilter) params.append("status", statusFilter);
  // Hace llamada a API con parámetros
};

// Limpiar todos los filtros
const clearFilters = () => {
  setSearchPlate("");
  setStatusFilter("");
  // Recarga todas las órdenes
};
```

**Ejemplo de Uso:**
```
1. Inicia la aplicación
2. Ingresa una placa (ej: "ABC-123")
3. Selecciona un estado (ej: "Pendiente")
4. Click en "Buscar"
5. Click en "Limpiar filtros" para reset
```

### Pages - CreateOrder.js

Formulario para crear nuevas órdenes de trabajo.

**Features:**
- Inputs de número de orden y descripción
- Validación de campos requeridos
- Feedback visual de éxito/error
- Loading state durante envío
- Redirección automática tras crear exitosamente

**Form Fields:**
```javascript
{
  workOrderNumber: Number,      // ID único de la orden
  description: String           // Descripción de la reparación
}
```

**Validaciones:**
```javascript
- workOrderNumber: requerido, debe ser número
- description: requerido, mínimo 10 caracteres
```

**Ejemplo de Request:**
```javascript
POST /api/workorders
{
  "workOrderNumber": 1001,
  "description": "Cambio de aceite y filtro"
}
```

**Response Esperado:**
```javascript
{
  "id": 1,
  "workOrderNumber": 1001,
  "description": "Cambio de aceite y filtro",
  "status": "Pendiente",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Pages - OrderDetail.js

Página de detalle que muestra información completa de una orden.

**Features:**
- Información de la orden (ID, número, descripción)
- Datos del cliente y moto asociada
- Lista de items (repuestos y mano de obra)
- Total de la orden calculado automáticamente
- Botones de cambio de estado disponibles según estado actual
- Agregar nuevos items
- Eliminar items de la orden
- Manejo completo de errores

**State Management:**
```javascript
const [order, setOrder] = useState(null);
const [items, setItems] = useState([]);
const [newItemName, setNewItemName] = useState("");
const [newItemPrice, setNewItemPrice] = useState("");
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [successMessage, setSuccessMessage] = useState("");
```

**Transiciones de Estado:**
```javascript
const statusTransitions = {
  "Pendiente": ["En Progreso"],
  "En Progreso": ["Completada", "Pendiente"],
  "Completada": [],
  "Cancelada": []
};
```

**Método - changeStatus():**
```javascript
const changeStatus = async (newStatus) => {
  try {
    const response = await api.put(`/workorders/${id}/status`, {
      status: newStatus
    });
    setOrder(response.data);
    setSuccessMessage(`Estado cambiado a ${newStatus}`);
  } catch (error) {
    setError("Error al cambiar estado");
  }
};
```

**Método - addItem():**
```javascript
const addItem = async () => {
  try {
    const response = await api.post(`/workorders/${id}/items`, {
      name: newItemName,
      price: parseFloat(newItemPrice)
    });
    setItems([...items, response.data]);
    setNewItemName("");
    setNewItemPrice("");
  } catch (error) {
    setError("Error al agregar item");
  }
};
```

**Cálculo Total (useMemo):**
```javascript
const total = useMemo(() => {
  return items.reduce((sum, item) => sum + (item.price || 0), 0);
}, [items]);
```

**Ejemplo de Flujo:**
```
1. Haz click en "Ver Detalle" desde la lista
2. Mira la información de la orden
3. Cambia el estado a "En Progreso"
4. Agrega items (repuestos, mano de obra)
5. Observa cómo se actualiza el total
6. Cambia a "Completada" cuando termines
```

## 🗺️ Rutas de la Aplicación

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | OrdersList | Listado de órdenes de trabajo |
| `/create` | CreateOrder | Crear nueva orden |
| `/orders/:id` | OrderDetail | Ver detalle y editar orden |
| `*` | NotFound | Página no encontrada |

**Estructura de Router:**
```jsx
<BrowserRouter>
  <Header />
  <Routes>
    <Route path="/" element={<OrdersList />} />
    <Route path="/create" element={<CreateOrder />} />
    <Route path="/orders/:id" element={<OrderDetail />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

**Navegación Programática:**
```javascript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate("/orders/1");           // Ir a detalle
navigate("/");                   // Volver a inicio
navigate(-1);                    // Atrás
```

## 🔧 Variables de Entorno

Crea un archivo `.env` en la raíz del frontend (opcional, para custom API URL):

```env
REACT_APP_API_URL=http://localhost:3000/api
```

Si no está definido, el valor por defecto es `http://localhost:3000/api`.

**Cómo usarlo en el código:**
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
```

## 📜 Scripts Disponibles

### `npm start`

Inicia el servidor de desarrollo en modo watch.

```bash
npm start
```

- Abre http://localhost:3000 en el navegador
- Hot-reloading habilitado (cambios en tiempo real)
- Errores y warnings mostrados en la consola y en el navegador

### `npm run build`

Construye la aplicación para producción.

```bash
npm run build
```

- Minifica y optimiza el código
- Crea carpeta `build/` lista para desplegar
- Checkea warnings y errores antes de construir
- Tamaño del bundle: ~90KB (main.js minificado)

### `npm test`

Ejecuta tests unitarios en modo watch (opcional).

```bash
npm test
```

- Aún no hay tests implementados
- Puedes crear archivos `.test.js` en `src/`

### `npm run eject`

Expone toda la configuración de Create React App (NO RECOMENDADO).

```bash
npm run eject
```

⚠️ **ADVERTENCIA**: Este es un comando de una sola vía. Una vez ejecutado, no se puede deshacer.

## 📖 Guía de Uso

### Flujo General de la Aplicación

#### 1. Visualizar Órdenes
```
1. Abre http://localhost:3000
2. En la tabla verás todas las órdenes
3. Puedes ver las siguientes columnas:
   - ID de la orden
   - Placa de la moto
   - Nombre del cliente
   - Estado actual (badge con color)
```

#### 2. Buscar y Filtrar
```
1. En el formulario de filtros ingresa:
   - Placa: "ABC-123"
   - Estado: "Pendiente" (dropdown)
2. Click en "Buscar"
3. La tabla se actualizará mostrando solo resultados
4. Click en "Limpiar Filtros" para resetear
```

#### 3. Crear Nueva Orden
```
1. Click en botón "+ Nueva Orden" del header
2. Completa el formulario:
   - Número de Orden: 1005
   - Descripción: "Reparación de cadena"
3. Click en "Crear Orden"
4. Si hay éxito, se redirige a la lista
5. Si hay error, verás mensaje en rojo
```

#### 4. Ver Detalle y Editar
```
1. En la tabla, click en "Ver Detalle" o en el ID
2. Se abre la página con info completa
3. Acciones disponibles:
   - Cambiar estado (botones dinámicos)
   - Agregar items (repuestos, mano de obra)
   - Eliminar items
   - Ver total automático
4. Click en header para volver a lista
```

#### 5. Cambiar Estado
```
1. En OrderDetail, mira los botones de estado
2. Los botones disponibles dependen del estado actual:
   - Pendiente → [En Progreso]
   - En Progreso → [Completada] [Pendiente]
   - Completada → (sin botones)
3. Click en botón para cambiar estado
4. Se actualizará en tiempo real
```

#### 6. Agregar Items
```
1. En OrderDetail, scroll hacia "Agregar Item"
2. Ingresa:
   - Nombre del item: "Aceite 5W-30"
   - Precio: "50.00"
3. Click en "Agregar Item"
4. El item aparece en la lista
5. El total se recalcula automáticamente
```

### Casos de Uso Comunes

**Caso 1: Crear orden desde cero**
```
1. Home → "+ Nueva Orden"
2. Completa datos
3. Crear → Ver detalle
4. Cambiar a "En Progreso"
5. Agregar items según se repara
6. Cambiar a "Completada"
```

**Caso 2: Buscar orden por placa**
```
1. Home
2. Ingresa placa en filtro
3. Click "Buscar"
4. Click en resultado para ver detalle
```

**Caso 3: Ver en progreso y actualizar**
```
1. Home
2. Filters: Estado = "En Progreso"
3. Click "Buscar"
4. Click en orden
5. Cambiar estado a "Completada"
```

## 🎨 Estilos y Temas

### Arquitectura de Estilos

- **App.css**: Estilos principales de componentes y páginas
- **index.css**: Reset global y estilos base
- **CSS Puro**: Sin dependencias externas (sin Bootstrap, Tailwind, etc)

### Paleta de Colores

```css
/* Primario */
--primary: #2c3e50        /* Azul oscuro grisáceo */
--primary-light: #34495e  /* Variante más clara */
--primary-dark: #1a252f   /* Variante más oscura */

/* Secundario */
--secondary: #3498db      /* Azul brillante */
--secondary-light: #5dade2

/* Estados */
--success: #27ae60        /* Verde para completado */
--info: #2980b9          /* Azul para en progreso */
--warning: #f39c12       /* Naranja para pendiente */
--danger: #e74c3c        /* Rojo para error/cancelado */

/* General */
--text: #2c3e50          /* Texto principal */
--text-light: #7f8c8d    /* Texto secundaria */
--bg-light: #ecf0f1      /* Background claro */
--border: #bdc3c7        /* Bordes */
```

### Componentes Estilizados

**Tabla de Órdenes:**
```css
table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

tbody tr:hover {
  background-color: #ecf0f1;
}
```

**Badges de Estado:**
```css
.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 12px;
}

.status-Completada {
  background: #d4edda;
  color: #155724;
}

.status-Pendiente {
  background: #fff3cd;
  color: #856404;
}

.status-EnProgreso {
  background: #d1ecf1;
  color: #0c5460;
}

.status-Cancelada {
  background: #f8d7da;
  color: #721c24;
}
```

**Botones:**
```css
button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

button.primary {
  background: #3498db;
  color: white;
}

button.primary:hover {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

button.danger {
  background: #e74c3c;
  color: white;
}
```

**Formularios:**
```css
input, textarea, select {
  width: 100%;
  padding: 12px;
  border: 2px solid #bdc3c7;
  border-radius: 5px;
  font-size: 14px;
  font-family: inherit;
}

input:focus, textarea:focus, select:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
}
```

### Responsividad

```css
/* Tablet (768px - 1024px) */
@media (max-width: 1024px) {
  .container {
    padding: 15px;
  }
  
  table {
    font-size: 14px;
  }
}

/* Mobile (< 768px) */
@media (max-width: 768px) {
  body {
    font-size: 14px;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  button {
    width: 100%;
  }
  
  table {
    display: block;
    overflow-x: auto;
  }
}
```

## 🔌 Integración API

### Configuración Base

**Archivo: src/services/api.js**

```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
```

### Endpoints Utilizados

#### Órdenes de Trabajo

**GET /workorders** - Obtener todas las órdenes
```javascript
// Sin filtros
const response = await api.get('/workorders');

// Con filtros
const response = await api.get('/workorders', {
  params: {
    plate: 'ABC-123',
    status: 'Pendiente'
  }
});

// Response
{
  "data": [
    {
      "id": 1,
      "workOrderNumber": 1001,
      "description": "Cambio de aceite",
      "status": "Pendiente",
      "bikeId": 1,
      "totalPrice": 150.00,
      "createdAt": "2024-01-15T10:30:00Z",
      "bike": {
        "id": 1,
        "plate": "ABC-123",
        "client": {
          "id": 1,
          "name": "Juan Pérez"
        }
      }
    }
  ]
}
```

**GET /workorders/:id** - Obtener detalle de una orden
```javascript
const response = await api.get(`/workorders/${1}`);

// Response
{
  "data": {
    "id": 1,
    "workOrderNumber": 1001,
    "description": "Cambio de aceite",
    "status": "Pendiente",
    "bikeId": 1,
    "totalPrice": 150.00,
    "createdAt": "2024-01-15T10:30:00Z",
    "items": [
      {
        "id": 1,
        "name": "Aceite 5W-30",
        "price": 50.00,
        "type": "REPUESTO"
      }
    ],
    "bike": {
      "id": 1,
      "plate": "ABC-123",
      "model": "Honda CB 500",
      "client": {
        "id": 1,
        "name": "Juan Pérez",
        "phone": "555-1234"
      }
    }
  }
}
```

**POST /workorders** - Crear nueva orden
```javascript
const response = await api.post('/workorders', {
  workOrderNumber: 1001,
  description: "Cambio de aceite"
});

// Response (201)
{
  "data": {
    "id": 1,
    "workOrderNumber": 1001,
    "description": "Cambio de aceite",
    "status": "Pendiente",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**PUT /workorders/:id/status** - Cambiar estado
```javascript
const response = await api.put(`/workorders/${1}/status`, {
  status: "En Progreso"
});

// Response
{
  "data": {
    "id": 1,
    "status": "En Progreso",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

**DELETE /workorders/:id** - Eliminar orden
```javascript
const response = await api.delete(`/workorders/${1}`);

// Response (204)
{}
```

#### Items

**POST /workorders/:id/items** - Agregar item
```javascript
const response = await api.post(`/workorders/${1}/items`, {
  name: "Aceite 5W-30",
  price: 50.00
});

// Response
{
  "data": {
    "id": 1,
    "workOrderId": 1,
    "name": "Aceite 5W-30",
    "price": 50.00,
    "type": "REPUESTO"
  }
}
```

**DELETE /workorders/:id/items/:itemId** - Eliminar item
```javascript
const response = await api.delete(`/workorders/${1}/items/${1}`);

// Response (204)
{}
```

### Manejo de Errores

```javascript
try {
  const response = await api.get('/workorders');
  setOrders(response.data);
} catch (error) {
  if (error.response) {
    // Server respondió con error
    console.error('Error:', error.response.status, error.response.data);
    setError(error.response.data.message || 'Error del servidor');
  } else if (error.request) {
    // Request fue hecho pero no hay respuesta
    console.error('No response received');
    setError('No se pudo conectar al servidor');
  } else {
    // Error al hacer el request
    console.error('Error:', error.message);
    setError('Error desconocido');
  }
}
```

### Interceptores (Opcional)

```javascript
// Interceptor de request (para autenticación futura)
api.interceptors.request.use(
  config => {
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  error => Promise.reject(error)
);

// Interceptor de response
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirigir a login
    }
    return Promise.reject(error);
  }
);
```

## ⚡ Performance

### Optimizaciones Implementadas

**1. useMemo para cálculos costosos:**
```javascript
const total = useMemo(() => {
  return items.reduce((sum, item) => sum + item.price, 0);
}, [items]);
```

**2. useCallback para funciones memoizadas:**
```javascript
const handleSearch = useCallback(() => {
  // Evita recrear función en cada render
}, [searchPlate, statusFilter]);
```

**3. Code Splitting (React.lazy) - Futuro:**
```javascript
const OrdersList = lazy(() => import('./pages/OrdersList'));
const CreateOrder = lazy(() => import('./pages/CreateOrder'));
```

**4. Lazy Loading de Imágenes:**
```jsx
<img src="logo.png" loading="lazy" alt="Logo" />
```

### Tamaño de Bundle

- **main.js minificada**: ~90 KB
- **Dependencies**: axios (~50KB), react (~100KB), react-router (~70KB)
- **Total**: ~310 KB (gzip ~85KB)

### Recomendaciones

1. **Implementar paginación** en listado de órdenes para n > 100
2. **Agregar virtualización** usando `react-window` para tablas grandes
3. **Implementar service worker** para PWA capabilities
4. **Cachear requests** frecuentes con React Query o SWR
5. **Lazy load** componentes no críticos

## 🐛 Troubleshooting

### "Cannot GET /" in browser

**Problema**: La aplicación no carga

**Soluciones**:
```bash
# 1. Asegúrate de que npm start se ejecutó
npm start

# 2. Limpia node_modules y reinstala
rm -rf node_modules package-lock.json
npm install

# 3. Compila la aplicación
npm run build
```

### "Failed to fetch" o errores de conexión

**Problema**: No se puede conectar a la API del backend

**Soluciones**:
```bash
# 1. Verifica que backend está corriendo
cd ../backend
npm run dev

# 2. Revisa puerto en backend (debe ser 3000)
# En backend/src/app.js debe haber: app.listen(3000)

# 3. Configura REACT_APP_API_URL en .env
REACT_APP_API_URL=http://localhost:3000/api

# 4. Reinicia npm start después de cambiar .env
```

### Errores de CORS

**Problema**: "Access to XMLHttpRequest has been blocked by CORS policy"

**Soluciones**:
```javascript
// 1. En backend/src/app.js debe estar:
app.use(cors());

// 2. O configurar CORS específicamente:
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// 3. Reinicia backend
```

### Estado no se actualiza

**Problema**: useState no parece actualizar el componente

**Causas y Soluciones**:
```javascript
// ❌ MALO - modificar estado directamente
items.push(newItem);
setItems(items);

// ✅ BIEN - crear nuevo array
setItems([...items, newItem]);

// ❌ MALO - no incluir dependencias en useEffect
useEffect(() => {
  setOrders(data);
}); // Loop infinito!

// ✅ BIEN - incluir dependencias array
useEffect(() => {
  fetchOrders();
}, []); // Solo al montar

// ✅ BIEN - incluir variables en dependencias
useEffect(() => {
  fetchOrders(searchPlate, statusFilter);
}, [searchPlate, statusFilter]);
```

### Problemas de Routing

**Problema**: El router no navega o las rutas no funcionan

**Soluciones**:
```javascript
// 1. Verifica BrowserRouter sea el nivel más alto
// En src/index.js o src/App.js

// 2. Usa <Link> o useNavigate para navegación
import { Link, useNavigate } from 'react-router-dom';

// ✅ Correcto
<Link to="/orders/1">Ver detalle</Link>

const navigate = useNavigate();
navigate("/orders/1");

// ❌ Evitar
<a href="/orders/1">Link</a> // No actualizará sin reload

// 3. Verifica que las rutas estén definidas en App.js
<Route path="/orders/:id" element={<OrderDetail />} />
```

### Build falló o warnings

**Problema**: `npm run build` falla o tiene warnings

**Soluciones**:
```bash
# 1. Revisa los warnings en la consola

# 2. Elim código no utilizado
npm run build -- --analyzer # Si tenías webpack-bundle-analyzer

# 3. Verifica imports vacíos o variables sin usar
import something from 'X'; // UNUSED - eliminar

# 4. Compila sin analizar para ver error específico
npm run build 2>&1 | head -50
```

## 🎯 Deployment

### Deploy a Netlify

```bash
# 1. Build la aplicación
npm run build

# 1b. Verifica que build/ existe y tiene index.html
ls -la build/

# 2. Opción A: Drag & Drop
#    - Ve a https://app.netlify.com
#    - Arrastra la carpeta build/
#    - Listo!

# 2. Opción B: CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=build

# 3. Configura variables de entorno en Netlify
#    - Settings → Environment
#    - Agrega: REACT_APP_API_URL=https://backend-url.com/api
```

### Deploy a Vercel

```bash
# 1. Instala Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Durante el deploy:
#    - Selecciona preset: React
#    - Build command: npm run build
#    - Output directory: build
#    - Environment variable: REACT_APP_API_URL

# 4. Deploy en producción
vercel --prod
```

### Deploy a Heroku (Frontend + Backend)

```bash
# En la raíz del proyecto (donde están frontend/ y backend/)

# 1. Login a Heroku
heroku login

# 2. Crear aplicación
heroku create nombre-app

# 3. Agregar buildpack de Node
heroku buildpacks:add heroku/nodejs

# 4. Agregar buildpack de static (para frontend)
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static

# 5. Crear Procfile en raíz
echo "web: cd backend && npm start" > Procfile

# 6. Crear static.json para frontend
echo '{
  "root": "frontend/build/",
  "routes": {
    "/**": "index.html"
  }
}' > static.json

# 7. Deploy
git push heroku main
```

### Checklist Pre-Deploy

- [ ] Backend está corriendo sin errores
- [ ] Frontend compila: `npm run build` sin warnings
- [ ] Variables de entorno configuradas (.env)
- [ ] URL de API apunta a producción
- [ ] Tests pasan (si hay)
- [ ] No hay console.log ni console.error innecesarios
- [ ] Revisaste performance (bundle size < 500KB)
- [ ] Responsive design works en móvil
- [ ] Todos los formularios validan correctamente
- [ ] Error handling funcionando

### Variables de Entorno en Producción

```env
# .env.production (local, NO commitear)
REACT_APP_API_URL=https://api.example.com/api
REACT_APP_ENV=production

# En Netlify/Vercel UI:
REACT_APP_API_URL = https://api.example.com/api
REACT_APP_ENV = production
```

### Monitoreo Post-Deploy

```javascript
// Agregar en index.js para production monitoring
if (process.env.REACT_APP_ENV === 'production') {
  window.addEventListener('error', (event) => {
    console.error('Error en producción:', event.error);
    // Enviar a servicio de logging (Sentry, etc)
  });
}
```

---

## 📞 Soporte

Para problemas:
1. Revisa el [Backend README](../backend/README.md)
2. Revisa el [Proyecto README](../README.md)
3. Verifica logs del navegador (F12 → Console)
4. Verifica logs del backend (`npm run dev`)
5. Verifica conexión a base de datos

---

**Última actualización**: Enero 2024
**Versión**: 1.0.0
**Licencia**: MIT
