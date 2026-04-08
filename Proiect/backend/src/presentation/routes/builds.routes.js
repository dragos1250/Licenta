import { Router } from "express";
import { prisma } from "../../data/prismaClient.js";
import { BuildsRepository } from "../../data/repositories/builds.repository.js";
import { BuildsService } from "../../business/services/builds.service.js";
import { BuildsController } from "../controllers/builds.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export function buildsRoutes() {
  const router = Router();

  const buildsRepository = new BuildsRepository(prisma);
  const buildsService = new BuildsService(buildsRepository);
  const buildsController = new BuildsController(buildsService);

  router.post("/", requireAuth, buildsController.create);
  router.get("/me", requireAuth, buildsController.listMine);
  router.delete("/:id", requireAuth, buildsController.remove);

  return router;
}