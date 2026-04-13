require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const clientRoutes = require("./routes/clientRoutes");
const bikeRoutes = require("./routes/bikeRoutes");
const workOrderRoutes = require("./routes/workOrderRoutes");
require("./models"); 

const app = express();

app.use(cors());
app.use(express.json());

// Rutas públicas (auth)
app.use("/api", authRoutes);

// Rutas protegidas
app.use("/api", userRoutes);
app.use("/api", clientRoutes);
app.use("/api", bikeRoutes);
app.use("/api", workOrderRoutes);

app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log("Servidor en http://localhost:3000");
  });
});
