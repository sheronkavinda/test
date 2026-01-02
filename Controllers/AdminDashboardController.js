const Deliveries = require("../Model/DeliveriesModel");
const Drivers = require("../Model/DriversModel");
const Vehicles = require("../Model/VehiclesModel");
const Maintenances = require("../Model/MaintenancesModel");
const Routes = require("../Model/RoutesModel");
const Order = require("../Model/OrderModel");
const Product = require("../Model/ProductModel");

// 📊 Admin Dashboard - Comprehensive Metrics
const getAdminDashboardMetrics = async (req, res) => {
  try {
    // Transport Management Metrics
    const totalDeliveries = await Deliveries.countDocuments();
    const activeVehicles = await Vehicles.countDocuments({ status: "Active" });
    const availableDrivers = await Drivers.countDocuments({ status: "Active" });
    const pendingMaintenance = await Maintenances.countDocuments({ status: "Scheduled" });
    const totalRoutes = await Routes.countDocuments({ status: "Active" });

    // Order Management Metrics
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderstatus: "Pending" });
    const deliveredOrders = await Order.countDocuments({ orderstatus: "Delivered" });
    const totalProducts = await Product.countDocuments();

    res.json({
      // Transport Metrics
      totalDeliveries,
      activeVehicles,
      availableDrivers,
      pendingMaintenance,
      totalRoutes,
      
      // Order Metrics
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalProducts
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin dashboard metrics", error: error.message });
  }
};

// 📈 Deliveries per Month - Enhanced for Admin
const getAdminDeliveriesPerMonth = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    
    // Get deliveries for current year
    const deliveries = await Deliveries.aggregate([
      {
        $match: {
          deliveriesDate: {
            $gte: new Date(`${currentYear}-01-01`),
            $lt: new Date(`${currentYear + 1}-01-01`)
          }
        }
      },
      {
        $group: {
          _id: { $month: "$deliveriesDate" },
          deliveries: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    // Fill in missing months with 0
    const formatted = [];
    for (let i = 1; i <= 12; i++) {
      const monthData = deliveries.find(d => d._id === i);
      formatted.push({
        month: months[i - 1],
        deliveries: monthData ? monthData.deliveries : 0
      });
    }

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Error fetching deliveries per month", error: error.message });
  }
};

// 🚙 Vehicle Status - Enhanced for Admin
const getAdminVehicleStatus = async (req, res) => {
  try {
    const status = await Vehicles.aggregate([
      { $group: { _id: "$status", value: { $sum: 1 } } }
    ]);

    const formatted = status.map(s => ({ 
      name: s._id, 
      value: s.value 
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Error fetching vehicle status", error: error.message });
  }
};

// 👨‍✈️ Driver Status - Enhanced for Admin
const getAdminDriverStatus = async (req, res) => {
  try {
    const status = await Drivers.aggregate([
      { $group: { _id: "$status", value: { $sum: 1 } } }
    ]);

    const formatted = status.map(s => ({ 
      name: s._id, 
      value: s.value 
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Error fetching driver status", error: error.message });
  }
};

// 📦 Recent Deliveries - Enhanced for Admin
const getAdminRecentDeliveries = async (req, res) => {
  try {
    const deliveries = await Deliveries.find()
      .sort({ deliveriesDate: -1 })
      .limit(10)
      .select('orderId customerName address deliveriesDate status');

    const formatted = deliveries.map(d => ({
      id: d.orderId,
      customer: d.customerName,
      address: d.address,
      date: d.deliveriesDate ? new Date(d.deliveriesDate).toLocaleDateString() : 'N/A',
      status: d.status
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recent deliveries", error: error.message });
  }
};

// 🔧 Maintenance History - Enhanced for Admin
const getAdminMaintenanceHistory = async (req, res) => {
  try {
    const maintenances = await Maintenances.find()
      .populate('driver', 'name')
      .sort({ scheduledDate: -1 })
      .limit(10);

    const formatted = maintenances.map(m => ({
      id: m.maintenanceId,
      vehicle: m.vehicleNumber,
      driver: m.driver ? m.driver.name : 'N/A',
      type: m.type,
      description: m.description,
      cost: m.cost,
      scheduledDate: m.scheduledDate ? new Date(m.scheduledDate).toLocaleDateString() : 'N/A',
      status: m.status
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Error fetching maintenance history", error: error.message });
  }
};

// 🛣 Routes Overview - Enhanced for Admin
const getAdminRoutesOverview = async (req, res) => {
  try {
    const routes = await Routes.find({ status: "Active" })
      .sort({ totalDistance: -1 })
      .limit(10);

    const formatted = routes.map(r => ({
      id: r.routeId,
      route: r.routeName,
      startLocation: r.startLocation,
      endLocation: r.endLocation,
      distance: `${r.totalDistance} km`,
      estimatedTime: r.estimatedTime,
      status: r.status
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Error fetching routes overview", error: error.message });
  }
};

// 📊 Order Status Distribution - New for Admin
const getOrderStatusDistribution = async (req, res) => {
  try {
    const status = await Order.aggregate([
      { $group: { _id: "$orderstatus", value: { $sum: 1 } } }
    ]);

    const formatted = status.map(s => ({ 
      name: s._id, 
      value: s.value 
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order status distribution", error: error.message });
  }
};

// 📈 Monthly Revenue - New for Admin
const getMonthlyRevenue = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    
    const revenue = await Order.aggregate([
      {
        $match: {
          orderDate: {
            $gte: new Date(`${currentYear}-01-01`),
            $lt: new Date(`${currentYear + 1}-01-01`)
          }
        }
      },
      {
        $group: {
          _id: { $month: "$orderDate" },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    // Fill in missing months with 0
    const formatted = [];
    for (let i = 1; i <= 12; i++) {
      const monthData = revenue.find(r => r._id === i);
      formatted.push({
        month: months[i - 1],
        revenue: monthData ? monthData.revenue : 0
      });
    }

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Error fetching monthly revenue", error: error.message });
  }
};

// 🏆 Top Performing Drivers - New for Admin
const getTopPerformingDrivers = async (req, res) => {
  try {
    const drivers = await Deliveries.aggregate([
      {
        $group: {
          _id: "$driverName",
          totalDeliveries: { $sum: 1 },
          completedDeliveries: {
            $sum: {
              $cond: [{ $eq: ["$status", "delivered"] }, 1, 0]
            }
          }
        }
      },
      {
        $addFields: {
          completionRate: {
            $multiply: [
              { $divide: ["$completedDeliveries", "$totalDeliveries"] },
              100
            ]
          }
        }
      },
      { $sort: { completionRate: -1 } },
      { $limit: 5 }
    ]);

    const formatted = drivers.map(d => ({
      driver: d._id || 'Unknown',
      totalDeliveries: d.totalDeliveries,
      completedDeliveries: d.completedDeliveries,
      completionRate: Math.round(d.completionRate * 100) / 100
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Error fetching top performing drivers", error: error.message });
  }
};

module.exports = {
  getAdminDashboardMetrics,
  getAdminDeliveriesPerMonth,
  getAdminVehicleStatus,
  getAdminDriverStatus,
  getAdminRecentDeliveries,
  getAdminMaintenanceHistory,
  getAdminRoutesOverview,
  getOrderStatusDistribution,
  getMonthlyRevenue,
  getTopPerformingDrivers
};
