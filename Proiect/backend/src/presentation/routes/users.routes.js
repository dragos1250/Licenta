import { Router } from "express";

import { prisma } from "../../data/prismaClient.js";
import { UsersRepository } from "../../data/repositories/users.repository.js";
import { RolesRepository } from "../../data/repositories/roles.repository.js";
import { UsersService } from "../../business/services/users.service.js";
import { UsersController } from "../controllers/users.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export function usersRoutes() {
  const router = Router();

  const usersRepo = new UsersRepository(prisma);
  const rolesRepo = new RolesRepository(prisma);

  const usersService = new UsersService(usersRepo, rolesRepo);
  const usersController = new UsersController(usersService);

  router.get("/me/profile", requireAuth, usersController.getMyProfile);
  router.patch("/me/profile", requireAuth, usersController.updateMyProfile);

  router.get("/me/addresses", requireAuth, usersController.getMyAddresses);
  router.post("/me/addresses", requireAuth, usersController.createMyAddress);
  router.patch(
    "/me/addresses/:addressId",
    requireAuth,
    usersController.updateMyAddress
  );
  router.post(
    "/me/addresses/:addressId/default",
    requireAuth,
    usersController.setDefaultAddress
  );
  router.delete(
    "/me/addresses/:addressId",
    requireAuth,
    usersController.deleteMyAddress
  );

  router.get("/", usersController.getUsers);
  router.post("/", usersController.createUser);
  router.post("/:userId/roles", usersController.assignRole);

  return router;
}