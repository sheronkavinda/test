const express = require("express");
const {
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
} = require("../Controllers/AdminDashboardController");

const router = express.Router();

// Admin Dashboard Routes
router.get("/metrics", getAdminDashboardMetrics);
router.get("/deliveries-per-month", getAdminDeliveriesPerMonth);
router.get("/vehicle-status", getAdminVehicleStatus);
router.get("/driver-status", getAdminDriverStatus);
router.get("/recent-deliveries", getAdminRecentDeliveries);
router.get("/maintenance-history", getAdminMaintenanceHistory);
router.get("/routes-overview", getAdminRoutesOverview);
router.get("/order-status-distribution", getOrderStatusDistribution);
router.get("/monthly-revenue", getMonthlyRevenue);
router.get("/top-performing-drivers", getTopPerformingDrivers);

module.exports = router;
