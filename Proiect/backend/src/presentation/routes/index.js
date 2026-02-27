import { Router } from "express";
import { usersRoutes } from "./users.routes.js";
import { rolesRoutes } from "./roles.routes.js";
import { authRoutes } from "./auth.routes.js";


export function registerRoutes() {
  const router = Router();

  router.use("/auth", authRoutes());
  router.use("/users", usersRoutes());
  router.use("/roles", rolesRoutes());

  return router;
}