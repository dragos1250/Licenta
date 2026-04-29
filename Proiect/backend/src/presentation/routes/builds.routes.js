import { Router } from "express";
import { prisma } from "../../data/prismaClient.js";
import { BuildsRepository } from "../../data/repositories/builds.repository.js";
import { ConfiguratorRepository } from "../../data/repositories/configurator.repository.js";
import { BuildsService } from "../../business/services/builds.service.js";
import { ConfiguratorService } from "../../business/services/configurator.service.js";
import { BuildsController } from "../controllers/builds.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

function getAuthUserId(req) {
  return (
    req.user?.id ||
    req.user?.userId ||
    req.authUser?.id ||
    req.authUser?.userId ||
    req.auth?.id ||
    req.auth?.userId ||
    req.userId
  );
}

export function buildsRoutes() {
  const router = Router();

  const buildsRepository = new BuildsRepository(prisma);
  const configuratorRepository = new ConfiguratorRepository(prisma);
  const configuratorService = new ConfiguratorService(configuratorRepository);
  const buildsService = new BuildsService(buildsRepository, configuratorService);
  const buildsController = new BuildsController(buildsService);

  router.post("/", requireAuth, buildsController.create);
  router.get("/me", requireAuth, buildsController.listMine);

  router.patch("/:id", requireAuth, async (req, res) => {
    try {
      const userId = getAuthUserId(req);

      if (!userId) {
        console.log("PATCH /builds/:id auth debug:", {
          user: req.user,
          authUser: req.authUser,
          auth: req.auth,
          userId: req.userId,
        });

        return res.status(401).json({
          error: "Neautorizat.",
        });
      }

      const updatedBuild = await buildsService.updateBuild(
        userId,
        req.params.id,
        req.body
      );

      return res.status(200).json(updatedBuild);
    } catch (error) {
      console.error("PATCH /builds/:id error:", error);

      return res.status(error.status || 500).json({
        error: error.message || "Nu am putut actualiza configurația.",
      });
    }
  });

  router.delete("/:id", requireAuth, buildsController.remove);

  return router;
}
