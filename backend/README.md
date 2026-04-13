# Backend - Taller Motos API

API REST desarrollada con **Node.js + Express + Sequelize + MySQL**

---

## 📋 Contenido

- [Setup](#setup)
- [Estructura](#estructura)
- [Modelos](#modelos)
- [Controladores](#controladores)
- [Rutas](#rutas)
- [Ejemplos de uso](#ejemplos-de-uso)
- [Variables de entorno](#variables-de-entorno)

---

## 🔧 Setup

### 1. Instalar dependencias
```bash
npm install
```

### 2. Crear base de datos MySQL
```bash
mysql -u root
CREATE DATABASE taller_motos;
EXIT;
```

### 3. Ejecutar en desarrollo
```bash
npm run dev
```

Servidor corriendo en: `http://localhost:3000`

---

## 📂 Estructura

```
backend/src/
├── config/
│   └── database.js          # Configuración de Sequelize
├── controllers/
│   ├── clientController.js  # Lógica de clientes
│   ├── bikeController.js    # Lógica de motos
│   └── workOrderController.js # Lógica de órdenes
├── models/
│   ├── Client.js            # Modelo Client
│   ├── Bike.js              # Modelo Bike
│   ├── WorkOrder.js         # Modelo WorkOrder
│   ├── Item.js              # Modelo Item
│   └── index.js             # Asociaciones
├── routes/
│   ├── clientRoutes.js      # Rutas de clientes
│   ├── bikeRoutes.js        # Rutas de motos
│   └── workOrderRoutes.js   # Rutas de órdenes
├── middlewares/             # (Futuras validaciones)
└── app.js                   # Entrada principal
```

---

## 🗄️ Modelos

### Client
```javascript
{
  id: INTEGER (PK),
  name: STRING (required),
  phone: STRING,
  email: STRING,
  createdAt: DATETIME,
  updatedAt: DATETIME
}
```

### Bike
```javascript
{
  id: INTEGER (PK),
  placa: STRING (unique, required),
  brand: STRING,
  model: STRING,
  cylinder: INTEGER,
  clientId: INTEGER (FK → Client),
  createdAt: DATETIME,
  updatedAt: DATETIME
}
```

### WorkOrder
```javascript
{
  id: INTEGER (PK),
  entryDate: DATETIME (default: NOW),
  faultDescription: STRING,
  status: STRING (default: 'RECIBIDA'),
  total: FLOAT (default: 0),
  BikeId: INTEGER (FK → Bike, required),
  createdAt: DATETIME,
  updatedAt: DATETIME
}
```

### Item
```javascript
{
  id: INTEGER (PK),
  type: ENUM('MANO_OBRA', 'REPUESTO'),
  description: STRING,
  count: INTEGER,
  unitValue: FLOAT,
  WorkOrderId: INTEGER (FK → WorkOrder),
  createdAt: DATETIME,
  updatedAt: DATETIME
}
```

---

## 🎮 Controladores

### clientController.js

#### `createClient(req, res)`
- Valida que `name` no esté vacío
- Crea nuevo cliente
- Retorna: `201 Created`

#### `getClients(req, res)`
- Query params: `search` (búsqueda parcial por nombre)
- Retorna: Array de clientes
- Usa: `Op.like` para búsqueda LIKE en SQL

#### `getClientById(req, res)`
- Params: `id`
- Retorna: Cliente completo
- Error si no existe: `404`

---

### bikeController.js

#### `createBike(req, res)`
- Valida: `placa` y `clientId` obligatorios
- Verifica que cliente exista
- Verifica que placa sea única
- Retorna: `201 Created`

#### `getBikes(req, res)`
- Query params: `plate` (búsqueda parcial)
- Incluye datos del cliente
- Retorna: Array de motos

#### `getBikeById(req, res)`
- Params: `id`
- Incluye datos del cliente
- Retorna: Moto completa

---

### workOrderController.js

#### `createWorkOrder(req, res)`
- Valida: `motoId` obligatorio
- Verifica que moto exista
- Status inicial: `RECIBIDA`
- Total inicial: `0`
- Retorna: `201 Created`

#### `getWorkOrders(req, res)`
- Query params:
  - `status` - Filtrar por estado
  - `plate` - Filtrar por placa (busca en relación Bike)
  - `page` - Número de página (default: 1)
  - `pageSize` - Registros por página (default: 10)
- Incluye: Bike → Client
- Retorna: `{ total, data: [...] }`

#### `getWorkOrderById(req, res)`
- Params: `id`
- Incluye: Bike → Client → Items
- Retorna: Orden completa

#### `updateStatus(req, res)`
- Params: `id`
- Body: `{ status }`
- Valida transiciones de estado
- Retorna: Orden actualizada

#### `addItem(req, res)`
- Params: `id` (workOrderId)
- Body: `{ type, description, count, unitValue }`
- Validaciones:
  - `type` y `count` obligatorios
  - `count > 0`
  - `unitValue >= 0`
- Recalcula total de la orden
- Retorna: `201 Created`

#### `deleteItem(req, res)`
- Params: `itemId`
- Elimina item
- Recalcula total de la orden
- Retorna: `{ message: "Item eliminado" }`

---

## 🛣️ Rutas

### `/api/clients`
```
POST   /clients              → createClient
GET    /clients              → getClients
GET    /clients/:id          → getClientById
```

### `/api/bikes`
```
POST   /bikes                → createBike
GET    /bikes                → getBikes
GET    /bikes/:id            → getBikeById
```

### `/api/work-orders`
```
POST   /work-orders          → createWorkOrder
GET    /work-orders          → getWorkOrders
GET    /work-orders/:id      → getWorkOrderById
PATCH  /work-orders/:id/status → updateStatus
POST   /work-orders/:id/items → addItem
DELETE /work-orders/items/:itemId → deleteItem
```

---

## 📚 Ejemplos de uso

### Crear cliente
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "phone": "3105556789",
    "email": "juan@example.com"
  }'
```

### Buscar clientes por nombre
```bash
curl http://localhost:3000/api/clients?search=Juan
```

### Crear moto
```bash
curl -X POST http://localhost:3000/api/bikes \
  -H "Content-Type: application/json" \
  -d '{
    "placa": "ABC123",
    "brand": "Yamaha",
    "model": "FZ",
    "cylinder": 150,
    "clientId": 1
  }'
```

### Filtrar órdenes por estado
```bash
curl http://localhost:3000/api/work-orders?status=RECIBIDA
```

### Cambiar estado de orden
```bash
curl -X PATCH http://localhost:3000/api/work-orders/1/status \
  -H "Content-Type: application/json" \
  -d '{ "status": "DIAGNOSTICO" }'
```

### Agregar item a orden
```bash
curl -X POST http://localhost:3000/api/work-orders/1/items \
  -H "Content-Type: application/json" \
  -d '{
    "type": "REPUESTO",
    "description": "Filtro de aire",
    "count": 1,
    "unitValue": 15000
  }'
```

---

## 🔐 Variables de entorno

Crear archivo `.env` en `backend/`:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=taller_motos
DB_PORT=3306

# Server
PORT=3000
NODE_ENV=development
```

---

## 🚠 Validaciones de transiciones de estado

```
RECIBIDA
  ↓ (válid)
DIAGNOSTICO ← CANCELADA (en cualquier momento)
  ↓
EN_PROCESO ← CANCELADA
  ↓
LISTA ← CANCELADA
  ↓
ENTREGADA

CANCELADA (terminal - sin transiciones)
```

---

## 📊 Asociaciones (Relaciones)

**app.js (Sequelize sync)**
```javascript
sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log("Servidor en http://localhost:3000");
  });
});
```

**models/index.js (Relaciones)**
```javascript
Client.hasMany(Bike, { foreignKey: "clientId" });
Bike.belongsTo(Client, { foreignKey: "clientId" });

Bike.hasMany(WorkOrder, { foreignKey: "BikeId" });
WorkOrder.belongsTo(Bike, { foreignKey: "BikeId" });

WorkOrder.hasMany(Item);
Item.belongsTo(WorkOrder);
```

---

## 🔍 Búsquedas avanzadas

### Op.like (búsqueda parcial)
```javascript
where: {
  placa: {
    [Op.like]: `%ABC%`  // Encuentra: ABC123, ABCXYZ, etc.
  }
}
```

### Paginación
```javascript
// GET /work-orders?page=2&pageSize=5
limit: 5,
offset: (2 - 1) * 5 = 5  // Salta los primeros 5
```

---

## 🧹 Mantenimiento

### Recalcular totales
La función `calculateTotal()` se ejecuta automáticamente:
- Al agregar un item: `POST /work-orders/:id/items`
- Al eliminar un item: `DELETE /work-orders/items/:itemId`

```javascript
const calculateTotal = async (workOrderId) => {
  const items = await Item.findAll({
    where: { WorkOrderId: workOrderId }
  });
  let total = 0;
  items.forEach(item => {
    total += item.count * item.unitValue;
  });
  return total;
};
```

---

## 🐛 Errores comunes

| Error | Causa | Solución |
|-------|-------|----------|
| 400 Bad Request | Datos faltantes | Revisa body de la request |
| 404 Not Found | Registro no existe | Verifica ID o datos |
| 500 Server Error | Error en BD | Verifica conexión MySQL |
| Transición inválida | Estado no permitido | Revisa transiciones válidas |

---

## 📈 Performance

### Índices recomendados
```sql
ALTER TABLE Bikes ADD INDEX idx_placa (placa);
ALTER TABLE Bikes ADD INDEX idx_clientId (clientId);
ALTER TABLE WorkOrders ADD INDEX idx_BikeId (BikeId);
ALTER TABLE WorkOrders ADD INDEX idx_status (status);
ALTER TABLE Items ADD INDEX idx_WorkOrderId (WorkOrderId);
```

---

¡Listo! El backend está completamente documentado. 🚀
