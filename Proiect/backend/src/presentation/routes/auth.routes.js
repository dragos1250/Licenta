import { Router } from "express";
import { prisma } from "../../data/prismaClient.js";
import { AuthRepository } from "../../data/repositories/auth.repository.js";
import { AuthService } from "../../business/services/auth.service.js";
import { AuthController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { Mailer } from "../../lib/mailer.js";
import { googleClient } from "../../lib/googleClient.js";

export function authRoutes() {
  const router = Router();

  const authRepository = new AuthRepository(prisma);
  const mailer = new Mailer();
  const authService = new AuthService(authRepository, {
    mailer,
    googleClient,
  });
  const authController = new AuthController(authService);

  router.post("/register", authController.register);
  router.post("/login", authController.login);
  router.post("/google", authController.googleLogin);

  router.get("/verify-email", authController.verifyEmail);
  router.post("/resend-verification", authController.resendVerificationEmail);

  router.post("/forgot-password", authController.forgotPassword);
  router.post("/reset-password", authController.resetPassword);
  router.post("/change-password", requireAuth, authController.changePassword);
  router.delete("/delete-account", requireAuth, authController.deleteAccount);

  router.get("/me", requireAuth, authController.me);
  router.post("/logout", authController.logout);

  return router;
}