import { Router } from "express";
import { prisma } from "../../data/prismaClient.js";
import { AiRepository } from "../../data/repositories/ai.repository.js";
import { AiService } from "../../business/services/ai.service.js";
import { AiController } from "../controllers/ai.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export function aiRoutes() {
  const router = Router();

  const repository = new AiRepository(prisma);
  const service = new AiService(repository);
  const controller = new AiController(service);

  router.get("/usage", requireAuth, controller.usage);
  router.post("/build-assistant", requireAuth, controller.buildAssistant);

  return router;
}
