import { Router } from "express";
import { prisma } from "../../data/prismaClient.js";
import { ConfiguratorRepository } from "../../data/repositories/configurator.repository.js";
import { ConfiguratorService } from "../../business/services/configurator.service.js";
import { ConfiguratorController } from "../controllers/configurator.controller.js";

export function configuratorRoutes() {
  const router = Router();

  const configuratorRepo = new ConfiguratorRepository(prisma);
  const configuratorService = new ConfiguratorService(configuratorRepo);
  const configuratorController = new ConfiguratorController(configuratorService);

  router.post("/compatibility", configuratorController.checkCompatibility);
  router.post("/options/:slotId", configuratorController.getCompatibleOptions);

  return router;
}