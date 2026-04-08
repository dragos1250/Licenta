import { Router } from "express";
import { usersRoutes } from "./users.routes.js";
import { rolesRoutes } from "./roles.routes.js";
import { authRoutes } from "./auth.routes.js";
import { cartRoutes } from "./cart.routes.js";
import { ordersRoutes } from "./orders.routes.js";
import { productsRoutes } from "./products.routes.js";
import { wishlistRoutes } from "./wishlist.routes.js";
import { configuratorRoutes } from "./configurator.routes.js";
import { buildsRoutes } from "./builds.routes.js";
import { paymentsRoutes } from "./payments.routes.js";
import { adminRoutes } from "./admin.routes.js";

export function registerRoutes() {
  const router = Router();

  router.use("/auth", authRoutes());
  router.use("/users", usersRoutes());
  router.use("/roles", rolesRoutes());
  router.use("/cart", cartRoutes());
  router.use("/orders", ordersRoutes());
  router.use("/products", productsRoutes());
  router.use("/wishlist", wishlistRoutes());
  router.use("/configurator", configuratorRoutes());
  router.use("/builds", buildsRoutes());
  router.use("/payments", paymentsRoutes());
  router.use("/admin", adminRoutes());
  
  return router;
}