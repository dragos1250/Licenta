import { Router } from "express";

import { prisma } from "../../data/prismaClient.js";
import { UsersRepository } from "../../data/repositories/users.repository.js";
import { RolesRepository } from "../../data/repositories/roles.repository.js";
import { UsersService } from "../../business/services/users.service.js";
import { UsersController } from "../controllers/users.controller.js";

export function usersRoutes() {
  const router = Router();

  const usersRepo = new UsersRepository(prisma);
  const rolesRepo = new RolesRepository(prisma);

  const usersService = new UsersService(usersRepo, rolesRepo);
  const usersController = new UsersController(usersService);

  router.get("/", usersController.getUsers);
  router.post("/", usersController.createUser);

  // asignare rol utilizator (folosește tabela UserRoles)
  router.post("/:userId/roles", usersController.assignRole);

  return router;
}