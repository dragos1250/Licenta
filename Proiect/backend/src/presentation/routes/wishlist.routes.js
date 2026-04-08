import { Router } from "express";
import { prisma } from "../../data/prismaClient.js";
import { WishlistRepository } from "../../data/repositories/wishlist.repository.js";
import { WishlistService } from "../../business/services/wishlist.service.js";
import { WishlistController } from "../controllers/wishlist.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export function wishlistRoutes() {
  const router = Router();

  const repo = new WishlistRepository(prisma);
  const service = new WishlistService(repo, prisma);
  const controller = new WishlistController(service);

  router.get("/", requireAuth, controller.getMyWishlist);
  router.get("/count", requireAuth, controller.count);
  router.post("/items", requireAuth, controller.addItem);
  router.delete("/items/:productId", requireAuth, controller.removeItem);
  router.delete("/clear", requireAuth, controller.clear);
  router.delete("/unavailable", requireAuth, controller.removeUnavailable);

  return router;
}