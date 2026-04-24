import { Router } from "express";
import { prisma } from "../../data/prismaClient.js";
import { ProductsRepository } from "../../data/repositories/products.repository.js";
import { ProductsService } from "../../business/services/products.service.js";
import { ProductsController } from "../controllers/products.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export function productsRoutes() {
  const router = Router();

  const repo = new ProductsRepository(prisma);
  const service = new ProductsService(repo);
  const controller = new ProductsController(service);

  router.get("/", controller.list);
  router.get("/categories", controller.categories);

  router.post("/questions/:questionId/answers", requireAuth, controller.addAnswer);

  router.get("/:id", controller.detail);
  router.post("/:id/reviews", requireAuth, controller.addReview);
  router.post("/:id/questions", requireAuth, controller.addQuestion);

  return router;
}