import { Router } from "express";
import { prisma } from "../../data/prismaClient.js";
import { OrdersRepository } from "../../data/repositories/orders.repository.js";
import { OrdersService } from "../../business/services/orders.service.js";
import { OrdersController } from "../controllers/orders.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export function ordersRoutes() {
  const router = Router();

  const repo = new OrdersRepository(prisma);
  const service = new OrdersService(repo, prisma);
  const controller = new OrdersController(service);

  // user (din cart DB)
  router.get("/my", requireAuth, controller.myOrders);
  router.get("/my/:id", requireAuth, controller.myOrderById);
  router.post("/checkout", requireAuth, controller.checkout);

  // guest (trimite items în body)
  router.post("/guest-checkout", controller.guestCheckout);

  return router;
}