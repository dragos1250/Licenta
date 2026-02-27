import { Router } from "express";

import { prisma } from "../../data/prismaClient.js";
import { AuthRepository } from "../../data/repositories/auth.repository.js";
import { AuthService } from "../../business/services/auth.service.js";
import { AuthController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export function authRoutes() {
  const router = Router();

  const authRepository = new AuthRepository(prisma);
  const authService = new AuthService(authRepository);
  const authController = new AuthController(authService);

  router.post("/register", authController.register);
  router.post("/login", authController.login);
  router.get("/me", requireAuth, authController.me);
  router.post("/logout", authController.logout);

  return router;
}