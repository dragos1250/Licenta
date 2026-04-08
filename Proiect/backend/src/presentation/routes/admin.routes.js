import { Router } from "express";
import { AdminService } from "../../business/services/admin.service.js";
import { AdminController } from "../controllers/admin.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

export function adminRoutes() {
  const router = Router();

  const service = new AdminService();
  const controller = new AdminController(service);

  router.get("/orders", requireAuth, requireAdmin, controller.listOrders);
  router.get("/users", requireAuth, requireAdmin, controller.listUsers);
  router.get("/products", requireAuth, requireAdmin, controller.listProducts);

  return router;
}