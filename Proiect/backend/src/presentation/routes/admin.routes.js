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
  router.get("/orders/:id", requireAuth, requireAdmin, controller.getOrderById);
  router.patch("/orders/:id", requireAuth, requireAdmin, controller.updateOrder);

  router.get("/users", requireAuth, requireAdmin, controller.listUsers);
  router.patch("/users/:id", requireAuth, requireAdmin, controller.updateUser);

  router.get("/products", requireAuth, requireAdmin, controller.listProducts);
  router.post("/products", requireAuth, requireAdmin, controller.createProduct);
  router.patch("/products/:id", requireAuth, requireAdmin, controller.updateProduct);

  router.get(
    "/moderation/pending",
    requireAuth,
    requireAdmin,
    controller.listPendingModeration
  );

  router.patch(
    "/reviews/:id/approve",
    requireAuth,
    requireAdmin,
    controller.approveReview
  );

  router.patch(
    "/reviews/:id/reject",
    requireAuth,
    requireAdmin,
    controller.rejectReview
  );

  router.patch(
    "/questions/:id/approve",
    requireAuth,
    requireAdmin,
    controller.approveQuestion
  );

  router.patch(
    "/questions/:id/reject",
    requireAuth,
    requireAdmin,
    controller.rejectQuestion
  );

  router.post(
    "/questions/:id/answers",
    requireAuth,
    requireAdmin,
    controller.addOfficialAnswer
  );

  router.patch(
    "/answers/:id/approve",
    requireAuth,
    requireAdmin,
    controller.approveAnswer
  );

  router.patch(
    "/answers/:id/reject",
    requireAuth,
    requireAdmin,
    controller.rejectAnswer
  );

  return router;
}