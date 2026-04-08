import { Router } from "express";
import { prisma } from "../../data/prismaClient.js";
import { CartRepository } from "../../data/repositories/cart.repository.js";
import { CartService } from "../../business/services/cart.service.js";
import { CartController } from "../controllers/cart.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export function cartRoutes() {
  const router = Router();

  const cartRepo = new CartRepository(prisma);
  const cartService = new CartService(cartRepo, prisma);
  const cartController = new CartController(cartService);

  router.get("/", requireAuth, cartController.getCart);
  router.post("/items", requireAuth, cartController.addItem);
  router.patch("/items/:itemId", requireAuth, cartController.updateQuantity);
  router.delete("/items/:itemId", requireAuth, cartController.removeItem);
  router.delete("/", requireAuth, cartController.clear);

  return router;
}