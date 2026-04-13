/**
 * Script de seed: crea el usuario ADMIN inicial.
 * Ejecutar: node src/seed.js
 */
require("dotenv").config();
const sequelize = require("./config/database");
require("./models");
const { User } = require("./models");

async function seed() {
  try {
    await sequelize.sync();

    // Verificar si ya existe un admin
    const existingAdmin = await User.findOne({ where: { email: "admin@taller.com" } });

    if (existingAdmin) {
      console.log("✅ El usuario admin ya existe:");
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Rol: ${existingAdmin.role}`);
      return;
    }

    const admin = await User.create({
      name: "Administrador",
      email: "admin@taller.com",
      password_hash: "admin123", // Se hashea automáticamente por el hook
      role: "ADMIN",
      active: true
    });

    console.log("✅ Usuario ADMIN creado exitosamente:");
    console.log(`   Nombre: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: admin123`);
    console.log(`   Rol: ${admin.role}`);

    // Crear un mecánico de ejemplo
    const mecanico = await User.create({
      name: "Carlos Mecánico",
      email: "carlos@taller.com",
      password_hash: "mecanico123",
      role: "MECANICO",
      active: true
    });

    console.log("\n✅ Usuario MECANICO creado exitosamente:");
    console.log(`   Nombre: ${mecanico.name}`);
    console.log(`   Email: ${mecanico.email}`);
    console.log(`   Password: mecanico123`);
    console.log(`   Rol: ${mecanico.role}`);

  } catch (error) {
    console.error("❌ Error en seed:", error.message);
  } finally {
    await sequelize.close();
  }
}

seed();
