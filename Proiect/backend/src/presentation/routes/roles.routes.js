import { Router } from "express";

import { prisma } from "../../data/prismaClient.js";
import { RolesRepository } from "../../data/repositories/roles.repository.js";
import { RolesService } from "../../business/services/roles.service.js";
import { RolesController } from "../controllers/roles.controller.js";

export function rolesRoutes() {
  const router = Router();

  const rolesRepo = new RolesRepository(prisma);
  const rolesService = new RolesService(rolesRepo);
  const rolesController = new RolesController(rolesService);

  router.get("/", rolesController.getRoles);
  router.post("/", rolesController.createRole);

  return router;
}