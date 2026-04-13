# 🏍️ Sistema de Gestión de Taller de Motos (MVP)

Un sistema Full-Stack para la administración eficiente de un taller mecánico de motocicletas. Este proyecto fue desarrollado como prueba técnica cubriendo requerimientos transaccionales, historiales de estado, y control de accesos basados en roles.

![Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20Express%20%7C%20MySQL%20%7C%20React-blue)

## ✨ Características Principales

*   **🔒 Autenticación y Autorización (JWT):** Sistema seguro de inicio de sesión.
*   **👥 Control de Roles (RBAC):**
    *   **Administrador:** Acceso total o *Full CRUD* a la gestión de usuarios, clientes, vehículos y órdenes.
    *   **Mecánico:** Acción restringida. Puede agregar ítems de cobro y avanzar estados operativos (`DIAGNOSTICO`, `EN_PROCESO`, `LISTA`), sin permisos de eliminación corporativa ni acceso a finanzas administrativas.
*   **📋 Historial de Estados Inmutable:** Trazabilidad automática (Auditoría) ante cualquier cambio de estado en una orden. Registra *quién, cuándo y el motivo*, bloqueando lógicamente transiciones inválidas (ej. evitar saltos hacia atrás o re-procesar motos `ENTREGADAS`).
*   **💳 Gestión de Ítems (Facturación):** Añade cobros por `REPUESTO` o `MANO_OBRA` en tiempo real actualizando el valor global de la orden.
*   **🎨 Interfaz UI/UX Ágil:** Frontend construido de forma pulcra, responsiva y orientada a la utilidad del operario. (Buscadores de clientes integrados, selectores de motos, *timelines* visuales).

---

## 🛠️ Tecnologías Empleadas

**Backend:**
*   **Node.js & Express:** Servidor API RESTful.
*   **MySQL & Sequelize ORM:** Modelado de base de datos relacional (ACID).
*   **Bcrypt & JsonWebToken:** Cifrado pasivo y tokens portables.
*   **Express-Rate-Limit:** Prevención de ataques de fuerza bruta en el inicio de sesión.

**Frontend:**
*   **React (CRA & hooks):** Interfaz de usuario declarativa.
*   **Axios:** Cliente HTTP con interceptores automáticos de seguridad.
*   **React Router Dom:** Enrutamiento e inyección de *Protected Routes*.
*   **Vanilla CSS:** Estilos puros, livianos y escalables (Tarjetas glassmorfismo, Flexbox).

---

## ⚙️ Estructura de la Base de Datos

El sistema sincroniza automáticamente 6 tablas fundamentales:
1.  `Users`: Administración de cuentas (Credenciales cifradas).
2.  `Clients`: Directorio de clientes.
3.  `Bikes`: Vehículos (`Placa`, `Marca`, vinculados a su Cliente dueño).
4.  `WorkOrders`: Tabla pivote de órdenes de servicio (`Total`, `Estado actual`).
5.  `Items`: Detalle mercantil (Repuestos / Costos de Labor).
6.  `StatusHistories`: *Track* transaccional de auditoría continua.

---

## 🚀 Instalación y Despliegue Local

### 1. Requisitos Previos
*   [Node.js](https://nodejs.org/es/) (v16 o superior).
*   Motor de Base de datos **MySQL** en ejecución.

### 2. Configuración del Backend
```bash
# 1. Ingresar a la carpeta backend
cd backend

# 2. Instalar dependencias
npm install

# 3. Configurar Entorno
# Crea un archivo .env en la raíz de 'backend/' con las siguientes variables:
# DB_NAME=taller_motos
# DB_USER=root
# DB_PASS=tu_contraseña
# DB_HOST=localhost
# JWT_SECRET=una_clave_secreta_muy_segura

# 4. Poblar datos iniciales y aplicar Modelos (IMPORTANTE)
# Esto sincronizará la BD y te creará dos cuentas de prueba.
node src/seed.js

# 5. Iniciar el servidor
npm run dev
```
> El backend quedará escuchando en `http://localhost:3000`.

### 3. Configuración del Frontend
```bash
# 1. En una nueva terminal, ingresar a la carpeta frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor web
npm start
```
> La interfaz cargará automáticamente abriendo tu navegador en `http://localhost:3001` (o 3000 si está libre).

---

## 🔑 Cuentas de Acceso (Semillas)

Si ejecutaste el script `seed.js`, estos son los usuarios inyectados en la base de datos para probar los dos perfiles del requerimiento:

| Rol | Correo / Usuario | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin@taller.com` | `admin123` |
| **Mecánico** | `carlos@taller.com` | `mecanico123` |

---

## 📡 Endpoints de la API

La API sigue estándares REST. Todas las rutas (salvo Login) exigen cabecera `Authorization: Bearer <Token>`.

*   `POST /api/auth/login` - Permite a los usuarios identificarse.
*   `GET /api/auth/me` - Retorna la sesión activa.
*   `GET, POST, PUT, DELETE /api/users` - Gestión interna de Staff (**Solo ADMIN**).
*   `GET, POST, PUT, DELETE /api/clients` - Control de consumidores.
*   `GET, POST, PUT, DELETE /api/bikes` - Parque automotor de clientes.
*   `GET, POST, PUT, DELETE /api/work-orders` - Emisión y gestión de ingresos a taller.
*   `PATCH /api/work-orders/:id/status` - Avanzar ciclo de vida protegiendo la retroactividad.
*   `GET /api/work-orders/:id/history` - Obtener historial completo de la orden en orden paramétrico descendente.
*   `POST /api/work-orders/:id/items` - Cargar mano de obra o partes a facturar.
*   `DELETE /api/work-orders/items/:itemId` - Anular cobros (**Solo ADMIN**).

---
*Desarrollado según mejores prácticas y patrones de diseño MVC enfocado a Node/React.*
