// app.js
require('events').EventEmitter.defaultMaxListeners = 20;

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

//Order Management
const router = require("./Routes/OrderRoutes");
const SignupModel = require("./Model/SignupModel"); 
const AdminModel = require("./Model/AdminModel");
const productRoutes = require("./Routes/productRoutes");
const customerRoutes = require("./Routes/CustomerRoutes");

//Employee Management
const employeeRoutes = require("./Routes/employeeRoutes");
const dailyTargetRoutes = require("./Routes/DailyTargetRoutes");
const scheduleRoutes = require("./Routes/scheduleRoutes");
const dashboardRoutes = require("./Routes/dashboardRoutes"); // Dashboard route
const employeeDashboardRoutes = require("./Routes/employeeDashboardRoutes");

// Transport Routes
const deliveriesRoutes = require("./Routes/DeliveriesRoutes");
const vehiclesRoutes = require("./Routes/VehiclesRoutes");
const driversRoutes = require("./Routes/DriversRoutes");
const routesRoutes = require("./Routes/RoutesRoutes");
const maintenancesRoutes = require("./Routes/MaintenancesRoutes");
const transportdashboardRoutes = require("./Routes/TransportDashboardRoutes");

//Inventory Management
const inventoryrouter = require("./Routes/InventoryRoutes");
const productionRouter = require("./Routes/ProductionStockRoutes");
const productionRequestRouter = require("./Routes/ProductionRequestRoutes");
const materialStockRouter = require("./Routes/MaterialStockRoutes");
const batchStatusRouter = require("./Routes/BatchStatusRoutes");

//Supplier Management
const supplierRoutes = require("./Routes/SupplierRoutes");
const requestRoutes = require("./Routes/RequestRoutes");

//Admin Dashboard
const adminDashboardRoutes = require("./Routes/AdminDashboardRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

//Order
app.use("/orders", router);
app.use("/products", productRoutes);
app.use("/uploads", express.static("uploads")); // allow access to uploaded images
app.use("/api/customers", customerRoutes);

//Employee
app.use("/employees", employeeRoutes);
app.use("/daily-targets", dailyTargetRoutes);
app.use("/schedules", scheduleRoutes);
app.use("/dashboard", dashboardRoutes); // Dashboard route
app.use("/employee-dashboard-api", employeeDashboardRoutes);

//Transport
app.use("/deliveries", deliveriesRoutes);
app.use("/vehicles", vehiclesRoutes);
app.use("/drivers", driversRoutes);
app.use("/routes", routesRoutes);
app.use("/maintenances", maintenancesRoutes);
app.use("/Transportdashboard", transportdashboardRoutes);

//Inventory
app.use("/inventories",inventoryrouter);
app.use("/productionStocks", productionRouter);
app.use("/productionRequests", productionRequestRouter);
app.use("/materialStocks", materialStockRouter);
app.use("/batchStatus", batchStatusRouter);

//Supplier
app.use("/Suppliers", supplierRoutes);
app.use("/Requests", requestRoutes);

//Admin Dashboard
app.use("/api/admin-dashboard", adminDashboardRoutes);

// Connect to MongoDB and start server
mongoose.connect("mongodb+srv://admin:H41K7FVcgbD2nUpI@cluster0.hz8wtum.mongodb.net/yourDB?retryWrites=true&w=majority")
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(5000, () => console.log("Server running on port 5000"));
    })
    .catch(err => console.log("MongoDB connection error:", err));


// ===== Signup =====
app.post("/Customersignup", async (req, res) => {
    const { fullName, email, password, contactNumber, address } = req.body;
    try {
        await SignupModel.create({
            fullName, 
            email, 
            password,
            contactNumber, 
            address,
        });
        res.send({ status: "ok" });
    } catch (err) {
        res.status(500).send({ status: "err", error: err.message });
    }
});

// ===== Login =====
app.post("/Customerlogin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await SignupModel.findOne({ email });
    if (!customer) {
      return res.status(400).json({ message: "User not found" });
    }

    if (customer.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful", customer });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Admin Signup
app.post("/Adminsignup", async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    await AdminModel.create({ fullName, email, password });
    res.send({ status: "ok" });
  } catch (err) {
    res.status(500).send({ status: "err", error: err.message });
  }
});

// Admin Login
app.post("/Adminlogin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await AdminModel.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Admin not found" });

    if (admin.password !== password) return res.status(400).json({ message: "Invalid credentials" });

    res.status(200).json({ message: "Login successful", admin });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
